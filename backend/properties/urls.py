from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView
)
from .views import (
    PropertyCreateView,
    MyPropertiesView,
    DeletePropertyView,
    ThePropertiesView,
    SearchPropertiesView,
    filterPropertiesView,
    ShowPropertiesView,
)

urlpatterns = [
    path("addProperty/", PropertyCreateView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("my-properties/", MyPropertiesView.as_view()),
    path("properties/<int:pk>/", DeletePropertyView.as_view()),
    path("offer-Details/<int:pk>/", ThePropertiesView.as_view()),
    path("manage-property/<int:pk>/", DeletePropertyView.as_view()),
    #path("manage-property/<int:pk>/validity/", DeletePropertyView.as_view()),
    path("search-for-property/", SearchPropertiesView.as_view()),
    path ("search-filter/", filterPropertiesView.as_view()),
    path("offer-display/", ShowPropertiesView.as_view())
]