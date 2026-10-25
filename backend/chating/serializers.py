from rest_framework import serializers

from .models import Chat, ChatMessage


class ChatSerializer(serializers.ModelSerializer):
    property_title = serializers.SerializerMethodField()
    seeker_name = serializers.CharField(
        source="seeker_id.username",
        read_only=True,
        allow_null=True,
    )
    owner_name = serializers.CharField(
        source="owner_id.username",
        read_only=True,
        allow_null=True,
    )
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "property_id",
            "property_title",
            "seeker_id",
            "seeker_name",
            "owner_id",
            "owner_name",
            "created_at",
            "updated_at",
            "last_message",
        ]

    def get_property_title(self, obj):
        property_obj = obj.property_id
        return (
            f"{property_obj.transaction_type} {property_obj.property_type} "
            f"in {property_obj.city}"
        )

    def get_last_message(self, obj):
        message = obj.messages.order_by("-created_at").first()
        return message.messages_text if message else ""


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "chat",
            "sender",
            "client_message_id",
            "messages_text",
            "created_at",
            "read_at",
        ]
