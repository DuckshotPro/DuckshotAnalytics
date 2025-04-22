/**
 * Server Logging Module
 * 
 * This module provides standardized logging functions for the server.
 * It supports different log levels and formats logs consistently.
 */

import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

// Configurable settings
const LOG_TO_CONSOLE = true;
const LOG_TO_FILE = true;
const LOG_LEVEL = process.env.LOG_LEVEL || LogLevel.INFO;
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (LOG_TO_FILE) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

/**
 * Formats a log message with timestamp, level, and contextual information
 */
function formatLogMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (context) {
    return `${logMessage} ${JSON.stringify(context)}`;
  }
  
  return logMessage;
}

/**
 * Writes a log entry to a file
 */
function writeToFile(level: LogLevel, message: string): void {
  if (!LOG_TO_FILE) return;
  
  try {
    const date = format(new Date(), 'yyyy-MM-dd');
    const logFile = path.join(LOG_DIR, `${date}.log`);
    
    fs.appendFileSync(logFile, `${message}\n`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Determines if a given log level should be logged based on the configured level
 */
function shouldLog(level: LogLevel): boolean {
  const levels = Object.values(LogLevel);
  const configuredIndex = levels.indexOf(LOG_LEVEL as LogLevel);
  const currentIndex = levels.indexOf(level);
  
  return currentIndex >= configuredIndex;
}

/**
 * Core logging function that handles writing to console and file
 */
function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  if (!shouldLog(level)) return;
  
  const formattedMessage = formatLogMessage(level, message, context);
  
  if (LOG_TO_CONSOLE) {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARNING:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }
  
  if (LOG_TO_FILE) {
    writeToFile(level, formattedMessage);
  }
}

/**
 * Public logging interface
 */
export const logger = {
  debug: (message: string, context?: Record<string, any>) => log(LogLevel.DEBUG, message, context),
  info: (message: string, context?: Record<string, any>) => log(LogLevel.INFO, message, context),
  warn: (message: string, context?: Record<string, any>) => log(LogLevel.WARNING, message, context),
  error: (message: string, context?: Record<string, any>) => log(LogLevel.ERROR, message, context),
};

/**
 * Express middleware for logging HTTP requests
 */
export function requestLogger(req: any, res: any, next: Function) {
  const startTime = Date.now();
  
  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logContext: Record<string, any> = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      userAgent: req.get('user-agent'),
      duration: `${duration}ms`,
    };
    
    // Get authenticated user if available
    if (req.user) {
      logContext.user = req.user.id || req.user.username;
    }
    
    // Log with appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(`HTTP ${res.statusCode}`, logContext);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${res.statusCode}`, logContext);
    } else {
      logger.info(`HTTP ${res.statusCode}`, logContext);
    }
  });
  
  next();
}

// Export default logger instance
export default logger;