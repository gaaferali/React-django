from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone_number = models.CharField(max_length=20)
    id_number = models.CharField(max_length=30, unique=True)

    ROLE_CHOICES = [
        ("Owner", "Owner"),
        ("Seeker", "Seeker"),
        ("Admin", "Admin"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
