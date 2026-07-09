from rest_framework import serializers
from .models import Property, PropertyImage


class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = [
            "id",
            "image",
        ]

class PropertySerializer(serializers.ModelSerializer):

    images = PropertyImageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Property
        fields = [
            "id",
            "property_type",
            "owner_id",
            "transaction_type",
            "city",
            "state",
            "bedroom",
            "bathroom",
            "price",
            "description",
            "property_document",
            "images",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "images",
            "created_at",
        ]


        