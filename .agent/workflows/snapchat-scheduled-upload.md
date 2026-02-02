---
description: Snapchat Scheduled Creator Content Upload - Implementation Guide
---

# Snapchat Scheduled Upload Feature - Implementation Guideline

## 📋 Overview
This guide provides a complete roadmap for implementing scheduled uploads of creator content to Snapchat, leveraging your existing Snapchat API integration and the extensive API reference materials available.

## 📚 Reference Materials

### Primary API Documentation Location
**Directory**: `C:\Users\420du\.context\SnapChat\`

### Key Resources:
- **Lens Studio Plugins**: `C:\Users\420du\.context\SnapChat\Lens-Studio-Plugins\`
- **Snap Cloud Integration**: `C:\Users\420du\.context\SnapChat\Spectacles-Sample\Snap Cloud\`
- **Mobile Kit APIs**: `C:\Users\420du\.context\SnapChat\Spectacles-Sample\Spectacles Mobile Kit\`
  - `android-api.md`
  - `ios-api.md`
  - `lens-api.md`

### Existing Project Files:
- **Backend Service**: `c:\Users\420du\DuckSnapAnalytics\server\services\snapchat.ts`
- **Python Service**: `c:\Users\420du\DuckSnapAnalytics\python_agents\services\snapchat.py`
- **Client API**: `c:\Users\420du\DuckSnapAnalytics\client\src\lib\snapchatApi.ts`
- **Agent**: `c:\Users\420du\DuckSnapAnalytics\server\agents\snapchat-data-fetcher-agent.ts`

---

## 🎯 Feature Requirements

### Core Functionality
1. **Content Queue Management**
   - Upload and store creator content (images/videos)
   - Set publish time (immediate or scheduled)
   - Support for batch uploads
   - Preview before scheduling

2. **Scheduling System**
   - Calendar-based scheduling UI
   - Recurring post support (daily, weekly, custom)
   - Time zone handling
   - Queue visualization

3. **Content Processing**
   - Media validation (format, size, duration)
   - Thumbnail generation
   - Caption/overlay management
   - Hashtag suggestions

4. **Publishing Engine**
   - Automated posting at scheduled times
   - Retry logic for failed uploads
   - Rate limit handling
   - Success/failure notifications

5. **Analytics Integration**
   - Track scheduled vs published
   - Post-publish performance tracking
   - Optimal posting time recommendations

---

## 🗂️ Database Schema

### New Tables Required

```typescript
// db/schema/snapchat_scheduled_content.ts

