from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import IdempotencyRecord, User
from chating.models import Chat, ChatMessage
from deals.models import Deal
from properties.models import Property, PropertyPreference


PASSWORD = "StrongPass!5831"


def create_user(username, role):
    return User.objects.create_user(
        username=username,
        password=PASSWORD,
        email=f"{username}@example.com",
        phone_number="+249000000000",
        role=role,
        first_name=username.title(),
    )


class AmanApiIntegrationTests(APITestCase):
    def setUp(self):
        self.owner = create_user("owner", "Owner")
        self.other_owner = create_user("otherowner", "Owner")
        self.seeker = create_user("seeker", "Seeker")
        self.admin = create_user("admin", "Admin")
        self.property = Property.objects.create(
            owner=self.owner,
            property_type="Apartment",
            transaction_type="Rent",
            city="Khartoum",
            state="Khartoum",
            bedroom=3,
            bathroom=2,
            price=500000,
            description="Three-bedroom apartment",
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_public_registration_rejects_admin_accounts(self):
        response = self.client.post(
            "/api/register/",
            {
                "full_name": "Public Administrator",
                "username": "public-admin",
                "email": "public-admin@example.com",
                "phone_number": "+249111111111",
                "role": "Admin",
                "password": PASSWORD,
                "confirm_password": PASSWORD,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="public-admin").exists())

    def test_superusers_are_assigned_the_admin_role(self):
        superuser = User.objects.create_superuser(
            username="superuser",
            password=PASSWORD,
            email="superuser@example.com",
        )
        self.assertEqual(superuser.role, "Admin")

    def test_profile_update_cannot_escalate_account_role(self):
        self.authenticate(self.seeker)
        response = self.client.patch(
            "/api/edit-information/",
            {"role": "Admin"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.seeker.refresh_from_db()
        self.assertEqual(self.seeker.role, "Seeker")

    def test_password_reset_requires_a_new_password(self):
        self.authenticate(self.seeker)
        response = self.client.patch("/api/reset-password/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_property_creation_is_replayed_for_same_idempotency_key(self):
        self.authenticate(self.owner)
        payload = {
            "property_type": "House",
            "transaction_type": "Buy",
            "city": "Omdurman",
            "state": "Khartoum",
            "bedroom": 4,
            "bathroom": 3,
            "price": 1200000,
            "description": "Family home",
        }
        first = self.client.post(
            "/api/addProperty/",
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="property-create-1",
        )
        second = self.client.post(
            "/api/addProperty/",
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="property-create-1",
        )

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second["Idempotency-Replayed"], "true")
        self.assertEqual(Property.objects.filter(description="Family home").count(), 1)
        self.assertEqual(IdempotencyRecord.objects.count(), 1)

    def test_idempotency_key_cannot_be_reused_with_another_payload(self):
        self.authenticate(self.owner)
        payload = {
            "property_type": "House",
            "transaction_type": "Buy",
            "city": "Omdurman",
            "state": "Khartoum",
            "bedroom": 4,
            "bathroom": 3,
            "price": 1200000,
            "description": "Original request",
        }
        self.client.post(
            "/api/addProperty/",
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="property-create-conflict",
        )
        payload["description"] = "Changed request"
        conflict = self.client.post(
            "/api/addProperty/",
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="property-create-conflict",
        )
        self.assertEqual(conflict.status_code, status.HTTP_409_CONFLICT)
        self.assertFalse(Property.objects.filter(description="Changed request").exists())

    def test_search_accepts_page_field_names_and_ignores_empty_filters(self):
        response = self.client.post(
            "/api/search-for-property/",
            {"bedroom": "2", "bathroom": "", "city": "khar"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [self.property.id])

    def test_owner_can_refresh_only_their_property(self):
        self.authenticate(self.owner)
        before = self.property.valid_until
        response = self.client.patch(
            f"/api/manage-property/{self.property.id}/validity/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.property.refresh_from_db()
        self.assertGreater(self.property.valid_until, before)

        self.authenticate(self.other_owner)
        denied = self.client.patch(
            f"/api/manage-property/{self.property.id}/validity/",
            {},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_404_NOT_FOUND)

    def test_recommendations_are_saved_and_return_matching_properties(self):
        self.authenticate(self.seeker)
        response = self.client.post(
            "/api/offer-recommendation/",
            {"transaction_type": "Rent", "city": "Khartoum", "bedroom": 2},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["recommendations"][0]["id"], self.property.id)
        self.assertTrue(PropertyPreference.objects.filter(seeker=self.seeker).exists())

    def test_deal_contract_authorization_and_status_update(self):
        self.authenticate(self.seeker)
        created = self.client.post(
            "/api/request-deals/",
            {"property": self.property.id},
            format="json",
            HTTP_IDEMPOTENCY_KEY="deal-request-1",
        )
        replayed = self.client.post(
            "/api/request-deals/",
            {"property": self.property.id},
            format="json",
            HTTP_IDEMPOTENCY_KEY="deal-request-1",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(replayed["Idempotency-Replayed"], "true")
        self.assertEqual(Deal.objects.count(), 1)
        deal_id = created.data["deal"]["deal_id"]

        denied = self.client.patch(
            f"/api/deals/{deal_id}/",
            {"status": "Completed"},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.authenticate(self.owner)
        updated = self.client.patch(
            f"/api/deals/{deal_id}/",
            {"status": "Completed"},
            format="json",
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["deal"]["status"], "Completed")

        self.authenticate(self.seeker)
        rated = self.client.patch(
            f"/api/deals/{deal_id}/",
            {"rating": 5},
            format="json",
        )
        self.assertEqual(rated.status_code, status.HTTP_200_OK)
        self.assertEqual(rated.data["deal"]["rating"], 5)

        duplicate_rating = self.client.patch(
            f"/api/deals/{deal_id}/",
            {"rating": 4},
            format="json",
        )
        self.assertEqual(duplicate_rating.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reports_are_admin_only_and_match_frontend_shape(self):
        self.authenticate(self.seeker)
        denied = self.client.get("/api/reports/?type=owners")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.authenticate(self.admin)
        response = self.client.get("/api/reports/?type=properties")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data[0]),
            {"id", "label", "type", "city", "total"},
        )

    def test_contact_is_repeatable_and_serializes_property_title(self):
        self.authenticate(self.seeker)
        first = self.client.get(f"/api/chating/contact/?property_id={self.property.id}")
        second = self.client.get(f"/api/chating/contact/?property_id={self.property.id}")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(Chat.objects.count(), 1)
        self.assertEqual(
            first.data["chats"][0]["property_title"],
            "Rent Apartment in Khartoum",
        )

    def test_chat_client_message_id_is_unique_per_sender_and_chat(self):
        chat = Chat.objects.create(
            property_id=self.property,
            owner_id=self.owner,
            seeker_id=self.seeker,
        )
        ChatMessage.objects.create(
            chat=chat,
            sender=self.seeker,
            client_message_id="message-1",
            messages_text="Hello",
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ChatMessage.objects.create(
                    chat=chat,
                    sender=self.seeker,
                    client_message_id="message-1",
                    messages_text="Duplicate",
                )

    def test_expired_properties_are_hidden_from_public_search(self):
        self.property.valid_until = timezone.now()
        self.property.save(update_fields=["valid_until"])
        response = self.client.post("/api/search-for-property/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
