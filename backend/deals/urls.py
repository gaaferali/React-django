from django.urls import path

from .views import DealListView, DealRequestView, DealUpdateView


urlpatterns = [
    path("deals/", DealListView.as_view(), name="deal-list"),
    path("request-deals/", DealRequestView.as_view(), name="deal-request"),
    path("deals/<int:pk>/", DealUpdateView.as_view(), name="deal-update"),
]
