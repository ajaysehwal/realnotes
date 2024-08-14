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
import { getCookie } from "../utils/helper";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>
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

    initializeAuth();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/profile");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (
    endpoint: string,
    email: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    try {
      await api.post(endpoint, { email, password });
      await fetchUserProfile();
      setError(null);
      navigate("/");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const login = (
    email: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => handleAuth("/api/login", email, password, setError);
  const register = (
    email: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => handleAuth("/api/register", email, password, setError);

  const logout = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
      Cookies.remove("_access_token");
      Cookies.remove("_refresh_token");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/api/refresh-token");
      Cookies.set("_access_token", response.data.accessToken);
    } catch (error) {
      console.error("Token refresh error:", error);
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
