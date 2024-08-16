import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { User } from "../types";
import { useNavigate } from "react-router-dom";
import { setCookie } from "../utils/helper";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  const payloadBase64 = token.split(".")[1];
  const decodedJson = atob(payloadBase64);
  const decoded = JSON.parse(decodedJson);
  const exp = decoded.exp;
  return Date.now() >= exp * 1000;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/profile");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    console.log("Refreshing token...");
    try {
      const response = await api.post("/api/refresh-token");
      const { refreshToken, accessToken } = response.data;
      setCookie(refreshToken, accessToken);
    } catch (error) {
      console.error("Failed to refresh token:", error);
      throw error;
    }
  };

  const initializeAuth = async () => {
    const accessToken = Cookies.get("_access_token");
    const refreshToken = Cookies.get("_refresh_token");
    if (accessToken && !isTokenExpired(accessToken)) {
      await fetchUserProfile();
    } else if (refreshToken) {
      try {
        await refresh();
        await fetchUserProfile();
      } catch (error) {
        console.error("Failed to refresh token during initialization:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          (error.response?.status === 401 ||
            isTokenExpired(Cookies.get("_access_token") || "")) &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            await refresh();
            return api(originalRequest);
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    initializeAuth();

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleAuth = async (
    endpoint: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await api.post(endpoint, { email, password });
      const { refreshToken, accessToken } = response.data;
      setCookie(refreshToken, accessToken);
      await fetchUserProfile();
      navigate("/");
    } catch (error) {
      console.error(`Error during ${endpoint}:`, error);
      throw error;
    }
  };

  const login = (email: string, password: string) =>
    handleAuth("/api/login", email, password);
  const register = (email: string, password: string) =>
    handleAuth("/api/register", email, password);

  const logout = async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      Cookies.remove("_access_token");
      Cookies.remove("_refresh_token");
      console.log("Logged out successfully");
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
