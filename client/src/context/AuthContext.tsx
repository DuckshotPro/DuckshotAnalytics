import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  signup: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  connectSnapchat: (clientId: string, apiKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    onError: () => {
      setUser(null);
    },
    onSuccess: (data) => {
      if (data) {
        setUser(data);
      } else {
        setUser(null);
      }
    },
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const login = async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    const userData = await response.json();
    setUser(userData);
    await refetch();
    return userData;
  };

  const signup = async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/signup", { username, password });
    const userData = await response.json();
    setUser(userData);
    await refetch();
    return userData;
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    setUser(null);
    await refetch();
  };

  const connectSnapchat = async (clientId: string, apiKey: string) => {
    await apiRequest("POST", "/api/snapchat/connect", { snapchatClientId: clientId, snapchatApiKey: apiKey });
    await refetch();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, connectSnapchat }}>
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
