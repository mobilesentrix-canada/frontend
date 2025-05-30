import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: number; 
  name: string;
  email: string;
  role: "admin" | "store_member" | "user"; 
  storeId?: string;
  storeName?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  statusCode?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updatePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const restoredUser: User = {
          id: decoded.userId ?? decoded.id,
          email: decoded.email,
          name: decoded.name ?? "",
          role: decoded.role,
        };
        setUser(restoredUser);
        setAccessToken(token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const userData = result.data.user;

        const token = result.data.tokens.accessToken;
        const user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          ...(userData?.storeName && { storeName: userData?.storeName }),
        };
        setUser(user);
        setAccessToken(token);
        localStorage.setItem("accessToken", token);

        return {
          success: true,
          data: result.data,
          message: result.message,
          statusCode: response.status,
        };
      }

      return {
        success: false,
        message: result.message || "Login failed",
        error: result.error,
        statusCode: response.status,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error or server unavailable",
        error: error instanceof Error ? error.message : "Unknown error",
        statusCode: 0,
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = accessToken || localStorage.getItem("accessToken");
      const apiUrl = import.meta.env.VITE_API_URL;
      if (token) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
    }
  };

  const updatePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const token = accessToken || localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token available");
        return false;
      }
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Password changed successfully:", result.data.message);
        localStorage.removeItem("accessToken");
        return true;
      } else {
        console.error(
          "Password change failed:",
          result.message || "Unknown error"
        );
        return false;
      }
    } catch (error) {
      console.error("Password update error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updatePassword, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
