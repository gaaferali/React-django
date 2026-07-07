import { createBrowserRouter, Navigate } from "react-router-dom";
import { SeekerLayout } from "./components/layout/SeekerLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { OwnerLayout } from "./components/layout/OwnerLayout";


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
    children: [
      { index: true, element: <Navigate to="/login" replace /> },

      { path: "login", element: <LoginPage /> },
      { path: "registration", element: <RegistrationPage /> }
    ]
  },
  {
    path: "/owner",
    element: <OwnerLayout />,
    children: [
      { index: true, element: <Navigate to="/owner/home" replace /> },
      { path: "home", element: <OwnerHomePage /> },
      { path: "add-property", element: <AddPropertyPage /> },
      { path: "manage-property", element: <ManagePropertyPage /> },
      { path: "offerDetails/:propertyId", element: <OfferDetailsPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "logout", element: <LogoutPage /> },
      { path: "profile/edit-information", element: <EditInformationPage /> },
      { path: "contact", element: <ContactPage /> }
    ]
  },
  {
    path: "/seeker",
    element: <SeekerLayout />,
    children: [
      { index: true, element: <Navigate to="/seeker/home" replace /> },
      { path: "home", element: <SeekerHomePage /> },
      { path: "search-for-property", element: <SearchForPropertyPage /> },
      { path: "search-filter", element: <SearchFilterPage /> },
      { path: "offer-display", element: <OfferDisplayPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "offerDetails/:propertyId", element: <OfferDetailsPage /> },
      { path: "offer-recommendation", element: <OfferRecommendationPage /> },
      { path: "fair-price-average", element: <FairPriceAveragePage /> },
      { path: "profile/edit-information", element: <EditInformationPage /> },
      { path: "logout", element: <LogoutPage /> },
      { path: "contact", element: <ContactPage /> }
    ]
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "logout", element: <LogoutPage /> },
      { path: "reports", element: <ReportsPage /> }
    ]
  }

]);
