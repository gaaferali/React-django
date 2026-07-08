import { chatMessages, chats, deals, reportRows } from "../data/mockData";
import type {
  FairPriceAverageResult,
  ReportType,
  SearchCriteria,
  User,
  Property
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






export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {

  const headers: Record<string, string> = {};

  // Add JWT token if authentication is required
  const token = localStorage.getItem("aman_access_token");

  if (options.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }


  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } 
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }


  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method ?? "GET",
    headers,
    body
  });


  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({
        detail: `Request failed: ${endpoint}`
      }));

    throw new Error(JSON.stringify(errorData));
  }


  return (await response.json()) as T;
}

export const amanApi = {
  registration: (payload: Partial<User> & { password: string; confirm_password?: string }) =>
    api<AmanAuthResponse>(
      "/register/",
      { method: "POST", body: payload, auth: false }
    ),

  login: (payload: { username: string; password: string }) =>
    api<AmanAuthResponse>(
      "/login/",
      { method: "POST", body: payload, auth: false }
    ),

  editInformation: (
    payload: Partial<User> & {
      username?: string;
      email?: string;
      phone_number?: string;
      full_name?: string;
      password?: string;
      confirm_password?: string;
      current_password?: string;
    }
  ) =>
    api<{ message: string; user: AmanUserResponse }>(
      "/edit-information/",
      { method: "PATCH",  
             auth: true,
             body: payload }
    ),

  addProperty: (payload: FormData) =>
    api<AmanMessageResponse>(
      "/addProperty/",
      { method: "POST", body: payload }
    ),

  manageProperty: () =>
    api<Property[]>(
      "/my-properties/",
      {
        method: "GET",
        auth: true
      }
    ),

  deleteProperty: (propertyId: number) =>
    api<AmanMessageResponse>(`/manage-property/${propertyId}/`,  { method: "DELETE" ,auth: true}),

  updatePropertyValidity: (propertyId: number) =>
    api<AmanMessageResponse>(`/manage-property/${propertyId}/validity/`, { method: "PATCH" }),

  searchForProperty: (criteria: SearchCriteria) =>
    api<Property[]>(
    "/search-for-property/",
      { method: "POST", body: criteria }
    ),

  searchFilter: (criteria: Partial<SearchCriteria>) =>
  api<Property[]>(
    "/search-filter/",
    { method: "POST", body: criteria }
  ),

  offerDisplay: () => api<Property[]>(
    "/offer-display/",
       {
      method: "GET",
      auth: true
    }
  ),


offerDetails: (propertyId: number) =>
  api<Property>(
    `/offer-Details/${propertyId}/`,
    {
      method: "GET",
      auth: true
    }
  ),

  //offerDetails: (propertyId: number) =>
    //placeholderApi(`/offer-display/${propertyId}/`, Property.find((property) => property.id === propertyId) ?? Property[0]),

  /*offerRecommendation: (criteria: Partial<SearchCriteria>) =>
    placeholderApi(
      "/offer-recommendation/",
      {
        message: "Search preferences saved. You will be notified when a matching property becomes available.",
        recommendations: Property.slice(0, 2)
      },
      { method: "POST", body: criteria }
    ),*/

  //fairPriceAverage: (criteria: Partial<SearchCriteria> & { month: string }): Promise<FairPriceAverageResult> =>
    //api(
      //"/fair-price-average/",

      //{ method: "POST", body: criteria }
    //),

 // contact: () => api("/contact/", { chats, messages: chatMessages }),

  //sendMessage: (payload: { chat_id: number; messages_text: string }) =>
    //api("/contact/messages/", { message: "Message delivered successfully", payload }, { method: "POST", body: payload }),

  //deals: () => api("/deals/", deals),

  //sendDealRequest: (payload: { property_id: number; owner_id: number }) =>
    //api("/deals/", { message: "Deal request created with Pending status", payload }, { method: "POST", body: payload }),

  //updateDealStatus: (dealId: number, status: string) =>
    //api(`/deals/${dealId}/`, { message: `Deal status changed to ${status}` }, { method: "PATCH", body: { status } }),

  //reports: (reportType: ReportType) =>
    //api(`/reports/?type=${reportType}`, reportRows.filter((row) => row.type.toLowerCase().includes(reportType.slice(0, -1)))),

  getUserProfile: () =>
    api(
      "/account/",
      {
        method: "GET",
        auth: true
      }
    ),

  logout: () => {
    const refresh = localStorage.getItem("aman_refresh_token");

    return api<AmanMessageResponse>(
      "/logout/",
      {
        method: "POST",
        auth: false,
        body: refresh ? { refresh } : {}
      }
    );
  }
};
