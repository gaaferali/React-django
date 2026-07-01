import { chatMessages, chats, currentUser, deals, properties, reportRows } from "../data/mockData";
import type {
  FairPriceAverageResult,
  ReportType,
  SearchCriteria,
  User
} from "../types/aman";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

async function placeholderApi<T>(endpoint: string, fallback: T, options: ApiOptions = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("aman_access_token") ?? "placeholder-jwt"}`
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: `Request failed: ${endpoint}` }));
      throw new Error(JSON.stringify(errorBody));
    }

    return (await response.json()) as T;
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
    return fallback;
  }
}

export const amanApi = {
  registration: (payload: Partial<User> & { password: string }) =>
    placeholderApi("/fr-01/registration/", { message: "User account created successfully", user: payload }, { method: "POST", body: payload }),

  login: (payload: { username: string; password: string; role: string }) =>
    placeholderApi("/fr-02/login/", { access: "placeholder-access-token", refresh: "placeholder-refresh-token", role: payload.role }, { method: "POST", body: payload }),

  editInformation: (payload: Partial<User>) =>
    placeholderApi("/fr-03/edit-information/", { message: "Information updated successfully", user: { ...currentUser, ...payload } }, { method: "PATCH", body: payload }),

  addProperty: (payload: FormData) =>
    placeholderApi("/fr-04/add-property/", { message: "New property offer created", property_id: 104 }, { method: "POST", body: Object.fromEntries(payload.entries()) }),

  manageProperty: () => placeholderApi("/fr-05/manage-property/", properties),

  deleteProperty: (propertyId: number) =>
    placeholderApi(`/fr-05/manage-property/${propertyId}/`, { message: "Property deleted" }, { method: "DELETE" }),

  updatePropertyValidity: (propertyId: number) =>
    placeholderApi(`/fr-05/manage-property/${propertyId}/validity/`, { message: "Property validity updated for 30 days" }, { method: "PATCH" }),

  searchForProperty: (criteria: SearchCriteria) =>
    placeholderApi("/fr-06/search-for-property/", properties.filter((property) => {
      return (!criteria.city || property.city.toLowerCase().includes(criteria.city.toLowerCase())) &&
        (!criteria.property_type || property.property_type === criteria.property_type) &&
        (!criteria.transaction_type || property.transaction_type === criteria.transaction_type);
    }), { method: "POST", body: criteria }),

  searchFilter: (criteria: Partial<SearchCriteria>) =>
    placeholderApi("/fr-07/search-filter/", properties, { method: "POST", body: criteria }),

  offerDisplay: () => placeholderApi("/fr-08/offer-display/", properties.filter((property) => property.status === "Active")),

  offerDetails: (propertyId: number) =>
    placeholderApi(`/fr-08/offer-display/${propertyId}/`, properties.find((property) => property.property_id === propertyId) ?? properties[0]),

  offerRecommendation: (criteria: Partial<SearchCriteria>) =>
    placeholderApi("/fr-09/offer-recommendation/", {
      message: "Search preferences saved. You will be notified when a matching property becomes available.",
      recommendations: properties.slice(0, 2)
    }, { method: "POST", body: criteria }),

  fairPriceAverage: (criteria: Partial<SearchCriteria> & { month: string }): Promise<FairPriceAverageResult> =>
    placeholderApi("/fr-10/fair-price-average/", {
      average_price: 375000,
      listing_count: 5,
      message: "Average price calculated from similar listings in the same city."
    }, { method: "POST", body: criteria }),

  contact: () => placeholderApi("/fr-11/contact/", { chats, messages: chatMessages }),

  sendMessage: (payload: { chat_id: number; messages_text: string }) =>
    placeholderApi("/fr-11/contact/messages/", { message: "Message delivered successfully", payload }, { method: "POST", body: payload }),

  deals: () => placeholderApi("/fr-12/deals/", deals),

  sendDealRequest: (payload: { property_id: number; owner_id: number }) =>
    placeholderApi("/fr-12/deals/", { message: "Deal request created with Pending status", payload }, { method: "POST", body: payload }),

  updateDealStatus: (dealId: number, status: string) =>
    placeholderApi(`/fr-12/deals/${dealId}/`, { message: `Deal status changed to ${status}` }, { method: "PATCH", body: { status } }),

  reports: (reportType: ReportType) =>
    placeholderApi(`/fr-13/reports/?type=${reportType}`, reportRows.filter((row) => row.type.toLowerCase().includes(reportType.slice(0, -1)))),

  logout: () => placeholderApi("/fr-14/logout/", { message: "User logged out successfully" }, { method: "POST" })
};
