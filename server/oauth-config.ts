/**
 * OAuth Configuration
 * 
 * This file contains OAuth configuration settings for integrating with
 * third-party authentication providers like Snapchat.
 */

/**
 * OAuth Provider Settings
 * 
 * Configuration for various OAuth providers used by the application.
 * Environmental variables should be used for sensitive values in production.
 */
export const providers = {
  snapchat: {
    /**
     * OAuth Application Client ID
     * 
     * Obtained after registering your application with Snapchat's developer portal.
     * In production, this should be stored as an environment variable.
     */
    clientID: process.env.SNAPCHAT_CLIENT_ID || "",
    
    /**
     * OAuth Application Client Secret
     * 
     * The secret key for your OAuth application.
     * In production, this should be stored as an environment variable.
     */
    clientSecret: process.env.SNAPCHAT_CLIENT_SECRET || "",
    
    /**
     * Callback URL
     * 
     * The URL where Snapchat will redirect users after authentication.
     * Must match the callback URL registered in Snapchat's developer portal.
     */
    callbackURL: `${process.env.APP_URL || "https://duckshot-analytics-420duck1.replit.app"}/api/auth/snapchat/callback`,
    
    /**
     * OAuth Scopes
     * 
     * Permissions requested from the user during authorization.
     * These determine what data and actions your app can access.
     */
    scope: [
      "user.display_name",
      "user.bitmoji.avatar",
      "user.external_id",
      "snapchat.analytics.read"
    ]
  }
};

/**
 * OAuth Strategy Configuration
 * 
 * Settings used when integrating the OAuth flow with Passport.js.
 */
export const strategyConfig = {
  // Settings for processing the OAuth flow
  passReqToCallback: true,
  
  // Whether to store OAuth profile information
  storeProfileData: true,
  
  // Token refresh settings
  refreshTokens: true,
  refreshWindowSeconds: 3600 // Refresh tokens when they're within 1 hour of expiring
};

/**
 * Instructions for Setting Up OAuth:
 * 
 * 1. Register your application at https://kit.snapchat.com/portal/
 * 2. Configure the application with the following:
 *    - Application Name: DuckShots Analytics
 *    - Developer Name: Aric Yesel
 *    - Application Website: https://duckshotanalytics.com
 *    - Support Email: duckshotproductions@gmail.com
 *    - Redirect URLs: https://duckshot-analytics-420duck1.replit.app/api/auth/snapchat/callback
 * 3. Set environment variables for SNAPCHAT_CLIENT_ID and SNAPCHAT_CLIENT_SECRET
 * 4. Set APP_URL to: https://duckshot-analytics-420duck1.replit.app
 * 
 * The OAuth flow will then:
 * 1. Redirect users to Snapchat's authorization page
 * 2. Request the specified scopes
 * 3. Receive authorization code at the callback URL
 * 4. Exchange code for access tokens
 * 5. Store tokens and user information in the database
 */