from rest_framework import serializers

from .models import Chat, ChatMessage


class ChatSerializer(serializers.ModelSerializer):

    property_title = serializers.CharField(
        source="property_id.title",
        read_only=True,
    )

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

    def get_last_message(self, obj):

        message = (
            obj.messages
            .order_by("-created_at")
            .first()
        )

        if not message:
            return ""

        return message.messages_text


class ChatMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatMessage

        fields = [
            "id",
            "chat",
            "sender",
            "messages_text",
            "created_at",
            "read_at",
        ]