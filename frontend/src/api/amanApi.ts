import type {
  Chat,
  ChatMessage,
  FairPriceAverageResult,
  Property,
  ReportRow,
  ReportType,
  SearchCriteria,
  User,
  deals,
} from "../types/aman";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  idempotencyKey?: string;
};

export type AmanUserResponse = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
};

export type AmanAuthResponse = {
  message?: string;
  access: string;
  refresh: string;
  role?: string;
  user: AmanUserResponse;
};

export type AmanMessageResponse = {
  message: string;
};

type DealMutationResponse = AmanMessageResponse & { deal: deals };
type RecommendationResponse = AmanMessageResponse & { recommendations: Property[] };

const inFlightMutations = new Map<string, Promise<unknown>>();
const retryKeys = new Map<string, string>();
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
let refreshInFlight: Promise<string | null> | null = null;

function clearStoredSession() {
  localStorage.removeItem("aman_access_token");
  localStorage.removeItem("aman_refresh_token");
  localStorage.removeItem("aman_user");
  localStorage.removeItem("role");
}

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;

  const refresh = localStorage.getItem("aman_refresh_token");
  if (!refresh) return null;

  refreshInFlight = fetch(`${API_BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Session refresh failed.");
      const data = (await response.json()) as { access: string };
      localStorage.setItem("aman_access_token", data.access);
      return data.access;
    })
    .catch(() => {
      clearStoredSession();
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function bodyFingerprint(body: unknown) {
  if (body instanceof FormData) {
    return Array.from(body.entries())
      .map(([name, value]) =>
        value instanceof File
          ? `${name}:${value.name}:${value.size}:${value.lastModified}`
          : `${name}:${value}`
      )
      .join("|");
  }
  return body === undefined ? "" : JSON.stringify(body);
}

async function performRequest<T>(
  endpoint: string,
  options: ApiOptions,
  method: NonNullable<ApiOptions["method"]>,
  idempotencyKey?: string,
  allowTokenRefresh = true
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("aman_access_token");
  if (options.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });
  if (response.status === 401 && options.auth && allowTokenRefresh) {
    const access = await refreshAccessToken();
    if (access) {
      return performRequest<T>(endpoint, options, method, idempotencyKey, false);
    }
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail ?? data?.message ?? `Request failed: ${endpoint}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(data));
  }
  return data as T;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  if (!mutationMethods.has(method)) {
    return performRequest<T>(endpoint, options, method);
  }

  const fingerprint = `${method}:${endpoint}:${bodyFingerprint(options.body)}`;
  const existing = inFlightMutations.get(fingerprint);
  if (existing) {
    return existing as Promise<T>;
  }

  const idempotencyKey =
    options.idempotencyKey ?? retryKeys.get(fingerprint) ?? createIdempotencyKey();
  retryKeys.set(fingerprint, idempotencyKey);
  const request = performRequest<T>(
    endpoint,
    options,
    method,
    idempotencyKey
  );
  inFlightMutations.set(fingerprint, request);
  try {
    const result = await request;
    if (retryKeys.get(fingerprint) === idempotencyKey) {
      retryKeys.delete(fingerprint);
    }
    return result;
  } finally {
    if (inFlightMutations.get(fingerprint) === request) {
      inFlightMutations.delete(fingerprint);
    }
  }
}

export const amanApi = {
  registration: (payload: Partial<User> & { password: string; confirm_password: string }) =>
    api<AmanAuthResponse>("/register/", { method: "POST", body: payload }),

  login: (payload: { username: string; password: string }) =>
    api<AmanAuthResponse>("/login/", { method: "POST", body: payload }),

  resetPassword: (payload: {
    current_password: string;
    password: string;
    confirm_password: string;
  }) =>
    api<AmanMessageResponse>("/reset-password/", {
      method: "PATCH",
      body: payload,
      auth: true,
    }),

  editInformation: (payload: Partial<AmanUserResponse> & { current_password?: string }) =>
    api<{ message: string; user: AmanUserResponse }>("/edit-information/", {
      method: "PATCH",
      body: payload,
      auth: true,
    }),

  addProperty: (payload: FormData) =>
    api<Property>("/addProperty/", { method: "POST", body: payload, auth: true }),

  manageProperty: () => api<Property[]>("/my-properties/", { auth: true }),

  deleteProperty: (propertyId: number) =>
    api<AmanMessageResponse>(`/manage-property/${propertyId}/`, {
      method: "DELETE",
      auth: true,
    }),

  updatePropertyValidity: (propertyId: number) =>
    api<AmanMessageResponse & { valid_until: string }>(
      `/manage-property/${propertyId}/validity/`,
      { method: "PATCH", auth: true }
    ),

  searchForProperty: (criteria: SearchCriteria) =>
    api<Property[]>("/search-for-property/", { method: "POST", body: criteria }),

  searchFilter: (criteria: Partial<SearchCriteria>) =>
    api<Property[]>("/search-filter/", { method: "POST", body: criteria }),

  offerDisplay: () => api<Property[]>("/offer-display/", { auth: true }),

  offerDetails: (propertyId: number) =>
    api<Property>(`/offer-Details/${propertyId}/`, { auth: true }),

  offerRecommendation: (criteria: Partial<SearchCriteria>) =>
    api<RecommendationResponse>("/offer-recommendation/", {
      method: "POST",
      body: criteria,
      auth: true,
    }),

  fairPriceAverage: (criteria: Partial<SearchCriteria> & { month: string }) =>
    api<FairPriceAverageResult>("/fair-price-average/", {
      method: "POST",
      body: criteria,
    }),

  contact: (propertyId?: number) =>
    api<{ chats: Chat[]; messages: ChatMessage[] }>(
      propertyId ? `/chating/contact/?property_id=${propertyId}` : "/chating/contact/",
      { auth: true }
    ),

  deals: () => api<deals[]>("/deals/", { auth: true }),

  updateDealStatus: (dealId: number, status: string) =>
    api<DealMutationResponse>(`/deals/${dealId}/`, {
      method: "PATCH",
      body: { status },
      auth: true,
    }),

  rateDeal: (dealId: number, rating: number) =>
    api<DealMutationResponse>(`/deals/${dealId}/`, {
      method: "PATCH",
      body: { rating },
      auth: true,
    }),

  sendDealRequest: (property: number) =>
    api<DealMutationResponse>("/request-deals/", {
      method: "POST",
      body: { property },
      auth: true,
    }),

  reports: (reportType: ReportType) =>
    api<ReportRow[]>(`/reports/?type=${reportType}`, { auth: true }),

  getUserProfile: () => api<AmanUserResponse>("/account/", { auth: true }),

  logout: () => {
    const refresh = localStorage.getItem("aman_refresh_token");
    return api<AmanMessageResponse>("/logout/", {
      method: "POST",
      auth: true,
      body: refresh ? { refresh } : {},
    });
  },
};
