from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Deal
from .serializers import DealRequestSerializer, DealSerializer, DealUpdateSerializer


class DealRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "Seeker":
            return Response(
                {"detail": "Only seekers can request a deal."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DealRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property_obj = serializer.validated_data["property"]
        if property_obj.owner_id == request.user.id:
            return Response(
                {"detail": "You cannot request a deal for your own property."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if property_obj.valid_until < timezone.now():
            return Response(
                {"detail": "This property offer has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deal, created = Deal.objects.get_or_create(
            property=property_obj,
            seeker=request.user,
            defaults={"owner": property_obj.owner},
        )
        return Response(
            {
                "message": (
                    "Deal request sent successfully."
                    if created
                    else "A deal request already exists for this property."
                ),
                "deal": DealSerializer(deal).data,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class DealListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deals = (
            Deal.objects.filter(Q(owner=request.user) | Q(seeker=request.user))
            .select_related("owner", "seeker", "property")
            .order_by("-created_at")
        )
        return Response(DealSerializer(deals, many=True).data)


class DealUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        deal = get_object_or_404(
            Deal.objects.select_related("owner", "seeker", "property"),
            pk=pk,
        )
        if request.user.id not in {deal.owner_id, deal.seeker_id}:
            return Response(
                {"detail": "You do not have access to this deal."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DealUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data.get("status")
        rating = serializer.validated_data.get("rating")

        if new_status is not None:
            if request.user.id != deal.owner_id:
                return Response(
                    {"detail": "Only the property owner can change the deal status."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if deal.status != "Requested":
                return Response(
                    {"detail": "Only requested deals can be completed or rejected."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            deal.status = new_status

        if rating is not None:
            if request.user.id != deal.seeker_id:
                return Response(
                    {"detail": "Only the seeker can rate a completed deal."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if deal.status != "Completed":
                return Response(
                    {"detail": "Only completed deals can be rated."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if deal.rating:
                return Response(
                    {"detail": "This deal has already been rated."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            deal.rating = rating

        deal.save()
        return Response(
            {
                "message": "Deal updated successfully.",
                "deal": DealSerializer(deal).data,
            }
        )
