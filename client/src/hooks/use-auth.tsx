/**
 * Authentication Hook and Provider
 * 
 * This module provides the authentication context, provider, and hook for the application.
 * It handles user authentication, registration, logout, and Snapchat account connection
 * using React Context API and TanStack Query for state management.
 */

import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, insertUserSchema, SnapchatCredentials } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

/**
 * Authentication Context Type
 * 
 * Defines the shape of the authentication context, including:
 * - Current user information
 * - Loading and error states
 * - Mutation functions for authentication actions
 */
type AuthContextType = {
  /** The currently authenticated user or null if not authenticated */
  user: User | null;
  /** Whether authentication data is being loaded */
  isLoading: boolean;
  /** Any error that occurred during authentication */
  error: Error | null;
  /** Mutation for logging in a user */
  loginMutation: UseMutationResult<User, Error, LoginData>;
  /** Mutation for logging out the current user */
  logoutMutation: UseMutationResult<void, Error, void>;
  /** Mutation for registering a new user */
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  /** Mutation for connecting a Snapchat account */
  connectSnapchatMutation: UseMutationResult<void, Error, SnapchatCredentials>;
};

/**
 * Login Data Type
 * 
 * Defines the data structure for user login credentials
 */
type LoginData = {
  /** User's username */
  username: string;
  /** User's password */
  password: string;
};

/**
 * Register Data Type
 * 
 * Defines the data structure for user registration.
 * Uses the insertUserSchema from the database schema for type safety.
 */
type RegisterData = z.infer<typeof insertUserSchema>;

/**
 * Authentication Context
 * 
 * React context for sharing authentication state and functions
 * throughout the application.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and functions to all child components.
 * Manages user authentication state using TanStack Query.
 * 
 * @param children - Child components that will have access to auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  /**
   * Current User Query
   * 
   * Fetches the currently authenticated user from the server.
   * Returns null on 401 Unauthorized responses instead of throwing an error.
   */
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  /**
   * Login Mutation
   * 
   * Handles user login by sending credentials to the server.
   * Updates the user state and displays a toast notification on success or failure.
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json() as User;
    },
    onSuccess: (user: User) => {
      // Update cached user data on successful login
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Registration Mutation
   * 
   * Handles user registration by sending credentials to the server.
   * Updates the user state and displays a toast notification on success or failure.
   */
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/signup", credentials);
      return await res.json() as User;
    },
    onSuccess: (user: User) => {
      // Update cached user data on successful registration
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Account created!",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Logout Mutation
   * 
   * Handles user logout by sending a request to the server.
   * Updates the user state and displays a toast notification on success or failure.
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      // Clear cached user data on successful logout
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  /**
   * Connect Snapchat Account Mutation
   * 
   * Handles connecting a Snapchat account by sending API credentials to the server.
   * Invalidates the user query to refresh data and displays a toast notification.
   */
  const connectSnapchatMutation = useMutation({
    mutationFn: async (credentials: SnapchatCredentials) => {
      await apiRequest("POST", "/api/snapchat/connect", credentials);
    },
    onSuccess: () => {
      // Invalidate user data to refresh with updated Snapchat connection
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Snapchat Connected",
        description: "Your Snapchat account has been successfully connected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Provide authentication context to child components
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        connectSnapchatMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Authentication Hook
 * 
 * Custom hook for accessing the authentication context.
 * Must be used within a component that is a child of AuthProvider.
 * 
 * @returns The authentication context with user state and authentication functions
 * @throws Error if used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}