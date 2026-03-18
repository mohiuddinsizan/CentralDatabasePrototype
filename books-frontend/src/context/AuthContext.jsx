import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const stored = getStoredAuth();

      if (!stored?.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        const next = { token: stored.token, admin: data };
        setAuth(next);
        setStoredAuth(next);
      } catch {
        clearStoredAuth();
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    const next = { token: data.token, admin: data };
    setAuth(next);
    setStoredAuth(next);
    return next;
  };

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      admin: auth?.admin || null,
      token: auth?.token || null,
      isAuthenticated: !!auth?.token,
      loading,
      login,
      logout,
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);