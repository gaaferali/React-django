from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

from properties.models import Property
user = get_user_model()
Property= Property



class Chat(models.Model):
    property_id = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="chats")
    seeker_id = models.ForeignKey(user,on_delete=models.SET_NULL,null=True,blank=True,related_name="seeker_chats")
    owner_id = models.ForeignKey(user,on_delete=models.SET_NULL,null=True,blank=True,related_name="owner_chats")
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
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        user,on_delete=models.SET_NULL,null=True,blank=True,related_name="sent_chat_messages",)

    messages_text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )
    
    def __str__(self):
        return f"Message {self.id} in Chat {self.chat_id}"
    
# Create your models here.
