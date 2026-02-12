import { useAuth } from "./features/auth/hooks/useAuth";
import { useCallback, useMemo } from "react";
export const useApi = () => {
  const { user } = useAuth();
  const BASE_URL = "http://localhost:8080/api";



  const apiCall = useCallback(async (endpoint, options = {}) => {
    let fullEndpoint = endpoint;


    if (user?.userId && (
      endpoint.includes("/events") || 
      endpoint.includes("/volunteers") 
    ) && !endpoint.includes("/admin") && !endpoint.includes("published") &&
       !endpoint.includes("/attendance") && 
       !endpoint.includes("/approve") && 
       !endpoint.includes("/reject") && 
       !endpoint.includes("/remove")) {
      const separator = endpoint.includes("?") ? "&" : "?";
      fullEndpoint = `${endpoint}${separator}userId=${user.userId}`;
    }



    const isFormData = options.body instanceof FormData;

    const config = {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !isFormData) {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${BASE_URL}${fullEndpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    if (options.responseType === 'blob') {
      return response.blob();
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    
    return { message: await response.text() };
  }, [user?.userId]);

  return useMemo(() => ({ apiCall }), [apiCall]);
};
