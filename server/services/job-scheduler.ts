/**
 * Job Scheduler and ETL Pipeline
 * 
 * Handles all background tasks including:
 * - Data sync from Snapchat API
 * - Report generation
 * - Data cleanup and retention
 * - Queue management
 */

import * as cron from 'node-cron';
import Bull from 'bull';
import Redis from 'ioredis';
import { DevelopmentQueue } from './development-queue';
import { storage } from '../storage';
import { fetchSnapchatData } from './snapchat';
import { generateWeeklyReports } from './automated-reports';
import { User } from '@shared/schema';

// Redis connection for queue management - fallback to in-memory for development
let redis: Redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
} catch (error) {
  console.log('Redis not available, using in-memory fallback for development');
  // In development, we'll use a memory store instead of Redis
  redis = null as any;
}

// Job queues - fallback to memory store for development
export const dataFetchQueue = redis ? new Bull('data-fetch', { redis: { host: 'localhost', port: 6379 } }) : new DevelopmentQueue('data-fetch');
export const reportGenerationQueue = redis ? new Bull('report-generation', { redis: { host: 'localhost', port: 6379 } }) : new DevelopmentQueue('report-generation');
export const dataCleanupQueue = redis ? new Bull('data-cleanup', { redis: { host: 'localhost', port: 6379 } }) : new DevelopmentQueue('data-cleanup');

export interface JobScheduler {
  start(): void;
  stop(): void;
  addUser(userId: number): Promise<void>;
  removeUser(userId: number): Promise<void>;
}

class SnapchatETLScheduler implements JobScheduler {
  private tasks: cron.ScheduledTask[] = [];
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    
    console.log('🚀 Starting ETL Pipeline and Job Scheduler...');
    
    // 1. Data fetch jobs - every 15 minutes for premium, 24 hours for free
    const premiumDataFetch = cron.schedule('*/15 * * * *', async () => {
      await this.schedulePremiumDataFetch();
    }, { scheduled: false });

    const freeDataFetch = cron.schedule('0 0 * * *', async () => {
      await this.scheduleFreeDataFetch();
    }, { scheduled: false });

    // 2. Weekly report generation - Sundays at 9 AM
    const weeklyReports = cron.schedule('0 9 * * 0', async () => {
      await this.scheduleWeeklyReports();
    }, { scheduled: false });

    // 3. Data retention cleanup - Daily at 2 AM
    const dataCleanup = cron.schedule('0 2 * * *', async () => {
      await this.scheduleDataCleanup();
    }, { scheduled: false });

    // 4. Queue processing recovery - every 5 minutes
    const queueRecovery = cron.schedule('*/5 * * * *', async () => {
      await this.processFailedJobs();
    }, { scheduled: false });

    // Start all tasks
    premiumDataFetch.start();
    freeDataFetch.start();
    weeklyReports.start();
    dataCleanup.start();
    queueRecovery.start();

    this.tasks = [premiumDataFetch, freeDataFetch, weeklyReports, dataCleanup, queueRecovery];
    this.isRunning = true;

    // Setup queue processors
    this.setupQueueProcessors();
    
