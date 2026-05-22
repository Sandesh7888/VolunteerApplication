import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`,
  withCredentials: true,   // <— important for Spring Security session/JWT cookies
});

// Example test API call
export const getSecureData = () => api.get("/data");

export default api;
