/**
 * Snapchat Scheduler Seed Data
 * 
 * Creates test data for the Snapchat scheduler feature.
 * Run this to populate the database with sample scheduled posts and logs.
 */

import { db } from "../../db";
import {
    snapchatScheduledContent,
    snapchatPublishLog,
    ScheduledContentStatus,
    PublishLogStatus,
    ContentType,
} from "@shared/schema";

/**
 * Seed snapchat scheduler data
 * Creates sample scheduled posts and publish logs for testing
 */
export async function seedSnapchatScheduler() {
    console.log("🌱 Seeding Snapchat Scheduler data...");

    try {
        // Sample user ID (assumes user with ID 1 exists)
        const userId = 1;
        const snapchatAccountId = "test-snapchat-account-123";

        // Calculate dates
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Sample scheduled posts
        const posts = await db.insert(snapchatScheduledContent).values([
            // 1. Scheduled for tomorrow - ready to go
            {
                userId,
                snapchatAccountId,
                contentType: ContentType.VIDEO,
                mediaUrl: "https://storage.example.com/videos/sample-1.mp4",
                thumbnailUrl: "https://storage.example.com/thumbnails/sample-1.jpg",
                caption: "Check out our latest product launch! 🚀 #NewProduct #Innovation",
                duration: 30,
                scheduledFor: tomorrow,
                timezone: "America/Chicago",
                isRecurring: false,
                status: ScheduledContentStatus.SCHEDULED,
                metadata: {
                    hashtags: ["NewProduct", "Innovation"],
                    location: { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" }
                },
            },

            // 2. Scheduled for next week - recurring weekly
            {
                userId,
                snapchatAccountId,
                contentType: ContentType.IMAGE,
                mediaUrl: "https://storage.example.com/images/motivational-monday.jpg",
                thumbnailUrl: "https://storage.example.com/thumbnails/motivational-monday.jpg",
                caption: "Happy Monday! Let's make this week amazing! 💪 #MotivationMonday",
                scheduledFor: nextWeek,
                timezone: "America/Chicago",
                isRecurring: true,
                recurringPattern: {
                    frequency: "weekly",
                    interval: 1,
                    daysOfWeek: [1], // Monday
                    endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                },
                status: ScheduledContentStatus.SCHEDULED,
                metadata: {
                    hashtags: ["MotivationMonday"],
                },
            },

            // 3. Draft - not yet scheduled
            {
                userId,
                snapchatAccountId,
                contentType: ContentType.VIDEO,
                mediaUrl: "https://storage.example.com/videos/behind-the-scenes.mp4",
                thumbnailUrl: "https://storage.example.com/thumbnails/behind-the-scenes.jpg",
                caption: "Behind the scenes at our office! 🎬",
                duration: 45,
                scheduledFor: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                timezone: "America/Chicago",
                isRecurring: false,
                status: ScheduledContentStatus.DRAFT,
            },

            // 4. Published successfully yesterday
            {
                userId,
                snapchatAccountId,
                contentType: ContentType.STORY,
                mediaUrl: "https://storage.example.com/stories/daily-update.mp4",
                thumbnailUrl: "https://storage.example.com/thumbnails/daily-update.jpg",
                caption: "Your daily dose of inspiration ✨",
                duration: 15,
                scheduledFor: yesterday,
                timezone: "America/Chicago",
                isRecurring: false,
                status: ScheduledContentStatus.PUBLISHED,
                publishedAt: yesterday,
            },

            // 5. Failed to publish (max retries exceeded)
            {
                userId,
                snapchatAccountId,
                contentType: ContentType.VIDEO,
                mediaUrl: "https://storage.example.com/videos/failed-post.mp4",
                thumbnailUrl: "https://storage.example.com/thumbnails/failed-post.jpg",
                caption: "This post failed to publish",
                duration: 20,
                scheduledFor: lastWeek,
                timezone: "America/Chicago",
                isRecurring: false,
                status: ScheduledContentStatus.FAILED,
                failureReason: "Snapchat API error: Invalid access token",
                retryCount: 3,
                maxRetries: 3,
            },
        ]).returning();

        console.log(`✅ Created ${posts.length} sample scheduled posts`);

        // Create publish logs for some posts
        const publishLogs = await db.insert(snapchatPublishLog).values([
            // Successful publish for post 4
            {
                scheduledContentId: posts[3].id, // Published post
                status: PublishLogStatus.SUCCESS,
                snapchatPostId: "snap-post-abc123",
                attemptedAt: yesterday,
                responseData: {
                    postId: "snap-post-abc123",
                    publishedAt: yesterday.toISOString(),
                    views: 0,
                },
            },

            // Failed attempts for post 5
            {
                scheduledContentId: posts[4].id, // Failed post
                status: PublishLogStatus.FAILED,
                errorMessage: "Snapchat API error: Invalid access token",
                errorCode: "AUTH_ERROR",
                attemptedAt: new Date(lastWeek.getTime() + 60 * 1000), // 1 min after scheduled
                responseData: {
                    error: "invalid_token",
                    error_description: "The access token is invalid or has expired",
                },
            },
            {
                scheduledContentId: posts[4].id,
                status: PublishLogStatus.RETRYING,
                errorMessage: "Snapchat API error: Invalid access token",
                errorCode: "AUTH_ERROR",
                attemptedAt: new Date(lastWeek.getTime() + 2 * 60 * 1000), // 2 mins later (retry 1)
                responseData: {
                    error: "invalid_token",
                    retryAttempt: 1,
                },
            },
            {
                scheduledContentId: posts[4].id,
                status: PublishLogStatus.RETRYING,
                errorMessage: "Snapchat API error: Invalid access token",
                errorCode: "AUTH_ERROR",
                attemptedAt: new Date(lastWeek.getTime() + 7 * 60 * 1000), // 7 mins later (retry 2)
                responseData: {
                    error: "invalid_token",
                    retryAttempt: 2,
                },
            },
            {
                scheduledContentId: posts[4].id,
                status: PublishLogStatus.FAILED,
                errorMessage: "Snapchat API error: Invalid access token - Max retries exceeded",
                errorCode: "AUTH_ERROR",
                attemptedAt: new Date(lastWeek.getTime() + 22 * 60 * 1000), // 22 mins later (final retry)
                responseData: {
                    error: "invalid_token",
                    retryAttempt: 3,
                    maxRetriesExceeded: true,
                },
            },

            // Additional successful publishes for analytics
            {
                scheduledContentId: posts[3].id,
                status: PublishLogStatus.SUCCESS,
                snapchatPostId: "snap-post-xyz789",
                attemptedAt: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000), // 2 days ago
                responseData: {
                    postId: "snap-post-xyz789",
                    views: 1250,
                },
            },
            {
                scheduledContentId: posts[3].id,
                status: PublishLogStatus.SUCCESS,
                snapchatPostId: "snap-post-def456",
                attemptedAt: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000), // 4 days ago
                responseData: {
                    postId: "snap-post-def456",
                    views: 890,
                },
            },
        ]).returning();

        console.log(`✅ Created ${publishLogs.length} sample publish logs`);

        console.log("\n🎉 Snapchat Scheduler seed data created successfully!");
        console.log(`\nSummary:`);
        console.log(`  - ${posts.filter(p => p.status === ScheduledContentStatus.SCHEDULED).length} scheduled posts`);
        console.log(`  - ${posts.filter(p => p.status === ScheduledContentStatus.DRAFT).length} draft posts`);
        console.log(`  - ${posts.filter(p => p.status === ScheduledContentStatus.PUBLISHED).length} published posts`);
        console.log(`  - ${posts.filter(p => p.status === ScheduledContentStatus.FAILED).length} failed posts`);
        console.log(`  - ${publishLogs.length} publish log entries\n`);

        return {
            posts,
            publishLogs,
        };
    } catch (error) {
        console.error("❌ Error seeding Snapchat Scheduler data:", error);
        throw error;
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    seedSnapchatScheduler()
        .then(() => {
            console.log("✅ Seeding complete");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Seeding failed:", error);
            process.exit(1);
        });
}
