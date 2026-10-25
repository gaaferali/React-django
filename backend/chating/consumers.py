from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import Chat, ChatMessage


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.chat_group_name = None
        if (
            not self.user
            or isinstance(self.user, AnonymousUser)
            or not self.user.is_authenticated
        ):
            await self.close(code=4001)
            return
        await self.accept()

    async def disconnect(self, close_code):
        if self.chat_group_name:
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name,
            )

    async def receive_json(self, content, **kwargs):
        action = content.get("action")
        if action == "join_chat":
            await self.join_chat(content.get("chat_id"))
            return
        if action == "send_message":
            await self.send_message(
                content.get("chat_id"),
                content.get("messages_text"),
                content.get("client_message_id"),
            )
            return
        await self.send_json({"error": "Unknown action"})

    async def join_chat(self, chat_id):
        if not chat_id:
            await self.send_json({"error": "chat_id is required"})
            return
        chat = await self.get_user_chat(chat_id)
        if not chat:
            await self.send_json({"error": "Chat not found or access denied"})
            return
        if self.chat_group_name:
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name,
            )
        self.chat_group_name = f"chat_{chat.id}"
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name,
        )
        await self.send_json({"type": "chat_joined", "chat_id": chat.id})

    async def send_message(self, chat_id, message_text, client_message_id):
        if not chat_id:
            await self.send_json({"error": "chat_id is required"})
            return
        if not isinstance(message_text, str) or not message_text.strip():
            await self.send_json({"error": "messages_text is required"})
            return
        if not isinstance(client_message_id, str) or not client_message_id.strip():
            await self.send_json({"error": "client_message_id is required"})
            return
        if len(client_message_id) > 64:
            await self.send_json({"error": "client_message_id is too long"})
            return

        message_text = message_text.strip()
        client_message_id = client_message_id.strip()
        chat = await self.get_user_chat(chat_id)
        if not chat:
            await self.send_json({"error": "Chat not found or access denied"})
            return

        group_name = f"chat_{chat.id}"
        if self.chat_group_name != group_name:
            await self.send_json({"error": "You must join the chat first"})
            return

        message, created = await self.create_message(
            chat,
            message_text,
            client_message_id,
        )
        if not created and message.messages_text != message_text:
            await self.send_json(
                {"error": "client_message_id was already used for another message"}
            )
            return

        event = {
            "type": "chat.message",
            "message_id": message.id,
            "client_message_id": message.client_message_id,
            "chat_id": chat.id,
            "sender_user_id": self.user.id,
            "messages_text": message.messages_text,
            "created_at": message.created_at.isoformat(),
            "read_at": message.read_at.isoformat() if message.read_at else None,
            "replayed": not created,
        }
        if created:
            await self.channel_layer.group_send(group_name, event)
        else:
            await self.chat_message(event)

    async def chat_message(self, event):
        await self.send_json(
            {
                "message_id": event["message_id"],
                "client_message_id": event["client_message_id"],
                "chat_id": event["chat_id"],
                "sender_user_id": event["sender_user_id"],
                "messages_text": event["messages_text"],
                "created_at": event["created_at"],
                "read_at": event["read_at"],
                "replayed": event.get("replayed", False),
            }
        )

    @database_sync_to_async
    def get_user_chat(self, chat_id):
        return (
            Chat.objects.filter(id=chat_id, seeker_id_id=self.user.id).first()
            or Chat.objects.filter(id=chat_id, owner_id_id=self.user.id).first()
        )

    @database_sync_to_async
    def create_message(self, chat, message_text, client_message_id):
        message, created = ChatMessage.objects.get_or_create(
            chat=chat,
            sender=self.user,
            client_message_id=client_message_id,
            defaults={"messages_text": message_text},
        )
        if created:
            chat.save(update_fields=["updated_at"])
        return message, created
