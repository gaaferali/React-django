from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property
# Create your models here.
user=get_user_model()
Property= Property
class Deal(models.Model):
    owner=models.ForeignKey(user,on_delete=models.SET_NULL,null=True,blank=True,related_name="deals")
    seeker=models.ForeignKey(user,on_delete=models.SET_NULL,null=True,blank=True,related_name="seeker_deals")
    property=models.ForeignKey(Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals")
    
    STATE_CHOICES = [
        ("Completed", "Completed"),
        ("Requested", "Requested"),
        ("Rejected", "Rejected"),
    ]

    status=models.CharField(max_length=75, choices=STATE_CHOICES, default="Requested")
    created_at=models.DateTimeField(auto_now_add=True)
    rating=models.IntegerField(default=0)

