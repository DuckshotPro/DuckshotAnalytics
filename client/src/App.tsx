/**
 * DuckShots SnapAlytics Application
 * 
 * This is the main application component that sets up the application structure,
 * including routing, state management providers, and global UI components.
 */

import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import ConnectAccount from "@/pages/ConnectAccount";
import AuthPage from "@/pages/auth-page";
import PricingPage from "@/pages/pricing-page";
import SettingsPage from "@/pages/settings-page";
import ReportsPage from "@/pages/reports-page";
import HelpPage from "@/pages/help-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

/**
 * Application Router
 * 
 * Defines all routes for the application, including:
 * - Public routes accessible without authentication
 * - Protected routes that require user authentication
 * 
 * Uses Wouter for lightweight client-side routing.
 */
function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/privacy-policy">
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
          {(() => {
            const PrivacyPolicy = React.lazy(() => import("@/pages/privacy-policy"));
            return <PrivacyPolicy />;
          })()}
        </Suspense>
      </Route>
      
      {/* Protected Routes (require authentication) */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/connect" component={ConnectAccount} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/data-management" component={React.lazy(() => import("@/pages/data-management"))} />
      
      {/* 404 Not Found Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main Application Component
 * 
 * Sets up the application with necessary providers:
 * - QueryClientProvider: for data fetching and caching
 * - AuthProvider: for authentication state management
 * 
 * Also includes global UI components like Toaster for notifications.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
