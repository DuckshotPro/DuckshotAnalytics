/**
 * DuckShot Analytics Application
 * 
 * This is the main application component that sets up the application structure,
 * including routing, state management providers, and global UI components.
 */

import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import ConnectAccount from "@/pages/ConnectAccount";
import AuthPage from "@/pages/auth-page";
import PricingPage from "@/pages/pricing-page";
import SettingsPage from "@/pages/settings-page";
import ReportsPage from "@/pages/reports-page";
import HelpPage from "@/pages/help-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import ContactPage from "@/pages/contact-page";
import RoadmapPage from "@/pages/roadmap-page";
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
    <Layout>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/signup" component={AuthPage} />
        <Route path="/pricing-page" component={PricingPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-page" component={TermsPage} />
        <Route path="/contact-page" component={ContactPage} />
        <Route path="/roadmap-page" component={RoadmapPage} />
        <Route path="/help-page" component={HelpPage} />
        
        {/* Protected Routes (require authentication) */}
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/connect" component={ConnectAccount} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/reports" component={ReportsPage} />
        <ProtectedRoute path="/data-management" component={React.lazy(() => import("@/pages/data-management"))} />
        <ProtectedRoute path="/admin" component={React.lazy(() => import("@/pages/admin/AdminDashboard"))} />
        
        {/* 404 Not Found Route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
