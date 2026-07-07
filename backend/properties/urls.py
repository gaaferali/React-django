from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView
)
from .views import (
    PropertyCreateView,
    MyPropertiesView,
    DeletePropertyView,
    ThePropertiesView,
)

urlpatterns = [
    path("addProperty/", PropertyCreateView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("my-properties/", MyPropertiesView.as_view()),
    path("properties/<int:pk>/", DeletePropertyView.as_view()),
    path("offer-display/<int:pk>/", ThePropertiesView.as_view()),
]