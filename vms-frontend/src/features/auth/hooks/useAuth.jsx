// src/features/auth/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = async () => {
    const currentId = user?.userId || user?.id;
    if (!currentId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/users/${currentId}`);
      if (response.ok) {
        const updatedData = await response.json();
        // Normalize: Ensure frontend consistently uses userId
        const normalizedData = {
          ...updatedData,
          userId: updatedData.id 
        };
        localStorage.setItem("user", JSON.stringify(normalizedData));
        setUser(normalizedData);
        return normalizedData;
      }
    } catch (err) {
      console.error("Failed to refresh user session:", err);
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
