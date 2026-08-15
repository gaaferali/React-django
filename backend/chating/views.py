from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from properties.models import Property

from .models import Chat, ChatMessage
from .serializers import (
    ChatSerializer,
    ChatMessageSerializer,
)


class ContactView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        property_id = request.query_params.get(
            "property_id"
        )

        # ------------------------------------------------
        # 1. Property was selected
        # ------------------------------------------------

        if property_id:

            try:
                property_obj = Property.objects.get(
                    id=property_id
                )

            except Property.DoesNotExist:

                return Response(
                    {
                        "detail": "Property not found."
                    },
                    status=404,
                )

            # --------------------------------------------
            # Seeker opens Contact from a Property
            # --------------------------------------------

            # IMPORTANT:
            # Change "owner" below if your Property model
            # uses another field name for the owner.
            owner = property_obj.owner

            if user.id != owner.id:

                chat, created = Chat.objects.get_or_create(
                    property_id=property_obj,
                    seeker_id=user,
                    defaults={
                        "owner_id": owner,
                    },
                )

            else:

                # Owner opened a property that he owns.
                # Do not create a chat with himself.
                chat = None

        # ------------------------------------------------
        # 2. Get ALL chats belonging to current user
        # ------------------------------------------------

        chats = (
            Chat.objects
            .filter(
                seeker_id=user
            )
            |
            Chat.objects.filter(
                owner_id=user
            )
        ).distinct().select_related(
            "property_id",
            "seeker_id",
            "owner_id",
        ).order_by(
            "-updated_at"
        )

        # ------------------------------------------------
        # 3. Get messages from user's chats
        # ------------------------------------------------

        messages = (
            ChatMessage.objects
            .filter(
                chat__in=chats
            )
            .select_related(
                "chat",
                "sender",
            )
            .order_by(
                "created_at"
            )
        )

        return Response(
            {
                "chats": ChatSerializer(
                    chats,
                    many=True,
                ).data,

                "messages": ChatMessageSerializer(
                    messages,
                    many=True,
                ).data,
            }
        )