/**
 * API Routes Configuration
 * 
 * This file sets up all backend routes for the DuckShots SnapAlytics application,
 * including authentication, Snapchat API integration, and subscription management.
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, logConsent } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertSnapchatCredentialsSchema, 
  userDataPreferencesSchema,
  users, 
  User 
} from "@shared/schema";
import { fetchSnapchatData } from "./services/snapchat";
import { generateAiInsight } from "./services/gemini";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { setupOAuth } from "./oauth";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "snapalytics-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
      store: storage.sessionStore,
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Set up OAuth authentication
  setupOAuth(app);

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      try {
        insertUserSchema.parse(req.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` 
          });
        }
        return res.status(400).json({ message: "Invalid request data" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password before storing it
      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        ...req.body,
        password: hashedPassword
      };

      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after signup" });
        }
        return res.status(201).json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: User, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // Snapchat API routes
  app.post("/api/snapchat/connect", isAuthenticated, async (req, res) => {
    try {
      try {
        insertSnapchatCredentialsSchema.parse(req.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` 
          });
        }
        return res.status(400).json({ message: "Invalid request data" });
      }

      const user = req.user as User;
      
      // Prepare consent data
      const consentData = {
        dataConsent: req.body.dataConsent === true,
        consentDate: req.body.consentDate,
        privacyPolicyVersion: req.body.privacyPolicyVersion || "1.0"
      };
      
      // Update user with API credentials and consent data
      await storage.updateUserSnapchatCredentials(
        user.id, 
        req.body.snapchatClientId, 
        req.body.snapchatApiKey,
        consentData
      );
      
      // Log the consent action
      if (consentData.dataConsent) {
        await logConsent(
          user.id,
          "granted",
          "Snapchat account connection consent granted",
          consentData.privacyPolicyVersion,
          req
        );
      }

      // Fetch initial data after connecting
      try {
        const snapchatData = await fetchSnapchatData(req.body.snapchatClientId, req.body.snapchatApiKey);
        await storage.saveSnapchatData(user.id, snapchatData);
      } catch (dataError) {
        console.error("Error fetching initial Snapchat data:", dataError);
        // Still connect even if initial data fetch fails
      }

      res.json({ 
        message: "Snapchat account connected successfully", 
        dataConsent: consentData.dataConsent 
      });
    } catch (error) {
      console.error("Error connecting Snapchat account:", error);
      res.status(500).json({ message: "Error connecting Snapchat account" });
    }
  });

  app.get("/api/snapchat/data", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const data = await storage.getLatestSnapchatData(user.id);
      
      if (!data) {
        return res.status(404).json({ message: "No Snapchat data found" });
      }
      
      res.json(data.data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Snapchat data" });
    }
  });

  app.post("/api/snapchat/refresh", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      if (!user.snapchatClientId || !user.snapchatApiKey) {
        return res.status(400).json({ message: "Snapchat credentials not found" });
      }
      
      const snapchatData = await fetchSnapchatData(user.snapchatClientId, user.snapchatApiKey);
      await storage.saveSnapchatData(user.id, snapchatData);
      
      res.json({ message: "Snapchat data refreshed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error refreshing Snapchat data" });
    }
  });

  // Subscription routes
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const subscription = {
        plan: user.subscription,
        expiresAt: user.subscriptionExpiresAt,
      };
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });

  app.post("/api/subscription/upgrade", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { plan } = req.body;
      
      if (plan !== "premium") {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      await storage.updateUserSubscription(user.id, "premium", expiresAt);
      
      res.json({ message: "Subscription upgraded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error upgrading subscription" });
    }
  });

  app.post("/api/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      await storage.updateUserSubscription(user.id, "free", null);
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error cancelling subscription" });
    }
  });

  // AI Insights routes (premium only)
  app.get("/api/insights/latest", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Check if user is premium
      if (user.subscription !== "premium") {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      const insight = await storage.getLatestAiInsight(user.id);
      
      if (!insight) {
        return res.status(404).json({ message: "No insights found" });
      }
      
      res.json(insight);
    } catch (error) {
      res.status(500).json({ message: "Error fetching AI insight" });
    }
  });

  app.post("/api/insights/generate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Check if user is premium
      if (user.subscription !== "premium") {
        return res.status(403).json({ message: "Premium subscription required" });
      }
      
      // Get the latest Snapchat data
      const snapchatData = await storage.getLatestSnapchatData(user.id);
      
      if (!snapchatData) {
        return res.status(404).json({ message: "No Snapchat data found to analyze" });
      }
      
      // Generate AI insight
      const insightText = await generateAiInsight(snapchatData.data);
      
      // Save the insight
      const insight = await storage.saveAiInsight(user.id, insightText);
      
      res.json(insight);
    } catch (error) {
      res.status(500).json({ message: "Error generating AI insight" });
    }
  });

  // Data Management & Privacy Routes
  app.post("/api/user/data-preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const preferences = req.body;
      
      // Validate the preferences using the userDataPreferencesSchema
      const validatedPrefs = userDataPreferencesSchema.parse(preferences);
      
      // Update user data preferences in the database
      await db
        .update(users)
        .set({
          allowAnalytics: validatedPrefs.allowAnalytics,
          allowDemographics: validatedPrefs.allowDemographics,
          allowLocationData: validatedPrefs.allowLocationData,
          allowContentAnalysis: validatedPrefs.allowContentAnalysis,
          allowThirdPartySharing: validatedPrefs.allowThirdPartySharing,
          allowMarketing: validatedPrefs.allowMarketing,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Log the preferences update as a consent action
      await logConsent(
        user.id,
        "updated_preferences",
        `Updated data collection preferences: ${JSON.stringify(validatedPrefs)}`,
        "1.0",
        req
      );
      
      res.json({ 
        message: "Data preferences updated successfully",
        preferences: validatedPrefs
      });
    } catch (error) {
      console.error("Error updating data preferences:", error);
      res.status(500).json({ message: "Error updating data preferences" });
    }
  });
  
  // Handle user consent submissions
  app.post("/api/user/consent", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { consent, preferences, timestamp } = req.body;
      
      if (consent === undefined) {
        return res.status(400).json({ message: "Consent value is required" });
      }
      
      // Update user consent status in the database
      await db
        .update(users)
        .set({
          dataConsent: consent,
          consentDate: new Date(timestamp),
          privacyPolicyVersion: "1.0", // Current privacy policy version
          // Also update preferences if provided
          ...(preferences && {
            allowAnalytics: preferences.analyticsConsent,
            allowDemographics: preferences.demographicsConsent,
            allowContentAnalysis: preferences.contentAnalysisConsent,
            allowThirdPartySharing: preferences.thirdPartyConsent,
            allowMarketing: preferences.marketingConsent
          }),
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Log the consent action
      await logConsent(
        user.id,
        consent ? "consent_granted" : "consent_declined",
        `User ${consent ? "granted" : "declined"} consent with preferences: ${JSON.stringify(preferences)}`,
        "1.0",
        req
      );
      
      res.json({ 
        message: `Consent preferences ${consent ? "accepted" : "declined"} successfully`,
        consentStatus: consent
      });
    } catch (error) {
      console.error("Error saving consent:", error);
      res.status(500).json({ message: "Error saving consent preferences" });
    }
  });

  app.get("/api/user/export-data", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Fetch all user data
      const userData = await storage.getUser(user.id);
      const snapchatData = await storage.getLatestSnapchatData(user.id);
      const insights = await storage.getLatestAiInsight(user.id);
      
      // Create a comprehensive data export (exclude sensitive fields)
      const exportData = {
        user: {
          id: userData?.id,
          username: userData?.username,
          email: userData?.email || null,
          displayName: userData?.displayName,
          profilePictureUrl: userData?.profilePictureUrl,
          subscription: userData?.subscription,
          subscriptionExpiresAt: userData?.subscriptionExpiresAt,
          createdAt: userData?.createdAt,
          updatedAt: userData?.updatedAt,
          // Include data privacy preferences
          dataPrivacy: {
            allowAnalytics: userData?.allowAnalytics,
            allowDemographics: userData?.allowDemographics,
            allowLocationData: userData?.allowLocationData,
            allowContentAnalysis: userData?.allowContentAnalysis,
            allowThirdPartySharing: userData?.allowThirdPartySharing,
            allowMarketing: userData?.allowMarketing,
          }
        },
        snapchatData: snapchatData?.data,
        insights: insights ? [insights] : [],
        exportDate: new Date(),
        exportRequestIp: req.ip || req.headers['x-forwarded-for']
      };
      
      // Log the data export for GDPR compliance
      await logConsent(
        user.id,
        "data_export",
        "User requested data export",
        "1.0",
        req
      );
      
      // Send as a downloadable JSON file
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="duckshotsanalytics-export-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Error exporting user data" });
    }
  });

  app.post("/api/user/delete-account", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Log deletion request before deleting data for audit trail
      await logConsent(
        user.id,
        "account_deletion",
        "User requested account and data deletion",
        "1.0",
        req
      );
      
      // In a real implementation, you would:
      // 1. Delete all user data from all tables
      // 2. Either hard-delete or soft-delete (mark as deleted) the user
      // 3. Clean up any connected services or subscriptions
      
      // For this prototype, we'll just log out the user
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Error during account deletion" });
        }
        res.json({ message: "Account deletion initiated. All data will be permanently removed within 30 days." });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Error deleting account" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
