from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

urlpatterns = [
   # path("fr-01/registration/", views.RegisterView.as_view(), name="registration"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),

    path("account/", views.AccountView.as_view(), name="account"),
    path("edit-information/", views.UpdateInformationView.as_view(), name="update_information"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
]
