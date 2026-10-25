from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Property, PropertyImage, PropertyPreference
from .serializers import (
    PropertyPreferenceSerializer,
    PropertySearchSerializer,
    PropertySerializer,
)


User = get_user_model()


def active_properties():
    return Property.objects.filter(valid_until__gte=timezone.now())


def validated_criteria(data):
    cleaned = {
        key: value
        for key, value in data.items()
        if value not in (None, "")
    }
    if "bedrooms" in cleaned and "bedroom" not in cleaned:
        cleaned["bedroom"] = cleaned.pop("bedrooms")
    if "bathrooms" in cleaned and "bathroom" not in cleaned:
        cleaned["bathroom"] = cleaned.pop("bathrooms")

    serializer = PropertySearchSerializer(data=cleaned)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


def filter_properties(queryset, criteria):
    exact_fields = ("transaction_type", "property_type")
    text_fields = ("state", "city")

    for field in exact_fields:
        if field in criteria:
            queryset = queryset.filter(**{field: criteria[field]})
    for field in text_fields:
        if field in criteria:
            queryset = queryset.filter(**{f"{field}__icontains": criteria[field]})
    if "bedroom" in criteria:
        queryset = queryset.filter(bedroom__gte=criteria["bedroom"])
    if "bathroom" in criteria:
        queryset = queryset.filter(bathroom__gte=criteria["bathroom"])
    if "min_price" in criteria:
        queryset = queryset.filter(price__gte=criteria["min_price"])
    if "max_price" in criteria:
        queryset = queryset.filter(price__lte=criteria["max_price"])
    if "month" in criteria:
        year, month = map(int, criteria["month"].split("-"))
        queryset = queryset.filter(created_at__year=year, created_at__month=month)
    return queryset


class PropertyCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "Owner":
            return Response(
                {"detail": "Only property owners can create property offers."},
                status=status.HTTP_403_FORBIDDEN,
            )

        images = request.FILES.getlist("images")
        if len(images) > 5:
            return Response(
                {"message": "Maximum 5 images are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PropertySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            property_obj = serializer.save(owner=request.user)
            for image in images:
                PropertyImage.objects.create(property=property_obj, image=image)

        return Response(
            PropertySerializer(property_obj).data,
            status=status.HTTP_201_CREATED,
        )


class ShowPropertiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = active_properties().select_related("owner").prefetch_related("images")
        return Response(PropertySerializer(queryset, many=True).data)


class MyPropertiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Property.objects.filter(owner=request.user).prefetch_related("images")
        return Response(PropertySerializer(queryset, many=True).data)


class PropertyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        property_obj = get_object_or_404(
            Property.objects.prefetch_related("images"),
            pk=pk,
        )
        return Response(PropertySerializer(property_obj).data)


class DeletePropertyView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        property_obj = get_object_or_404(Property, id=pk, owner=request.user)
        property_obj.delete()
        return Response({"message": "Deleted successfully."})


class PropertyValidityView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        property_obj = get_object_or_404(Property, id=pk, owner=request.user)
        property_obj.valid_until = timezone.now() + timedelta(days=30)
        property_obj.save(update_fields=["valid_until"])
        return Response(
            {
                "message": "Property validity refreshed for 30 days.",
                "valid_until": property_obj.valid_until,
            }
        )


class SearchPropertiesView(APIView):
    def post(self, request):
        criteria = validated_criteria(request.data)
        queryset = filter_properties(active_properties(), criteria).prefetch_related("images")
        return Response(PropertySerializer(queryset, many=True).data)


class FairPriceAverageView(APIView):
    def post(self, request):
        criteria = validated_criteria(request.data)
        queryset = filter_properties(active_properties(), criteria).prefetch_related("images")
        listing_count = queryset.count()
        average_price = queryset.aggregate(Avg("price"))["price__avg"]
        return Response(
            {
                "average_price": average_price,
                "listing_count": listing_count,
                "properties": PropertySerializer(queryset, many=True).data,
                "message": (
                    "Average price calculated successfully."
                    if listing_count
                    else "No matching properties found."
                ),
            }
        )


class OfferRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "Seeker":
            return Response(
                {"detail": "Only seekers can save property preferences."},
                status=status.HTTP_403_FORBIDDEN,
            )

        criteria = validated_criteria(request.data)
        nullable_fields = {"bedroom", "bathroom", "min_price", "max_price"}
        preference_data = {
            key: criteria.get(key, None if key in nullable_fields else "")
            for key in PropertyPreferenceSerializer.Meta.fields
        }
        preference, _ = PropertyPreference.objects.get_or_create(seeker=request.user)
        serializer = PropertyPreferenceSerializer(
            preference,
            data=preference_data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        recommendations = filter_properties(
            active_properties().exclude(owner=request.user),
            criteria,
        ).prefetch_related("images")
        return Response(
            {
                "message": "Preferences saved successfully.",
                "recommendations": PropertySerializer(recommendations, many=True).data,
            }
        )


class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "Admin":
            return Response(
                {"detail": "Administrator access is required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        report_type = request.query_params.get("type", "owners")
        if report_type == "owners":
            users = User.objects.filter(role="Owner").annotate(total=Count("properties"))
            rows = [
                {
                    "id": user.id,
                    "label": user.get_full_name() or user.username,
                    "type": "Owner",
                    "city": "",
                    "total": user.total,
                }
                for user in users
            ]
        elif report_type == "seekers":
            users = User.objects.filter(role="Seeker").annotate(total=Count("seeker_deals"))
            rows = [
                {
                    "id": user.id,
                    "label": user.get_full_name() or user.username,
                    "type": "Seeker",
                    "city": "",
                    "total": user.total,
                }
                for user in users
            ]
        elif report_type == "properties":
            groups = (
                Property.objects.values("city", "property_type")
                .annotate(total=Count("id"))
                .order_by("city", "property_type")
            )
            rows = [
                {
                    "id": index,
                    "label": f"{group['property_type']} in {group['city']}",
                    "type": group["property_type"],
                    "city": group["city"],
                    "total": group["total"],
                }
                for index, group in enumerate(groups, start=1)
            ]
        else:
            return Response(
                {"detail": "Report type must be owners, seekers, or properties."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(rows)
