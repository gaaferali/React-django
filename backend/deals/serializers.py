from rest_framework import serializers
from .models import Deal
class DealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal
        fields = [
            "id",
            "owner",
            "seeker",
            "property",
            "status",
            "rating",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]
