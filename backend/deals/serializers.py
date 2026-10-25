from rest_framework import serializers

from properties.models import Property

from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    deal_id = serializers.IntegerField(source="id", read_only=True)
    owner_id = serializers.IntegerField(source="owner.id", read_only=True, allow_null=True)
    seeker_id = serializers.IntegerField(source="seeker.id", read_only=True, allow_null=True)
    property_id = serializers.IntegerField(source="property.id", read_only=True, allow_null=True)
    property_title = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = [
            "deal_id",
            "owner_id",
            "seeker_id",
            "property_id",
            "property_title",
            "status",
            "rating",
            "created_at",
        ]

    def get_property_title(self, obj):
        if not obj.property:
            return "Deleted property"
        return (
            f"{obj.property.transaction_type} {obj.property.property_type} "
            f"in {obj.property.city}"
        )


class DealRequestSerializer(serializers.Serializer):
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())


class DealUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=("Completed", "Rejected"),
        required=False,
    )
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Provide a status or rating.")
        return attrs
