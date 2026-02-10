/**
 * Production Health Monitoring System
 * 
 * Monitors ETL pipeline health, database connectivity, and system status
 * for production deployment and Snapchat application review
 */

import { storage } from '../storage';
import { dataFetchQueue, reportGenerationQueue, dataCleanupQueue } from './job-scheduler';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    etlPipeline: ServiceHealth;
    jobQueues: ServiceHealth;
    backgroundJobs: ServiceHealth;
  };
  metrics: {
    totalUsers: number;
    activeJobs: number;
    failedJobs: number;
    lastDataSync: string | null;
  };
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthCache: HealthStatus | null = null;
  private lastCheck: Date = new Date(0);
  private readonly CACHE_DURATION = 30000; // 30 seconds

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const now = new Date();
    
    // Return cached result if still valid
    if (this.healthCache && (now.getTime() - this.lastCheck.getTime()) < this.CACHE_DURATION) {
      return this.healthCache;
    }

    const status = await this.performHealthCheck();
    this.healthCache = status;
    this.lastCheck = now;
    
    return status;
  }

  private async performHealthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    
    // Check all services in parallel
    const [
      databaseHealth,
      etlHealth,
      queueHealth,
      jobHealth,
      metrics
    ] = await Promise.all([
      this.checkDatabase(),
      this.checkETLPipeline(),
      this.checkJobQueues(),
      this.checkBackgroundJobs(),
      this.getSystemMetrics()
    ]);

    // Determine overall status
    const services = {
      database: databaseHealth,
      etlPipeline: etlHealth,
      jobQueues: queueHealth,
      backgroundJobs: jobHealth
    };

    const overallStatus = this.calculateOverallStatus(services);

    return {
      status: overallStatus,
      timestamp,
      services,
      metrics
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Test database connectivity
      await storage.getAllUsers();
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  private async checkETLPipeline(): Promise<ServiceHealth> {
    try {
      // Check if ETL services are properly imported and accessible
      const { jobScheduler } = await import('./job-scheduler');
      
      return {
        status: 'up',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'ETL pipeline error'
      };
    }
  }

  private async checkJobQueues(): Promise<ServiceHealth> {
    try {
      // Check if queues are accessible
      if (!dataFetchQueue || !reportGenerationQueue || !dataCleanupQueue) {
        return {
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          error: 'Using development fallback queues (Redis not available)'
        };
      }

      // For Bull queues, check Redis connectivity
      if ('getJobs' in dataFetchQueue) {
        await (dataFetchQueue as any).getJobs(['waiting'], 0, 1);
      }

      return {
        status: 'up',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Queue system error'
      };
    }
  }

  private async checkBackgroundJobs(): ServiceHealth {
    try {
      // Check recent job execution logs
      const recentJobs = await this.getRecentJobLogs();
      const failedJobs = recentJobs.filter(job => job.status === 'failed');
      
      if (failedJobs.length > recentJobs.length * 0.5) {
        return {
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          error: `High failure rate: ${failedJobs.length}/${recentJobs.length} jobs failed`
        };
      }

      return {
        status: 'up',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Background job monitoring error'
      };
    }
  }

  private async getSystemMetrics() {
    try {
      const users = await storage.getAllUsers();
      const recentJobs = await this.getRecentJobLogs();
      const activeJobs = recentJobs.filter(job => job.status === 'active').length;
      const failedJobs = recentJobs.filter(job => job.status === 'failed').length;
      
      // Get last successful data sync
      const successfulSyncs = recentJobs
        .filter(job => job.jobType === 'fetch-user-data' && job.status === 'completed')
        .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
      
      return {
        totalUsers: users.length,
        activeJobs,
        failedJobs,
        lastDataSync: successfulSyncs.length > 0 ? successfulSyncs[0].executedAt.toISOString() : null
      };
    } catch (error) {
      return {
        totalUsers: 0,
        activeJobs: 0,
        failedJobs: 0,
        lastDataSync: null
      };
    }
  }

  private async getRecentJobLogs() {
    try {
      // This would need to be implemented in storage to get recent job logs
      // For now, return empty array
      return [];
    } catch (error) {
      return [];
    }
  }

  private calculateOverallStatus(services: Record<string, ServiceHealth>): 'healthy' | 'degraded' | 'unhealthy' {
    const statusValues = Object.values(services);
    
    if (statusValues.every(service => service.status === 'up')) {
      return 'healthy';
    }
    
    if (statusValues.some(service => service.status === 'down')) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }

  // Production alerting method
  async checkAndAlert(): Promise<void> {
    const health = await this.getHealthStatus();
    
    if (health.status === 'unhealthy') {
      console.error('🚨 PRODUCTION ALERT: System is unhealthy', {
        timestamp: health.timestamp,
        services: health.services,
        metrics: health.metrics
      });
      
      // In production, this would send alerts via email, Slack, etc.
      await this.sendProductionAlert(health);
    } else if (health.status === 'degraded') {
      console.warn('⚠️ PRODUCTION WARNING: System is degraded', {
        timestamp: health.timestamp,
        services: health.services
      });
    }
  }

  private async sendProductionAlert(health: HealthStatus): Promise<void> {
    // Production alerting logic would go here
    // For now, just log the alert
    console.log('Production alert would be sent:', {
      subject: 'DuckShot Analytics - System Health Alert',
      severity: health.status,
      details: health
    });
  }
}

export const healthMonitor = HealthMonitor.getInstance();