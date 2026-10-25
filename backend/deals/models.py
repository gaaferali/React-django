from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q

from properties.models import Property


User = get_user_model()


class Deal(models.Model):
    STATE_CHOICES = [
        ("Completed", "Completed"),
        ("Requested", "Requested"),
        ("Rejected", "Rejected"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    seeker = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="seeker_deals",
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    status = models.CharField(
        max_length=75,
        choices=STATE_CHOICES,
        default="Requested",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["property", "seeker"],
                condition=Q(property__isnull=False, seeker__isnull=False),
                name="unique_property_deal_per_seeker",
            )
        ]
