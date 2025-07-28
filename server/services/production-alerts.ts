/**
 * Production Alert System
 * 
 * Handles error monitoring, alerting, and notification system
 * for production deployment and Snapchat application review
 */

import { storage } from '../storage';

export interface AlertConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    smtpConfig?: any;
  };
  webhook?: {
    enabled: boolean;
    url: string;
    secret?: string;
  };
  console: {
    enabled: boolean;
    level: 'info' | 'warn' | 'error';
  };
}

export interface Alert {
  id: string;
  type: 'job_failure' | 'system_health' | 'data_quality' | 'user_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

export class ProductionAlerts {
  private static instance: ProductionAlerts;
  private config: AlertConfig = {
    console: { enabled: true, level: 'error' },
    email: { enabled: false, recipients: [] },
    webhook: { enabled: false, url: '' }
  };

  public static getInstance(): ProductionAlerts {
    if (!ProductionAlerts.instance) {
      ProductionAlerts.instance = new ProductionAlerts();
    }
    return ProductionAlerts.instance;
  }

  updateConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
  }

  async sendAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const fullAlert: Alert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      resolved: false
    };

    // Log job execution for monitoring
    try {
      await storage.logJobExecution({
        jobType: 'alert',
        status: 'completed',
        executedAt: new Date(),
        completedAt: new Date(),
        metadata: fullAlert
      });
    } catch (error) {
      console.error('Failed to log alert:', error);
    }

    // Send to configured channels
    await Promise.allSettled([
      this.sendConsoleAlert(fullAlert),
      this.sendEmailAlert(fullAlert),
      this.sendWebhookAlert(fullAlert)
    ]);
  }

  private async sendConsoleAlert(alert: Alert): Promise<void> {
    if (!this.config.console.enabled) return;

    const logLevel = this.getLogLevel(alert.severity);
    const logMethod = console[logLevel] || console.log;
    
    logMethod(`🚨 PRODUCTION ALERT [${alert.severity.toUpperCase()}]`, {
      type: alert.type,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp,
      metadata: alert.metadata
    });
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    if (!this.config.email?.enabled || !this.config.email.recipients.length) {
      return;
    }

    // Email implementation would go here
    console.log('📧 Email alert would be sent to:', this.config.email.recipients, {
      subject: `[${alert.severity.toUpperCase()}] DuckShot Analytics - ${alert.title}`,
      body: this.formatEmailBody(alert)
    });
  }

  private async sendWebhookAlert(alert: Alert): Promise<void> {
    if (!this.config.webhook?.enabled || !this.config.webhook.url) {
      return;
    }

    try {
      const response = await fetch(this.config.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.webhook.secret && { 
            'Authorization': `Bearer ${this.config.webhook.secret}` 
          })
        },
        body: JSON.stringify({
          alert,
          service: 'DuckShot Analytics',
          environment: process.env.NODE_ENV || 'development'
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  // Specific alert types for common production scenarios
  async alertJobFailure(jobType: string, userId: number | null, error: Error, attemptCount: number): Promise<void> {
    await this.sendAlert({
      type: 'job_failure',
      severity: attemptCount >= 3 ? 'high' : 'medium',
      title: `Job Failure: ${jobType}`,
      message: `Job "${jobType}" failed ${attemptCount} times. Error: ${error.message}`,
      metadata: {
        jobType,
        userId,
        error: error.stack,
        attemptCount,
        timestamp: new Date().toISOString()
      }
    });
  }

  async alertSystemHealth(healthStatus: any): Promise<void> {
    const severity = healthStatus.status === 'unhealthy' ? 'critical' : 'medium';
    
    await this.sendAlert({
      type: 'system_health',
      severity,
      title: `System Health: ${healthStatus.status}`,
      message: `System health check failed. Status: ${healthStatus.status}`,
      metadata: {
        healthStatus,
        services: healthStatus.services,
        metrics: healthStatus.metrics
      }
    });
  }

  async alertDataQuality(userId: number, dataType: string, issue: string): Promise<void> {
    await this.sendAlert({
      type: 'data_quality',
      severity: 'medium',
      title: 'Data Quality Issue',
      message: `Data quality issue detected for user ${userId}: ${issue}`,
      metadata: {
        userId,
        dataType,
        issue,
        timestamp: new Date().toISOString()
      }
    });
  }

  async alertUserError(userId: number, action: string, error: string): Promise<void> {
    await this.sendAlert({
      type: 'user_error',
      severity: 'low',
      title: 'User Action Error',
      message: `User ${userId} encountered error during ${action}: ${error}`,
      metadata: {
        userId,
        action,
        error,
        timestamp: new Date().toISOString()
      }
    });
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  private formatEmailBody(alert: Alert): string {
    return `
DuckShot Analytics Production Alert

Severity: ${alert.severity.toUpperCase()}
Type: ${alert.type}
Time: ${alert.timestamp}

${alert.title}

${alert.message}

${alert.metadata ? `
Additional Details:
${JSON.stringify(alert.metadata, null, 2)}
` : ''}

This is an automated alert from the DuckShot Analytics production monitoring system.
    `.trim();
  }
}

export const productionAlerts = ProductionAlerts.getInstance();