import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const logout = () => setToken(null);
  return { token, setToken, logout };
}
