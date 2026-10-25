from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


def default_property_valid_until():
    return timezone.now() + timedelta(days=30)


class Property(models.Model):

    PROPERTY_CHOICES = [
        ("Apartment", "Apartment"),
        ("House", "House"),
        ("Land", "Land"),
    ]

    TRANSACTION_CHOICES = [
        ("Buy", "Buy"),
        ("Rent", "Rent"),
    ]

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="properties"
    )

    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_CHOICES
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_CHOICES
    )

    city = models.CharField(max_length=75)

    state = models.CharField(max_length=75)

    bedroom = models.PositiveIntegerField()

    bathroom = models.PositiveIntegerField()

    price = models.PositiveIntegerField()

    description = models.TextField()

    property_document = models.ImageField(
        upload_to="documentPhoto/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    valid_until = models.DateTimeField(default=default_property_valid_until)

    def __str__(self):
        return f"{self.property_type} - {self.city}"
    
    
class PropertyImage(models.Model):

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="propertyPhotos/"
    )

    def __str__(self):
        return f"Image {self.id} - Property {self.property.id}"


class PropertyPreference(models.Model):
    seeker = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="property_preference",
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=Property.TRANSACTION_CHOICES,
        blank=True,
    )
    property_type = models.CharField(
        max_length=20,
        choices=Property.PROPERTY_CHOICES,
        blank=True,
    )
    state = models.CharField(max_length=75, blank=True)
    city = models.CharField(max_length=75, blank=True)
    bedroom = models.PositiveIntegerField(null=True, blank=True)
    bathroom = models.PositiveIntegerField(null=True, blank=True)
    min_price = models.PositiveIntegerField(null=True, blank=True)
    max_price = models.PositiveIntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
