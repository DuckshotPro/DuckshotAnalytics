/**
 * Server Entry Point
 * 
 * This is the main file that initializes and starts the Express server.
 * It sets up middleware, routes, error handling, and serves both the API and the client.
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import logger, { requestLogger } from "./logger";
import path from "path";

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
app.use(requestLogger);

// Log application startup
logger.info("Application starting up", {
  environment: app.get("env"),
  nodeVersion: process.version
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
   * Start ETL Pipeline and Job Scheduler
   * 
   * Initialize background job processing for data fetching,
   * report generation, and data cleanup tasks.
   */
  try {
    const { jobScheduler } = await import('./services/job-scheduler');
    await jobScheduler.start();

    // Graceful shutdown handling
    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      jobScheduler.stop();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start job scheduler:', error as any);
  }

  /**
   * Global Error Handler
   * 
   * This middleware catches any errors that weren't handled in route handlers.
   * It formats the error as JSON and sends an appropriate HTTP status code.
   */
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Get status code from the error or default to 500
    const status = err.status || err.statusCode || 500;
    // Get error message or use a generic message
    const message = err.message || "Internal Server Error";

    // Log the error
    logger.error(`Error processing request: ${message}`, {
      status,
      path: req.path,
      method: req.method,
      stack: err.stack,
      userId: req.user ? (req.user as any).id : undefined
    });

    // Send the error response
    res.status(status).json({ message });
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
  } else { // Production mode
    // Serve static files first for all non-/api paths
    const distPath = path.resolve(process.cwd(), "dist", "public");
    app.use((req, res, next) => {
      if (req.url.startsWith('/api')) {
        return next(); // Skip static serving for API routes
      }
      express.static(distPath)(req, res, next);
    });

    // Fallback to index.html for any non-API, non-static route
    app.use((req, res) => {
      if (req.url.startsWith('/api')) {
        // If it's an API route and wasn't handled by registerRoutes, it's a 404
        res.status(404).json({ message: "API endpoint not found" });
      } else {
        res.sendFile(path.resolve(distPath, "index.html"));
      }
    });
  }

  /**
   * Start Server
   * 
   * The server listens on port 5000 and binds to all network interfaces (0.0.0.0).
   * This port serves both the API and the client application.
   */
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    logger.info(`Server started successfully`, { port, host: "0.0.0.0" });
    log(`serving on port ${port}`);
  });
})();
