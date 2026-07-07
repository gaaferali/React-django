from django.shortcuts import render
# Create your views here.
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Property, PropertyImage
from .serializers import PropertySerializer


class PropertyCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        images = request.FILES.getlist("images")
        if len(images) > 5:
            return Response(
                {"message": "Maximum 5 images are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PropertySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property = serializer.save(owner=request.user)

        for image in images:
            PropertyImage.objects.create(
                property=property,
                image=image,
            )

        return Response(
            PropertySerializer(property).data,
            status=status.HTTP_201_CREATED,
        )
    
class MyPropertiesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        queryset = Property.objects.filter(
            owner=request.user
        )

        serializer = PropertySerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)
class ThePropertiesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        property = Property.objects.filter(
            id=pk
        ).first()

        if property is None:

            return Response(
                {
                    "message": "Property not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PropertySerializer(property)

        return Response(serializer.data)
        
class DeletePropertyView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        property = Property.objects.filter(
            id=pk,
            owner=request.user
        ).first()

        if property is None:

            return Response(
                {
                    "message": "Property not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        property.delete()

        return Response(
            {
                "message": "Deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
