/**
 * Server Entry Point
 * 
 * This is the main file that initializes and starts the Express server.
 * It sets up middleware, routes, error handling, and serves both the API and the client.
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

/**
 * Initialize Express Application
 * 
 * Create the Express application instance and configure basic middleware.
 */
const app = express();
app.use(express.json());  // Parse JSON request bodies
app.use(express.urlencoded({ extended: false }));  // Parse URL-encoded request bodies

/**
 * Request Logging Middleware
 * 
 * This middleware logs API requests with their duration and response data.
 * It helps with debugging and monitoring API performance.
 */
app.use((req, res, next) => {
  // Record the start time of the request processing
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Override the res.json method to capture the response body
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // When the response is finished, log request details
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Only log API requests (paths starting with /api)
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Include response body in the log if available
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Truncate very long log lines
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

/**
 * Main Application Initialization
 * 
 * This self-executing async function initializes the server,
 * registers routes, sets up error handling, and starts listening for requests.
 */
(async () => {
  /**
   * Register API Routes
   * 
   * Set up all API routes and get the HTTP server instance.
   * The server instance is used for WebSocket connections if needed.
   */
  const server = await registerRoutes(app);

  /**
   * Global Error Handler
   * 
   * This middleware catches any errors that weren't handled in route handlers.
   * It formats the error as JSON and sends an appropriate HTTP status code.
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Get status code from the error or default to 500
    const status = err.status || err.statusCode || 500;
    // Get error message or use a generic message
    const message = err.message || "Internal Server Error";

    // Send the error response
    res.status(status).json({ message });
    // Re-throw the error for logging
    throw err;
  });

  /**
   * Client-Side Application Serving
   * 
   * In development mode, Vite is used to serve the client with hot reloading.
   * In production mode, static assets are served.
   * 
   * Note: This must be set up after API routes to prevent the catch-all route
   * from interfering with API routes.
   */
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  /**
   * Start Server
   * 
   * The server listens on port 5000 and binds to all network interfaces (0.0.0.0).
   * This port serves both the API and the client application.
   */
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",  // Bind to all network interfaces
    reusePort: true,  // Allow multiple instances to bind to the same port (useful for clustering)
  }, () => {
    log(`serving on port ${port}`);
  });
})();
