from django.urls import path
from . import views

urlpatterns = [
   # path("fr-01/registration/", views.RegisterView.as_view(), name="registration"),
    path("register/", views.RegisterView.as_view(), name="register"),
     path("login/", views.LoginView.as_view(), name="login"),
  ## checked 
     path("logout/", views.LogoutView.as_view(), name="logout"),
]
