/**
 * API Service for Trip Splitter Backend
 * Clean wrapper around backend API calls with proper error handling and session token injection
 * 
 * This replaces all direct fetch calls to /api/ routes
 * Routes are automatically prefixed with BACKEND_URL/api
 * 
 * For Client Components: Use this directly with the token from useSession hook
 * For Server Components: Pass token from session or getServerSession
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://smartsplit-app-cv3e.onrender.com";
const API_URL = `${BACKEND_URL}/api`;

interface APIOptions extends RequestInit {
  token?: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Generic API call function
 * @param endpoint - The API endpoint (e.g., '/trips/user')
 * @param options - Request options including token
 * @returns API response object
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: APIOptions = {}
): Promise<APIResponse<T>> {
  const { token, ...fetchOptions } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set("Content-Type", "application/json");

  // Add authorization token
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn(`API call to ${endpoint} made without authorization token`);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      return {
        success: false,
        message: "Session expired. Please log in again.",
        error: "UNAUTHORIZED",
      };
    }

    // Handle other error responses
    if (response.status >= 400) {
      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        // Non-JSON error response
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          error: `HTTP_${response.status}`,
        };
      }

      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        error: data.message,
        data: data.data,
      };
    }

    // Parse successful response
    const data = await response.json();

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error.message);
    return {
      success: false,
      message: error.message || "Network error",
      error: error.message,
    };
  }
}

/**
 * Auth Endpoints
 * Note: These don't require a token as they handle login/registration
 */
export const AuthAPI = {
  register: (email: string, password: string, name: string) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: (token?: string) =>
    apiRequest("/auth/logout", { method: "POST", token }),
};

/**
 * User Endpoints
 */
export const UserAPI = {
  getProfile: (token?: string) =>
    apiRequest("/user/me", { token, method: "GET" }),

  updateProfile: (data: any, token?: string) =>
    apiRequest("/user/update", {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  searchUsers: (query: string, token?: string) =>
    apiRequest(`/user/search?query=${encodeURIComponent(query)}`, { token, method: "GET" }),

  deleteAccount: (token?: string) =>
    apiRequest("/user/delete-account", { method: "DELETE", token }),
};

/**
 * Trip Endpoints
 */
export const TripsAPI = {
  create: (tripData: any, token?: string) =>
    apiRequest("/trips/create", {
      method: "POST",
      body: JSON.stringify(tripData),
      token,
    }),

  getUserTrips: (token?: string) =>
    apiRequest("/trips/user", { method: "GET", token }),

  getTripDetails: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}`, { method: "GET", token }),

  addMember: (tripId: string, email: string, token?: string) =>
    apiRequest(`/trips/${tripId}/add-member`, {
      method: "POST",
      body: JSON.stringify({ email }),
      token,
    }),

  respondToInvite: (tripId: string, action: "accept" | "reject", token?: string) =>
    apiRequest(`/trips/${tripId}/respond`, {
      method: "POST",
      body: JSON.stringify({ action }),
      token,
    }),

  endTrip: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/end`, { method: "POST", token }),

  getSettlements: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/settlements`, { method: "GET", token }),

  getAnalytics: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/analytics`, { method: "GET", token }),

  getItinerary: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/itinerary`, { method: "GET", token }),

  addActivity: (tripId: string, activityData: any, token?: string) =>
    apiRequest(`/trips/${tripId}/itinerary`, {
      method: "POST",
      body: JSON.stringify(activityData),
      token,
    }),

  getPackingList: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/packing`, { method: "GET", token }),

  addPackingItem: (tripId: string, itemData: any, token?: string) =>
    apiRequest(`/trips/${tripId}/packing`, {
      method: "POST",
      body: JSON.stringify(itemData),
      token,
    }),

  togglePackingItem: (tripId: string, itemData: any, token?: string) =>
    apiRequest(`/trips/${tripId}/packing`, {
      method: "PUT",
      body: JSON.stringify(itemData),
      token,
    }),

  deletePackingItem: (tripId: string, itemId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/packing?itemId=${itemId}`, {
      method: "DELETE",
      token,
    }),

  getMessages: (tripId: string, token?: string) =>
    apiRequest(`/trips/${tripId}/chat`, { method: "GET", token }),

  sendMessage: (tripId: string, content: string, token?: string) =>
    apiRequest(`/trips/${tripId}/chat`, {
      method: "POST",
      body: JSON.stringify({ content }),
      token,
    }),
};

/**
 * Expense Endpoints
 */
export const ExpensesAPI = {
  add: (expenseData: any, token?: string) =>
    apiRequest("/expenses/add", {
      method: "POST",
      body: JSON.stringify(expenseData),
      token,
    }),

  update: (expenseId: string, expenseData: any, token?: string) =>
    apiRequest(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
      token,
    }),

  delete: (expenseId: string, token?: string) =>
    apiRequest(`/expenses/${expenseId}`, { method: "DELETE", token }),
};

/**
 * Notification Endpoints
 */
export const NotificationsAPI = {
  getNotifications: (token?: string) =>
    apiRequest("/notifications", { method: "GET", token }),

  markAllAsRead: (token?: string) =>
    apiRequest("/notifications", { method: "PUT", token }),
};

/**
 * Health Check - No auth required
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
