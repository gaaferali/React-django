from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Q

from properties.models import Property


User = get_user_model()


class Chat(models.Model):
    property_id = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="chats",
    )
    seeker_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="seeker_chats",
    )
    owner_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owner_chats",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["property_id", "seeker_id"],
                name="unique_property_seeker_chat",
            )
        ]


class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_chat_messages",
    )
    client_message_id = models.CharField(max_length=64, null=True, blank=True)
    messages_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["chat", "sender", "client_message_id"],
                condition=Q(client_message_id__isnull=False, sender__isnull=False),
                name="unique_client_message_per_chat_sender",
            )
        ]

    def __str__(self):
        return f"Message {self.id} in Chat {self.chat_id}"