export const snapchatScheduledContent = pgTable("snapchat_scheduled_content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  snapchatAccountId: varchar("snapchat_account_id", { length: 255 }).notNull(),
  
  // Content Details
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'image', 'video', 'story'
  mediaUrl: text("media_url").notNull(), // S3/Storage URL
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  duration: integer("duration"), // seconds (for videos)
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"), // {frequency: 'daily', interval: 1, endDate: '...'}
  
  // Status Management
  status: varchar("status", { length: 50 }).default("scheduled"), 
  // Status: 'draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'
  publishedAt: timestamp("published_at"),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional Snapchat API fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const snapchatPublishLog = pgTable("snapchat_publish_log", {
  id: serial("id").primaryKey(),
  scheduledContentId: integer("scheduled_content_id").references(() => snapchatScheduledContent.id),
  attemptedAt: timestamp("attempted_at").defaultNow(),
  status: varchar("status", { length: 50 }).notNull(),
  snapchatPostId: varchar("snapchat_post_id", { length: 255 }),
  errorMessage: text("error_message"),
  responseData: jsonb("response_data"),
});
```

---

## 🏗️ Architecture

### 1. Frontend Components

#### Upload & Schedule UI
```
client/src/pages/snapchat-scheduler.tsx
├── components/
│   ├── MediaUploader.tsx          # Drag-drop media upload
│   ├── ScheduleCalendar.tsx       # Calendar view
│   ├── ContentQueue.tsx           # Scheduled posts list
│   ├── PostPreview.tsx            # Preview modal
│   └── RecurringSchedule.tsx      # Recurring post config
```

#### Key Features:
- Drag-and-drop media upload
- Visual calendar for scheduling
- Queue management (edit, delete, reschedule)
- Real-time status updates

### 2. Backend Services

#### Scheduling Service
```typescript
// server/services/snapchat-scheduler.ts

class SnapchatSchedulerService {
  // Create scheduled post
  async schedulePost(userId, accountId, content, scheduledTime);
  
  // Get user's scheduled posts
  async getScheduledPosts(userId, filters);
  
  // Update scheduled post
  async updateScheduledPost(postId, updates);
  
  // Cancel scheduled post
  async cancelScheduledPost(postId);
  
  // Process due posts (called by cron)
  async processDuePosts();
}
```

#### Publishing Service
```typescript
// server/services/snapchat-publisher.ts

class SnapchatPublisherService {
  // Publish single post
  async publishPost(scheduledContentId);
  
  // Handle publish retry
  async retryFailedPost(scheduledContentId);
  
  // Validate media before upload
  async validateMedia(file);
  
  // Upload to Snapchat API
  async uploadToSnapchat(accountId, media, caption, metadata);
}
```

### 3. Cron Jobs / Scheduled Tasks

```typescript
// server/jobs/snapchat-publisher-job.ts

// Run every minute to check for due posts
export async function snapchatPublisherJob() {
  const duePosts = await db
    .select()
    .from(snapchatScheduledContent)
    .where(
      and(
        eq(snapchatScheduledContent.status, "scheduled"),
        lte(snapchatScheduledContent.scheduledFor, new Date())
      )
    );
  
  for (const post of duePosts) {
    await publisherService.publishPost(post.id);
  }
}
```

### 4. File Storage

Use existing storage solution (S3/local) for media:
```
uploads/
├── snapchat/
│   ├── scheduled/
│   │   ├── {userId}/
│   │   │   ├── {postId}/
│   │   │   │   ├── original.mp4
│   │   │   │   └── thumbnail.jpg
```

---

## 🔌 Snapchat API Integration

### Authentication
Reference your existing OAuth implementation:
- `server/services/snapchat.ts` - OAuth flow
- Scopes needed: `snapchat-profile-read`, `snapchat-content-write`

### Content Upload Endpoints

#### 1. Story Upload API
```typescript
POST https://adsapi.snapchat.com/v1/me/media

Headers:
  Authorization: Bearer {access_token}
  Content-Type: multipart/form-data

Body:
  media: (binary file)
  media_type: "IMAGE" | "VIDEO"
  name: "Post Title"
```

#### 2. Creative API (for ads, if applicable)
```typescript
POST https://adsapi.snapchat.com/v1/adaccounts/{ad_account_id}/media

// Check Snap Cloud documentation:
// C:\Users\420du\.context\SnapChat\Spectacles-Sample\Snap Cloud\README.md
```

### Rate Limits
- Monitor API responses for rate limit headers
- Implement exponential backoff
- Queue system to prevent hitting limits

---

## 📅 Implementation Plan

// turbo-all

### Phase 1: Database & Core Schema (Week 1)
```bash
# 1. Create migration file
npm run db:generate

# 2. Apply migration
npm run db:migrate

# 3. Update schema types
npm run db:introspect
```

**Tasks:**
- [ ] Create scheduled content table
- [ ] Create publish log table
- [ ] Add indexes for performance
- [ ] Write seed data for testing

### Phase 2: Backend Services (Week 1-2)
**Tasks:**
- [ ] Implement `SnapchatSchedulerService`
  - Schedule post creation
  - Queue management
  - Update/cancel operations
- [ ] Implement `SnapchatPublisherService`
  - Media validation
  - Snapchat API upload
  - Retry logic
- [ ] Create API routes
  - `POST /api/snapchat/schedule`
  - `GET /api/snapchat/scheduled`
  - `PUT /api/snapchat/scheduled/:id`
  - `DELETE /api/snapchat/scheduled/:id`
- [ ] Set up cron job for publishing

### Phase 3: File Upload & Storage (Week 2)
**Tasks:**
- [ ] Configure media storage (S3/local)
- [ ] Implement file upload endpoint
- [ ] Add media processing (thumbnails, compression)
- [ ] Validate media formats (Snapchat specs)

### Phase 4: Frontend UI (Week 2-3)
**Tasks:**
- [ ] Create scheduler page layout
- [ ] Build media uploader component
- [ ] Implement calendar view
- [ ] Build queue management UI
- [ ] Add post preview modal
- [ ] Implement recurring schedule config

### Phase 5: Testing & Polish (Week 3-4)
**Tasks:**
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for scheduling flow
- [ ] Performance testing (large queues)
- [ ] Error handling refinement
- [ ] UI/UX polish

### Phase 6: Advanced Features (Week 4+)
**Tasks:**
- [ ] Bulk upload/scheduling
- [ ] CSV import for content calendar
- [ ] AI-powered caption suggestions
- [ ] Optimal posting time recommendations
- [ ] Cross-platform scheduling (if integrating other platforms)

---

## 🔧 Technical Considerations

### 1. Time Zone Handling
```typescript
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Store all times in UTC, display in user's timezone
const scheduledTimeUTC = zonedTimeToUtc(userInputTime, userTimezone);
```

### 2. Media Validation
```typescript
const SNAPCHAT_MEDIA_SPECS = {
  image: {
    formats: ['jpg', 'jpeg', 'png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    minDimensions: { width: 1080, height: 1920 },
    aspectRatio: 9/16
  },
  video: {
    formats: ['mp4', 'mov'],
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 60, // seconds
    minDimensions: { width: 1080, height: 1920 }
  }
};
```

### 3. Retry Strategy
```typescript
const retryDelays = [1, 5, 15]; // minutes
async function retryWithBackoff(fn, maxRetries, delays) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < maxRetries - 1) {
        await sleep(delays[i] * 60 * 1000);
      } else {
        throw error;
      }
    }
  }
}
```

### 4. Webhook Notifications (Optional)
```typescript
// Notify user when post is published
await sendNotification(userId, {
  type: 'snapchat_post_published',
  postId: scheduledContent.id,
  publishedAt: new Date()
});
```

---

## 🔍 API Reference Quick Links

### Explore These Files for API Details:
1. **Mobile Kit APIs**: Check how Snapchat handles mobile integration
   ```
   C:\Users\420du\.context\SnapChat\Spectacles-Sample\Spectacles Mobile Kit\
   ```

2. **Snap Cloud Integration**: Review cloud-based content management
   ```
   C:\Users\420du\.context\SnapChat\Spectacles-Sample\Snap Cloud\README.md
   ```

3. **Existing Services**: Your current Snapchat integration patterns
   ```
   c:\Users\420du\DuckSnapAnalytics\server\services\snapchat.ts
   ```

---

## 📊 Success Metrics

Track these metrics to measure feature success:
- Number of scheduled posts created
- Publish success rate
- Average time saved per user
- User engagement with scheduled content
- Optimal posting time adoption rate

---

## 🚨 Important Notes

### Snapchat API Limitations
- **Test thoroughly** with Snapchat sandbox/test accounts first
- **Rate limits** vary by account type (personal vs business)
- **OAuth token expiry** - implement refresh token logic
- **Content guidelines** - ensure compliance with Snapchat ToS

### Security Considerations
- Encrypt stored access tokens
- Validate all user inputs
- Implement file upload size limits
- Scan uploaded media for malware
- Rate limit API endpoints to prevent abuse

---

## 🎬 Getting Started

1. **Review API Documentation**
   ```bash
   # Open and read the Snap Cloud README
   code "C:\Users\420du\.context\SnapChat\Spectacles-Sample\Snap Cloud\README.md"
   ```

2. **Test Current Snapchat Integration**
   ```bash
   # Ensure OAuth is working
   npm run dev
   # Navigate to /snapchat-prerequisites
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/snapchat-scheduled-upload
   ```

4. **Start with Database Schema**
   - Create migration for new tables
   - Test with seed data

5. **Build Backend First**
   - Implement services
   - Create API routes
   - Add cron job

6. **Then Frontend**
   - Build UI components
   - Connect to backend APIs
   - Polish UX

---

## 📚 Additional Resources

### Documentation to Reference:
- Snapchat Business API: https://businesshelp.snapchat.com/
- Snapchat Developer Docs: https://developers.snap.com/
- Your `.context` folder for offline API references

### Community & Support:
- Snapchat Developer Forum
- Stack Overflow (tag: snapchat-api)
- Your existing codebase patterns

---

**Ready to start? Run:**
```bash
# View this workflow
code c:\Users\420du\DuckSnapAnalytics\.agent\workflows\snapchat-scheduled-upload.md

# Begin implementation
# Start with Phase 1: Database Schema
```
