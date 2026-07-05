from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


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