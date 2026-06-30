import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AddPropertyPage } from "./pages/AddPropertyPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ContactPage } from "./pages/ContactPage";
import { DealsPage } from "./pages/DealsPage";
import { EditInformationPage } from "./pages/EditInformationPage";
import { FairPriceAveragePage } from "./pages/FairPriceAveragePage";
import { LoginPage } from "./pages/LoginPage";
import { LogoutPage } from "./pages/LogoutPage";
import { ManagePropertyPage } from "./pages/ManagePropertyPage";
import { OfferDetailsPage } from "./pages/OfferDetailsPage";
import { OfferDisplayPage } from "./pages/OfferDisplayPage";
import { OfferRecommendationPage } from "./pages/OfferRecommendationPage";
import { OwnerHomePage } from "./pages/OwnerHomePage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SearchFilterPage } from "./pages/SearchFilterPage";
import { SearchForPropertyPage } from "./pages/SearchForPropertyPage";
import { SeekerHomePage } from "./pages/SeekerHomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/seeker/home" replace /> },
      { path: "registration", element: <RegistrationPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "profile/edit-information", element: <EditInformationPage /> },
      { path: "owner/home", element: <OwnerHomePage /> },
      { path: "owner/add-property", element: <AddPropertyPage /> },
      { path: "owner/manage-property", element: <ManagePropertyPage /> },
      { path: "seeker/home", element: <SeekerHomePage /> },
      { path: "seeker/search-for-property", element: <SearchForPropertyPage /> },
      { path: "seeker/search-filter", element: <SearchFilterPage /> },
      { path: "seeker/offer-display", element: <OfferDisplayPage /> },
      { path: "seeker/offer-display/:propertyId", element: <OfferDetailsPage /> },
      { path: "seeker/offer-recommendation", element: <OfferRecommendationPage /> },
      { path: "seeker/fair-price-average", element: <FairPriceAveragePage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "admin/dashboard", element: <AdminDashboardPage /> },
      { path: "admin/reports", element: <ReportsPage /> },
      { path: "logout", element: <LogoutPage /> }
    ]
  }
]);
