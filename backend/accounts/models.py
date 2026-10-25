from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone_number = models.CharField(max_length=20)
    #id_number = models.CharField(max_length=30, unique=True)

    ROLE_CHOICES = [
        ("Owner", "Owner"),
        ("Seeker", "Seeker"),
        ("Admin", "Admin"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "Admin"
        super().save(*args, **kwargs)


class IdempotencyRecord(models.Model):
    """Stores completed mutation responses so safe retries can be replayed."""

    PROCESSING = "processing"
    COMPLETED = "completed"
    STATE_CHOICES = [
        (PROCESSING, "Processing"),
        (COMPLETED, "Completed"),
    ]

    key = models.CharField(max_length=255)
    scope_hash = models.CharField(max_length=64)
    request_hash = models.CharField(max_length=64)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=512)
    state = models.CharField(
        max_length=20,
        choices=STATE_CHOICES,
        default=PROCESSING,
    )
    response_status = models.PositiveSmallIntegerField(null=True, blank=True)
    response_body = models.JSONField(null=True, blank=True)
    content_type = models.CharField(max_length=255, default="application/json")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["scope_hash", "key"],
                name="unique_idempotency_key_per_scope",
            )
        ]
        indexes = [models.Index(fields=["created_at"])]
