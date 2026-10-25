from django.urls import path

from .views import (
    DeletePropertyView,
    FairPriceAverageView,
    MyPropertiesView,
    OfferRecommendationView,
    PropertyCreateView,
    PropertyDetailView,
    PropertyValidityView,
    ReportsView,
    SearchPropertiesView,
    ShowPropertiesView,
)


urlpatterns = [
    path("addProperty/", PropertyCreateView.as_view(), name="property-create"),
    path("my-properties/", MyPropertiesView.as_view(), name="my-properties"),
    path("properties/<int:pk>/", DeletePropertyView.as_view(), name="property-delete"),
    path("offer-Details/<int:pk>/", PropertyDetailView.as_view(), name="property-detail"),
    path("manage-property/<int:pk>/", DeletePropertyView.as_view(), name="manage-property"),
    path(
        "manage-property/<int:pk>/validity/",
        PropertyValidityView.as_view(),
        name="property-validity",
    ),
    path("search-for-property/", SearchPropertiesView.as_view(), name="property-search"),
    path("search-filter/", SearchPropertiesView.as_view(), name="property-filter"),
    path("offer-display/", ShowPropertiesView.as_view(), name="offer-display"),
    path(
        "offer-recommendation/",
        OfferRecommendationView.as_view(),
        name="offer-recommendation",
    ),
    path("fair-price-average/", FairPriceAverageView.as_view(), name="fair-price-average"),
    path("reports/", ReportsView.as_view(), name="reports"),
]
