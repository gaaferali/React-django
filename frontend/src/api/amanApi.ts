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
  auth?: boolean;
};

export type AmanUserResponse = {
  id?: number;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
};

export type AmanAuthResponse = {
  message: string;
  access: string;
  refresh: string;
  role?: string;
  user: AmanUserResponse;
};

export type AmanProfileResponse = AmanUserResponse & {
  id: number;
};

export type AmanMessageResponse = {
  message: string;
};

async function placeholderApi<T>(endpoint: string, fallback: T, options: ApiOptions = {}): Promise<T> {
  try {
    const headers: Record<string, string> = {};

    const token = localStorage.getItem("aman_access_token");
    if (options.auth !== false && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let body: BodyInit | undefined;
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? "GET",
      headers,
      body
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
  registration: (payload: Partial<User> & { password: string; confirm_password?: string }) =>
    placeholderApi<AmanAuthResponse>(
      "/register/",
      {
        message: "User account created successfully",
        access: "placeholder-access-token",
        refresh: "placeholder-refresh-token",
        user: {
          full_name: "",
          username: "",
          email: "",
          phone_number: "",
          role: "Owner"
        }
      },
      { method: "POST", body: payload, auth: false }
    ),

  login: (payload: { username: string; password: string }) =>
    placeholderApi<AmanAuthResponse>(
      "/login/",
      {
        message: "Login successful",
        access: "placeholder-access-token",
        refresh: "placeholder-refresh-token",
        user: {
          full_name: "",
          username: payload.username,
          email: "",
          phone_number: "",
          role: "Seeker"
        }
      },
      { method: "POST", body: payload, auth: false }
    ),

  editInformation: (
    payload: Partial<User> & {
      password?: string;
      confirm_password?: string;
      current_password?: string;
    }
  ) =>
    placeholderApi<{ message: string; user: AmanUserResponse }>(
      "/edit-information/",
      {
        message: "Information updated successfully",
        user: {
          full_name: currentUser.full_name,
          username: currentUser.username,
          email: currentUser.email,
          phone_number: currentUser.phone_number,
          role: currentUser.role
        }
      },
      { method: "PATCH", body: payload }
    ),

  addProperty: (payload: FormData) =>
    placeholderApi<AmanMessageResponse>(
      "/addProperty/",
      { message: "New property offer created" },
      { method: "POST", body: payload }
    ),

  manageProperty: () => placeholderApi("/manage-property/", properties),

  deleteProperty: (propertyId: number) =>
    placeholderApi(`/manage-property/${propertyId}/`, { message: "Property deleted" }, { method: "DELETE" }),

  updatePropertyValidity: (propertyId: number) =>
    placeholderApi(`/manage-property/${propertyId}/validity/`, { message: "Property validity updated for 30 days" }, { method: "PATCH" }),

  searchForProperty: (criteria: SearchCriteria) =>
    placeholderApi(
      "/search-for-property/",
      properties.filter((property) => {
        return (!criteria.city || property.city.toLowerCase().includes(criteria.city.toLowerCase())) &&
          (!criteria.property_type || property.property_type === criteria.property_type) &&
          (!criteria.transaction_type || property.transaction_type === criteria.transaction_type);
      }),
      { method: "POST", body: criteria }
    ),

  searchFilter: (criteria: Partial<SearchCriteria>) =>
    placeholderApi("/search-filter/", properties, { method: "POST", body: criteria }),

  offerDisplay: () => placeholderApi("/offer-display/", properties.filter((property) => property.status === "Active")),

  offerDetails: (propertyId: number) =>
    placeholderApi(`/offer-display/${propertyId}/`, properties.find((property) => property.property_id === propertyId) ?? properties[0]),

  offerRecommendation: (criteria: Partial<SearchCriteria>) =>
    placeholderApi(
      "/offer-recommendation/",
      {
        message: "Search preferences saved. You will be notified when a matching property becomes available.",
        recommendations: properties.slice(0, 2)
      },
      { method: "POST", body: criteria }
    ),

  fairPriceAverage: (criteria: Partial<SearchCriteria> & { month: string }): Promise<FairPriceAverageResult> =>
    placeholderApi(
      "/fair-price-average/",
      {
        average_price: 375000,
        listing_count: 5,
        message: "Average price calculated from similar listings in the same city."
      },
      { method: "POST", body: criteria }
    ),

  contact: () => placeholderApi("/contact/", { chats, messages: chatMessages }),

  sendMessage: (payload: { chat_id: number; messages_text: string }) =>
    placeholderApi("/contact/messages/", { message: "Message delivered successfully", payload }, { method: "POST", body: payload }),

  deals: () => placeholderApi("/deals/", deals),

  sendDealRequest: (payload: { property_id: number; owner_id: number }) =>
    placeholderApi("/deals/", { message: "Deal request created with Pending status", payload }, { method: "POST", body: payload }),

  updateDealStatus: (dealId: number, status: string) =>
    placeholderApi(`/deals/${dealId}/`, { message: `Deal status changed to ${status}` }, { method: "PATCH", body: { status } }),

  reports: (reportType: ReportType) =>
    placeholderApi(`/reports/?type=${reportType}`, reportRows.filter((row) => row.type.toLowerCase().includes(reportType.slice(0, -1)))),

  getUserProfile: () =>
    placeholderApi<AmanProfileResponse>(
      "/account/",
      {
        id: currentUser.user_id,
        full_name: currentUser.full_name,
        username: currentUser.username,
        email: currentUser.email,
        phone_number: currentUser.phone_number,
        role: currentUser.role
      },
      {
        method: "GET",
        auth: true
      }
    ),

  logout: () => {
    const refresh = localStorage.getItem("aman_refresh_token");

    return placeholderApi<AmanMessageResponse>(
      "/logout/",
      { message: "User logged out successfully" },
      {
        method: "POST",
        auth: false,
        body: refresh ? { refresh } : {}
      }
    );
  }
};
