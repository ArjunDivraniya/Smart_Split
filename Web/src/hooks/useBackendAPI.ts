/**
 * Custom React Hook for Backend API Calls
 * Automatically handles session token injection for authenticated requests
 * Handles token expiration and provides error feedback
 * 
 * Usage:
 * const { call, loading, error } = useBackendAPI();
 * const response = await call('/trips/user');  // GET
 * const response = await call('/trips/create', { method: 'POST', body: { ... } });
 * 
 * Returns structured response:
 * { success: boolean, data?: T, message?: string, error?: string }
 */

import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface APIError {
  status: number;
  message: string;
  data?: any;
}

interface UseBackendAPIResponse {
  call: <T = any>(endpoint: string, options?: RequestInit) => Promise<{ success: boolean; data?: T; message?: string; error?: string }>;
  loading: boolean;
  error: string | null;
}

export function useBackendAPI(): UseBackendAPIResponse {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://smartsplit-app-cv3e.onrender.com";
  const API_URL = `${BACKEND_URL}/api`;

  // Ensure backendToken is available when session loads
  useEffect(() => {
    if (status === "authenticated" && session && !(session as any)?.backendToken) {
      console.log("Session loaded but token missing, refreshing...");
      updateSession();
    }
  }, [status, session, updateSession]);

  const call = useCallback(
    async <T = any>(endpoint: string, options?: RequestInit): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        // 1. Wait for session to load if needed
        if (status === "loading") {
          setLoading(false);
          return {
            success: false,
            error: "Session loading",
            message: "Loading your session..."
          };
        }

        // 2. Check authentication status
        if (status !== "authenticated") {
          console.warn("User not authenticated, redirecting to login");
          router.push("/login");
          setLoading(false);
          return {
            success: false,
            error: "NOT_AUTHENTICATED",
            message: "Please log in to continue."
          };
        }

        if (!session) {
          console.warn("Session is null despite authenticated status");
          setLoading(false);
          return {
            success: false,
            error: "SESSION_NULL",
            message: "Session data unavailable. Please refresh and try again."
          };
        }

        // 3. Get token from session
        let token = (session as any)?.backendToken;

        // If token is missing, try to refresh the session
        if (!token) {
          console.warn("backendToken missing from session, attempting refresh...");
          const tryGetToken = async () => {
            for (let attempt = 0; attempt < 2; attempt += 1) {
              await updateSession();

              // Small delay to allow session cookie propagation
              await new Promise((resolve) => setTimeout(resolve, 300));

              try {
                const sessionResponse = await fetch(`/api/auth/session`, {
                  credentials: "include",
                  cache: "no-store"
                });

                if (sessionResponse.ok) {
                  const freshSession = await sessionResponse.json();
                  if (freshSession?.backendToken) {
                    return freshSession.backendToken as string;
                  }
                } else {
                  console.warn(`Failed to fetch session: ${sessionResponse.status}`);
                }
              } catch (fetchError) {
                console.error("Error fetching session:", fetchError);
              }
            }

            return null;
          };

          const refreshedToken = await tryGetToken();
          if (refreshedToken) {
            token = refreshedToken;
            console.log("Session refreshed, token available:", true);
          }
          
          if (!token) {
            console.error("Token still missing after refresh. Session invalid.");
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            setLoading(false);
            return {
              success: false,
              error: "NO_TOKEN",
              message: "Your session has expired. Please log in again."
            };
          }
        }

        // 4. Check token expiry
        const tokenExpires = (session as any)?.backendTokenExpires;
        if (tokenExpires) {
          const now = Math.floor(Date.now() / 1000);
          if (tokenExpires < now) {
            console.warn("Token has expired");
            toast.error("Your session has expired. Please log in again.");
            router.push("/login");
            setLoading(false);
            return {
              success: false,
              error: "TOKEN_EXPIRED",
              message: "Your session has expired. Please log in again."
            };
          }
        }

        // 5. Prepare request
        const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

        const headers = new Headers(options?.headers || {});
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", `Bearer ${token}`);

        // 6. Make the request
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });

        // 7. Handle 401 Unauthorized
        if (response.status === 401) {
          console.error("Received 401 Unauthorized");
          toast.error("Your session has expired. Please log in again.");
          setTimeout(() => router.push("/login"), 800);
          setLoading(false);
          return {
            success: false,
            error: "UNAUTHORIZED",
            message: "Your session has expired. Please log in again."
          };
        }

        // 8. Handle other HTTP errors
        if (response.status >= 400) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (e) {
            const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            setError(errorMsg);
            setLoading(false);
            return {
              success: false,
              error: `HTTP_${response.status}`,
              message: errorMsg
            };
          }

          const errorMsg = errorData.message || errorData.error || `HTTP ${response.status}`;
          setError(errorMsg);
          setLoading(false);
          return {
            success: false,
            error: errorData.error || `HTTP_${response.status}`,
            message: errorMsg,
            data: errorData.data
          };
        }

        // 9. Parse response
        let responseData: any;
        try {
          responseData = await response.json();
        } catch (e) {
          setLoading(false);
          return {
            success: true,
            data: undefined,
            message: "Success"
          };
        }

        setLoading(false);
        return {
          success: true,
          data: responseData.data || responseData,
          message: responseData.message || "Success"
        };

      } catch (err: any) {
        const errorMsg = err.message || "An error occurred";
        setError(errorMsg);
        setLoading(false);
        console.error(`API Error on ${endpoint}:`, errorMsg);
        
        return {
          success: false,
          error: err.name || "Error",
          message: errorMsg
        };
      }
    },
    [session, status, router, updateSession]
  );

  return { call, loading, error };
}
