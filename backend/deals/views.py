from django.shortcuts import render
# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Deal
from .serializers import DealSerializer
#from properties.models import Property
from django.db.models import Q


class DealRequestView(generics.CreateAPIView):
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        property = serializer.validated_data["property"]

        serializer.save(
            seeker=self.request.user,
            owner=property.owner
        )


class DealListView(generics.ListAPIView):
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Deal.objects.filter(
            Q(owner=self.request.user) |
            Q(seeker=self.request.user)
        ).order_by("-created_at")
    
class DealUpdateView(generics.UpdateAPIView):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]