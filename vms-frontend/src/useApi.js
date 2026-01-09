import { useAuth } from "./features/auth/hooks/useAuth";
import { useCallback, useMemo } from "react";

export const useApi = () => {
  const { user } = useAuth();
  const BASE_URL = "http://localhost:8080/api";

  console.log("useApi user:", user);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    let fullEndpoint = endpoint;

    if (user?.userId && endpoint.includes("/events") && !endpoint.includes("published")) {
      const separator = endpoint.includes("?") ? "&" : "?";
      fullEndpoint = `${endpoint}${separator}userId=${user.userId}`;
    }

    console.log("🌐 API CALL:", fullEndpoint, "User ID:", user?.userId);

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    const response = await fetch(`${BASE_URL}${fullEndpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [user?.userId]);

  return useMemo(() => ({ apiCall }), [apiCall]);
};
