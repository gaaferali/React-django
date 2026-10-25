from rest_framework import serializers
from .models import Property, PropertyImage, PropertyPreference

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
    owner_id = serializers.IntegerField(read_only=True)

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
            "valid_until",
        ]

        read_only_fields = [
            "id",
            "images",
            "created_at",
            "valid_until",
        ]


class PropertySearchSerializer(serializers.Serializer):
    transaction_type = serializers.ChoiceField(
        choices=Property.TRANSACTION_CHOICES,
        required=False,
    )
    property_type = serializers.ChoiceField(
        choices=Property.PROPERTY_CHOICES,
        required=False,
    )
    state = serializers.CharField(required=False, max_length=75)
    city = serializers.CharField(required=False, max_length=75)
    bedroom = serializers.IntegerField(required=False, min_value=0)
    bathroom = serializers.IntegerField(required=False, min_value=0)
    min_price = serializers.IntegerField(required=False, min_value=0)
    max_price = serializers.IntegerField(required=False, min_value=0)
    month = serializers.RegexField(
        r"^\d{4}-(0[1-9]|1[0-2])$",
        required=False,
    )

    def validate(self, attrs):
        minimum = attrs.get("min_price")
        maximum = attrs.get("max_price")
        if minimum is not None and maximum is not None and minimum > maximum:
            raise serializers.ValidationError(
                {"max_price": "Maximum price must be greater than minimum price."}
            )
        return attrs


class PropertyPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyPreference
        fields = [
            "transaction_type",
            "property_type",
            "state",
            "city",
            "bedroom",
            "bathroom",
            "min_price",
            "max_price",
        ]
