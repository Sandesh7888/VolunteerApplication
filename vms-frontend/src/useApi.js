// useApi.js - FIXED: Handles HTML/Non-JSON errors
import { useAuth } from "./features/auth/hooks/useAuth";
import { useCallback, useMemo } from "react";

export const useApi = () => {
  const { user } = useAuth();
  
  console.log("useApi user:", user);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    let fullEndpoint = endpoint;

    // ✅ FIXED: Only add userId if NOT already present
    if (user?.userId && endpoint.includes("/events") && 
        !endpoint.includes("published") && 
        !endpoint.includes("userId=")) {
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

    // ✅ RELATIVE URL - Vite proxy → localhost:8080
    const response = await fetch(`/api${fullEndpoint}`, config);

    // ✅ FIXED: Handle non-JSON responses (HTML errors)
    let errorData = {};
    if (!response.ok) {
      try {
        // Try to parse JSON first
        const text = await response.text();
        console.log("🔍 Backend response (raw):", text.substring(0, 200) + "...");
        
        errorData = JSON.parse(text);
      } catch (parseError) {
        // ✅ If not JSON (HTML error page), use status + message
        console.error("❌ Non-JSON error response:", response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} (Backend error)`);
      }
      
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    // ✅ Handle successful response (might also be non-JSON)
    try {
      return await response.json();
    } catch (parseError) {
      console.warn("⚠️ Non-JSON success response, returning empty:", await response.text());
      return {}; // Empty object for non-JSON success
    }
  }, [user?.userId]);

  return useMemo(() => ({ apiCall }), [apiCall]);
};
