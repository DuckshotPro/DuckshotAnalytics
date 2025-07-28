/**
 * Development Queue Fallback
 * 
 * Simple in-memory queue implementation for development when Redis is not available
 */

export interface Job {
  id: string;
  type: string;
  data: any;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  attemptsMade: number;
  maxAttempts: number;
  processor?: (job: Job) => Promise<void>;
}

export class DevelopmentQueue {
  private jobs: Map<string, Job> = new Map();
  private processors: Map<string, (job: Job) => Promise<void>> = new Map();
  private isProcessing = false;

  constructor(private queueName: string) {}

  async add(type: string, data: any): Promise<void> {
    const jobId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: Job = {
      id: jobId,
      type,
      data,
      status: 'waiting',
      attemptsMade: 0,
      maxAttempts: 3,
    };

    this.jobs.set(jobId, job);
    console.log(`📝 Added job ${jobId} to ${this.queueName} queue`);
    
    // Process jobs immediately in development
    this.processNext();
  }

  process(type: string, processor: (job: Job) => Promise<void>): void {
    this.processors.set(type, processor);
    console.log(`🔧 Registered processor for ${type} in ${this.queueName}`);
  }

  async getFailed(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.status === 'failed');
  }

  async getJobs(types: string[]): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => types.includes(job.status));
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const waitingJobs = Array.from(this.jobs.values()).filter(job => job.status === 'waiting');
      
      for (const job of waitingJobs) {
        const processor = this.processors.get(job.type);
        if (!processor) continue;

        job.status = 'active';
        console.log(`🔄 Processing job ${job.id}`);

        try {
          await processor(job);
          job.status = 'completed';
          console.log(`✅ Completed job ${job.id}`);
        } catch (error) {
          job.attemptsMade++;
          if (job.attemptsMade >= job.maxAttempts) {
            job.status = 'failed';
            console.error(`❌ Failed job ${job.id} after ${job.maxAttempts} attempts:`, error);
          } else {
            job.status = 'waiting';
            console.log(`🔄 Retrying job ${job.id} (attempt ${job.attemptsMade + 1}/${job.maxAttempts})`);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}