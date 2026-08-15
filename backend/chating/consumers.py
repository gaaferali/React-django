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

        print(
            f"WebSocket connected: user={self.user.id}"
        )

    async def disconnect(self, close_code):

        if self.chat_group_name:
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name,
            )

        print(
            f"WebSocket disconnected: user={self.user.id}"
        )

    async def receive_json(
        self,
        content,
        **kwargs,
    ):

        action = content.get("action")

        # -------------------------
        # JOIN CHAT
        # -------------------------
        if action == "join_chat":

            await self.join_chat(
                content.get("chat_id")
            )

            return

        # -------------------------
        # SEND MESSAGE
        # -------------------------
        if action == "send_message":

            await self.send_message(
                content.get("chat_id"),
                content.get("messages_text"),
            )

            return

        await self.send_json({
            "error": "Unknown action",
        })

    async def join_chat(
        self,
        chat_id,
    ):

        if not chat_id:
            await self.send_json({
                "error": "chat_id is required",
            })
            return

        # Make sure this user belongs to this chat
        chat = await self.get_user_chat(chat_id)

        if not chat:
            await self.send_json({
                "error": "Chat not found or access denied",
            })
            return

        # Leave previous chat
        if self.chat_group_name:

            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name,
            )

        # Join new chat
        self.chat_group_name = f"chat_{chat.id}"

        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name,
        )

        await self.send_json({
            "type": "chat_joined",
            "chat_id": chat.id,
        })

        print(
            f"User {self.user.id} joined chat {chat.id}"
        )

    async def send_message(
        self,
        chat_id,
        message_text,
    ):

        if not chat_id:
            await self.send_json({
                "error": "chat_id is required",
            })
            return

        if not message_text:
            await self.send_json({
                "error": "messages_text is required",
            })
            return

        message_text = message_text.strip()

        if not message_text:
            await self.send_json({
                "error": "Message cannot be empty",
            })
            return

        # Verify user has access to this chat
        chat = await self.get_user_chat(chat_id)

        if not chat:
            await self.send_json({
                "error": "Chat not found or access denied",
            })
            return

        group_name = f"chat_{chat.id}"

        # Make sure the user has joined this chat
        if self.chat_group_name != group_name:

            await self.send_json({
                "error": "You must join the chat first",
            })
            return

        # Create database message
        message = await self.create_message(
            chat,
            message_text,
        )

        # Send message to everyone in this chat
        await self.channel_layer.group_send(
            group_name,
            {
                "type": "chat.message",
                "message_id": message.id,
                "chat_id": chat.id,
                "sender_user_id": self.user.id,
                "messages_text": message.messages_text,
                "created_at": message.created_at.isoformat(),
                "read_at": None,
            },
        )

    async def chat_message(
        self,
        event,
    ):

        await self.send_json({
            "message_id": event["message_id"],
            "chat_id": event["chat_id"],
            "sender_user_id": event["sender_user_id"],
            "messages_text": event["messages_text"],
            "created_at": event["created_at"],
            "read_at": event["read_at"],
        })

    @database_sync_to_async
    def get_user_chat(
        self,
        chat_id,
    ):

        return (
            Chat.objects
            .filter(
                id=chat_id,
                seeker_id=self.user,
            )
            .first()
            or
            Chat.objects
            .filter(
                id=chat_id,
                owner_id=self.user,
            )
            .first()
        )

    @database_sync_to_async
    def create_message(
        self,
        chat,
        message_text,
    ):

        message = ChatMessage.objects.create(
            chat=chat,
            sender=self.user,
            messages_text=message_text,
        )

        chat.save(
            update_fields=[
                "updated_at",
            ]
        )

        return message