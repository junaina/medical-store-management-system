import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();

      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (error) {
        clearToken();
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (username, password) => {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const loginRes = await api.post("/auth/login", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    setToken(loginRes.data.access_token);

    const meRes = await api.get("/auth/me");
    setUser(meRes.data);

    return meRes.data;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      bootstrapping,
      login,
      logout,
    }),
    [user, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
