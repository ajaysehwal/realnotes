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

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get("_access_token");
      if (token) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await refreshToken();
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

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/profile");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (
    endpoint: string,
    email: string,
    password: string
  ) => {
    try {
      await api.post(endpoint, { email, password });
      await fetchUserProfile();
      navigate("/");
    } catch (error) {
      throw error;
    }
  };

  const login = (email: string, password: string) =>
    handleAuth("/api/login", email, password);
  const register = (email: string, password: string) =>
    handleAuth("/api/register", email, password);

  const logout = async () => {
    try {
      setUser(null);
      console.log("logging out ...........")
      Cookies.remove("_access_token");
      Cookies.remove("_refresh_token");
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      await api.post("/api/refresh-token");
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
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