    console.log('✅ ETL Pipeline and Job Scheduler started successfully');
  }

  stop(): void {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping ETL Pipeline and Job Scheduler...');
    
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    this.isRunning = false;
    
    console.log('✅ ETL Pipeline and Job Scheduler stopped');
  }

  async addUser(userId: number): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    // Schedule immediate data fetch for new user
    if (dataFetchQueue) {
      await dataFetchQueue.add('fetch-user-data', { userId, immediate: true });
      console.log(`📊 Scheduled data fetch for new user ${userId}`);
    }
  }

  async removeUser(userId: number): Promise<void> {
    if (dataFetchQueue && 'getJobs' in dataFetchQueue) {
      // Remove user from all queues (Bull queues only)
      const jobs = await (dataFetchQueue as any).getJobs(['waiting', 'active', 'delayed']);
      for (const job of jobs) {
        if (job.data.userId === userId) {
          await job.remove();
        }
      }
    }
    console.log(`🗑️ Removed user ${userId} from all queues`);
  }

  private async schedulePremiumDataFetch(): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      const premiumUsers = users.filter(u => u.subscription === 'premium');
      
      for (const user of premiumUsers) {
        if (user.snapchatClientId && user.snapchatApiKey && dataFetchQueue) {
          await dataFetchQueue.add('fetch-user-data', { 
            userId: user.id, 
            userType: 'premium' 
          });
        }
      }
      
      console.log(`📈 Scheduled data fetch for ${premiumUsers.length} premium users`);
    } catch (error) {
      console.error('Error scheduling premium data fetch:', error);
    }
  }

  private async scheduleFreeDataFetch(): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      const freeUsers = users.filter(u => u.subscription === 'free');
      
      for (const user of freeUsers) {
        if (user.snapchatClientId && user.snapchatApiKey && dataFetchQueue) {
          await dataFetchQueue.add('fetch-user-data', { 
            userId: user.id, 
            userType: 'free' 
          });
        }
      }
      
      console.log(`📊 Scheduled data fetch for ${freeUsers.length} free users`);
    } catch (error) {
      console.error('Error scheduling free data fetch:', error);
    }
  }

  private async scheduleWeeklyReports(): Promise<void> {
    try {
      if (reportGenerationQueue) {
        await reportGenerationQueue.add('weekly-reports', {});
        console.log('📧 Scheduled weekly report generation');
      }
    } catch (error) {
      console.error('Error scheduling weekly reports:', error);
    }
  }

  private async scheduleDataCleanup(): Promise<void> {
    try {
      if (dataCleanupQueue) {
        await dataCleanupQueue.add('cleanup-old-data', {});
        console.log('🧹 Scheduled data cleanup');
      }
    } catch (error) {
      console.error('Error scheduling data cleanup:', error);
    }
  }

  private async processFailedJobs(): Promise<void> {
    try {
      // Retry failed jobs from all queues
      const queues = [dataFetchQueue, reportGenerationQueue, dataCleanupQueue];
      
      for (const queue of queues) {
        const failedJobs = await queue.getFailed();
        for (const job of failedJobs) {
          if (job.attemptsMade < 3) {
            await job.retry();
            console.log(`🔄 Retrying failed job ${job.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing failed jobs:', error);
    }
  }

  private setupQueueProcessors(): void {
    // Data fetch processor
    dataFetchQueue.process('fetch-user-data', async (job) => {
      const { userId, userType, immediate } = job.data;
      
      try {
        const user = await storage.getUser(userId);
        if (!user || !user.snapchatClientId || !user.snapchatApiKey) {
          throw new Error(`Invalid user data for user ${userId}`);
        }

        console.log(`🔄 Fetching Snapchat data for user ${userId} (${userType})`);
        
        const snapchatData = await fetchSnapchatData(user.snapchatClientId, user.snapchatApiKey);
        await storage.saveSnapchatData(userId, snapchatData);
        
        console.log(`✅ Successfully fetched data for user ${userId}`);
        
        // Update job tracking
        await storage.logJobExecution({
          userId,
          jobType: 'data-fetch',
          status: 'completed',
          executedAt: new Date(),
          metadata: { userType, immediate }
        });
        
      } catch (error) {
        console.error(`❌ Error fetching data for user ${userId}:`, error);
        
        await storage.logJobExecution({
          userId,
          jobType: 'data-fetch',
          status: 'failed',
          executedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: { userType, immediate }
        });
        
        throw error;
      }
    });

    // Report generation processor
    reportGenerationQueue.process('weekly-reports', async (job) => {
      try {
        console.log('📧 Generating weekly reports...');
        await generateWeeklyReports();
        console.log('✅ Weekly reports generated successfully');
        
        await storage.logJobExecution({
          jobType: 'weekly-reports',
          status: 'completed',
          executedAt: new Date()
        });
        
      } catch (error) {
        console.error('❌ Error generating weekly reports:', error);
        
        await storage.logJobExecution({
          jobType: 'weekly-reports',
          status: 'failed',
          executedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    });

    // Data cleanup processor
    dataCleanupQueue.process('cleanup-old-data', async (job) => {
      try {
        console.log('🧹 Starting data cleanup...');
        
        const users = await storage.getAllUsers();
        let totalCleaned = 0;
        
        for (const user of users) {
          const retentionDays = user.subscription === 'premium' ? 90 : 30;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
          
          const cleaned = await storage.cleanupOldData(user.id, cutoffDate);
          totalCleaned += cleaned;
        }
        
        console.log(`✅ Data cleanup completed. Cleaned ${totalCleaned} old records`);
        
        await storage.logJobExecution({
          jobType: 'data-cleanup',
          status: 'completed',
          executedAt: new Date(),
          metadata: { recordsCleaned: totalCleaned }
        });
        
      } catch (error) {
        console.error('❌ Error during data cleanup:', error);
        
        await storage.logJobExecution({
          jobType: 'data-cleanup',
          status: 'failed',
          executedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    });
  }
}

// Export singleton instance
export const jobScheduler = new SnapchatETLScheduler();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📤 Received SIGTERM, shutting down gracefully...');
  jobScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📤 Received SIGINT, shutting down gracefully...');
  jobScheduler.stop();
  process.exit(0);
});