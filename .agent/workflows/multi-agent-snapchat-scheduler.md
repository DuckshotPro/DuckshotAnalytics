---
description: Multi-Agent Development Workflow for Snapchat Scheduler Feature
---

# Multi-Agent Development Workflow - Snapchat Scheduler

## 🎯 Project Overview
Build a scheduled content upload system for Snapchat creators with DuckShot Analytics branding.

**Brand Colors:**
- Primary: Purple gradient (#9a45ff → #b06aff)
- Accent: Pink gradient (#ff45d9 → #ff6ddd)  
- Background: Dark (#1a1625 → #0f0c16)

---

## 👥 Agent Roles & Responsibilities

### Agent 1: Database Architect
**Focus:** Schema design, migrations, seed data
**Tasks:** 1-5

### Agent 2: Backend API Engineer  
**Focus:** Services, routes, business logic
**Tasks:** 6-12

### Agent 3: File Storage Engineer
**Focus:** Media upload, processing, storage
**Tasks:** 13-17

### Agent 4: Cron/Scheduler Engineer
**Focus:** Publishing automation, retry logic
**Tasks:** 18-22

### Agent 5: Frontend UI Developer
**Focus:** React components, UI/UX
**Tasks:** 23-30

### Agent 6: Integration & Testing
**Focus:** E2E testing, bug fixes, polish
**Tasks:** 31-35

---

## 📋 Task Breakdown

### 🗄️ Phase 1: Database Foundation (Agent 1)

#### Task 1: Create Database Schema
```bash
# Create migration file
cd c:\Users\420du\DuckSnapAnalytics
npm run db:generate
```

**Files to create:**
- `server/db/schema/snapchat_scheduler.ts`

**Schema:**
```typescript
// snapchat_scheduled_content table
// snapchat_publish_log table
// See workflow guide for full schema
```

**Acceptance Criteria:**
- [ ] Tables created with proper types
- [ ] Foreign keys to users table
- [ ] Indexes on scheduledFor, status, userId
- [ ] Migrations run successfully

---

#### Task 2: Apply Database Migration
```bash
npm run db:migrate
npm run db:introspect
```

**Acceptance Criteria:**
- [ ] Migration applied to Neon database
- [ ] Types generated in drizzle
- [ ] No migration errors

---

#### Task 3: Create Seed Data for Testing
**File:** `server/db/seed/snapchat_scheduler_seed.ts`

**Seed data:**
- 5 sample scheduled posts (various statuses)
- 10 publish log entries
- Mix of images and videos

**Acceptance Criteria:**
- [ ] Seed script runs without errors
- [ ] Test data appears in database
- [ ] All status types represented

---

#### Task 4: Database Query Utilities
**File:** `server/db/queries/snapchat_scheduler.ts`

**Functions:**
- `getScheduledPostsByUser(userId)`
- `getDueP osts()`
- `getPostById(postId)`
- `updatePostStatus(postId, status)`

**Acceptance Criteria:**
- [ ] All queries typed with Drizzle
- [ ] Proper error handling
- [ ] Unit tests pass

---

#### Task 5: Database Indexes & Performance
**Optimize queries:**
```sql
CREATE INDEX idx_scheduled_content_user_scheduled 
ON snapchat_scheduled_content(user_id, scheduled_for);

CREATE INDEX idx_scheduled_content_status 
ON snapchat_scheduled_content(status, scheduled_for);
```

**Acceptance Criteria:**
- [ ] Indexes created
- [ ] Query performance tested
- [ ] < 100ms for user queries

---

### 🔌 Phase 2: Backend Services (Agent 2)

#### Task 6: Snapchat Scheduler Service
**File:** `server/services/snapchat-scheduler.ts`

**Methods:**
```typescript
class SnapchatSchedulerService {
  async schedulePost(userId, accountId, content, scheduledTime)
  async getScheduledPosts(userId, filters)
  async updateScheduledPost(postId, updates)
  async cancelScheduledPost(postId)
  async validateScheduleTime(time)
}
```

**Acceptance Criteria:**
- [ ] All CRUD operations working
- [ ] Validation for future dates only
- [ ] Error handling for invalid data
- [ ] TypeScript types complete

---

#### Task 7: Snapchat Publisher Service
**File:** `server/services/snapchat-publisher.ts`

**Methods:**
```typescript
class SnapchatPublisherService {
  async publishPost(scheduledContentId)
  async retryFailedPost(scheduledContentId)
  async validateMedia(file)
  async uploadToSnapchat(accountId, media, caption)
}
```

**Integration with:** `docs/SNAPCHAT_CONTENT_API_ENDPOINTS.md`

**Acceptance Criteria:**
- [ ] API integration working
- [ ] Media validation (format, size)
- [ ] Retry logic with exponential backoff
- [ ] Proper error logging

---

#### Task 8: API Routes - Schedule Endpoints
**File:** `server/routes/snapchat-scheduler.ts`

**Endpoints:**
```typescript
POST   /api/snapchat/schedule       // Create scheduled post
GET    /api/snapchat/scheduled      // List scheduled posts  
GET    /api/snapchat/scheduled/:id  // Get single post
PUT    /api/snapchat/scheduled/:id  // Update scheduled post
DELETE /api/snapchat/scheduled/:id  // Cancel scheduled post
```

**Acceptance Criteria:**
- [ ] All routes return proper status codes
- [ ] Request validation with Zod
- [ ] Auth middleware applied
- [ ] Rate limiting configured

---

#### Task 9: API Routes - Media Upload
**File:** `server/routes/snapchat-upload.ts`

**Endpoints:**
```typescript
POST /api/snapchat/upload           // Upload media file
GET  /api/snapchat/upload/:id/status // Check upload status
```

**Acceptance Criteria:**
- [ ] Multipart form-data handling
- [ ] File type validation
- [ ] Progress tracking
- [ ] Error responses

---

#### Task 10: Webhook Handler (Optional)
**File:** `server/routes/snapchat-webhook.ts`

**For Snapchat publish confirmations:**
```typescript
POST /api/webhooks/snapchat         // Receive publish events
```

**Acceptance Criteria:**
- [ ] Webhook signature verification
- [ ] Update post status on success/failure
- [ ] Log webhook events

---

#### Task 11: Analytics Integration
**File:** `server/services/snapchat-analytics.ts`

**Track:**
- Posts scheduled per user
- Publish success/failure rate
- Optimal posting times
- Queue size trends

**Acceptance Criteria:**
- [ ] Metrics stored in database
- [ ] Aggregation queries optimized
- [ ] Data visualization ready

---

#### Task 12: Error Handling & Logging
**Files:**
- `server/middleware/error-handler.ts`
- `server/utils/logger.ts`

**Log events:**
- Scheduled post created
- Publishing attempted
- Publishing succeeded/failed
- Retries triggered

**Acceptance Criteria:**
- [ ] Structured logging (JSON)
- [ ] Error categorization
- [ ] Log levels (debug, info, warn, error)
- [ ] Log rotation configured

---

### 📁 Phase 3: File Storage (Agent 3)

#### Task 13: Storage Configuration
**File:** `server/config/storage.ts`

**Options:**
- Local storage (dev)
- S3-compatible (production)

**Structure:**
```
uploads/snapchat/scheduled/
  ├── {userId}/
  │   ├── {postId}/
  │   │   ├── original.mp4
  │   │   └── thumbnail.jpg
```

**Acceptance Criteria:**
- [ ] Config switches between local/S3
- [ ] Directory auto-creation
- [ ] Permissions set correctly

---

#### Task 14: Media Upload Handler
**File:** `server/utils/media-uploader.ts`

**Functions:**
```typescript
async uploadMedia(file, userId, postId)
async deleteMedia(userId, postId)
async getMediaUrl(userId, postId, filename)
```

**Acceptance Criteria:**
- [ ] Handles multipart uploads
- [ ] Generates unique filenames
- [ ] Returns accessible URLs
- [ ] Cleanup on errors

---

#### Task 15: Media Validation
**File:** `server/utils/media-validator.ts`

**Validate:**
- File size (max 100MB video, 5MB image)
- Format (MP4, JPEG, PNG)
- Dimensions (1080x1920 recommended)
- Duration (3-60 sec video)

**Acceptance Criteria:**
- [ ] All specs from docs enforced
- [ ] Clear error messages
- [ ] MIME type checking
- [ ] Magic byte verification

---

#### Task 16: Thumbnail Generation
**File:** `server/utils/thumbnail-generator.ts`

**Use:** `ffmpeg` for video thumbnails

**Generate:**
- Thumbnail at 1-second mark
- Size: 320x568 (scaled 9:16)
- Format: JPEG, quality 80

**Acceptance Criteria:**
- [ ] Works for videos
- [ ] Falls back for images
- [ ] Stored alongside original
- [ ] < 2 second generation time

---

#### Task 17: Media Cleanup Service
**File:** `server/services/media-cleanup.ts`

**Cleanup:**
- Cancelled posts (after 24 hours)
- Published posts (after 30 days, optional)
- Failed uploads (after 7 days)

**Acceptance Criteria:**
- [ ] Cron job runs daily
- [ ] Logs deletions
- [ ] Preserves published media
- [ ] Configurable retention periods

---

### ⏰ Phase 4: Scheduling & Publishing (Agent 4)

#### Task 18: Cron Job Setup
**File:** `server/jobs/snapchat-publisher-job.ts`

**Schedule:** Every minute

**Logic:**
```typescript
// Find posts due in next 2 minutes
// Attempt to publish each
// Update status based on result
```

**Acceptance Criteria:**
- [ ] Runs every 60 seconds
- [ ] Error handling per post
- [ ] Doesn't block on failures
- [ ] Logs all attempts

---

#### Task 19: Publishing Queue Manager
**File:** `server/services/queue-manager.ts`

**Features:**
- Priority queue (overdue first)
- Rate limiting (max 10/minute)
- Concurrent publishing (max 3)
- Dead letter queue for failures

**Acceptance Criteria:**
- [ ] Respects API rate limits
- [ ] Processes in order
- [ ] Handles concurrency safely
- [ ] Retries with backoff

---

#### Task 20: Retry Logic
**File:** `server/services/retry-handler.ts`

**Strategy:**
```
Attempt 1: Immediate
Attempt 2: +1 minute
Attempt 3: +5 minutes
Attempt 4: +15 minutes (final)
```

**Acceptance Criteria:**
- [ ] Max 4 retry attempts
- [ ] Exponential backoff delays
- [ ] Different errors handled
- [ ] Final failure notification

---

#### Task 21: Notification System
**File:** `server/services/notification.ts`

**Notify user on:**
- Post published successfully
- Post failed to publish (max retries)
- Media processing complete

**Methods:**
- Email
- In-app notification
- Webhook (optional)

**Acceptance Criteria:**
- [ ] Notifications sent async
- [ ] Email templates created
- [ ] Unsubscribe option
- [ ] Delivery logs

---

#### Task 22: Health Monitoring
**File:** `server/routes/health.ts`

**Endpoint:**
```typescript
GET /api/health/scheduler
```

**Check:**
- Database connection
- Snapchat API availability
- Queue size
- Failed job count

**Acceptance Criteria:**
- [ ] Returns 200 if healthy
- [ ] Returns 503 if unhealthy
- [ ] Includes diagnostic info
- [ ] < 500ms response time

---

### 🎨 Phase 5: Frontend UI (Agent 5)

#### Task 23: Scheduler Page Layout
**File:** `client/src/pages/snapchat-scheduler.tsx`

**Layout:**
- Header with navigation
- Left sidebar (calendar, stats)
- Main area (upload + queue)
- Right panel (post editor)

**Acceptance Criteria:**
- [ ] Responsive design (mobile/desktop)
- [ ] DuckShot brand colors applied
- [ ] Smooth transitions
- [ ] Accessibility compliant

---

#### Task 24: Media Upload Component
**File:** `client/src/components/scheduler/MediaUploader.tsx`

**Features:**
- Drag-and-drop zone
- File browser fallback
- Progress bar
- Preview on upload
- Format validation

**Acceptance Criteria:**
- [ ] Accepts video/image
- [ ] Shows upload progress
- [ ] Displays errors clearly
- [ ] Cancellable uploads

---

#### Task 25: Calendar Component
**File:** `client/src/components/scheduler/ScheduleCalendar.tsx`

**Features:**
- Monthly view
- Scheduled posts shown as thumbnails
- Click date to schedule
- Color-coded by status

**Acceptance Criteria:**
- [ ] Uses DuckShot colors
- [ ] Smooth navigation
- [ ] Tooltips show post info
- [ ] Mobile-friendly

---

#### Task 26: Content Queue Component
**File:** `client/src/components/scheduler/ContentQueue.tsx`

**Display:**
- Horizontal scroll
- Post cards with thumbnail
- Time, caption preview
- Edit/Delete buttons

**Acceptance Criteria:**
- [ ] Sorted by schedule time
- [ ] Quick actions work
- [ ] Skeleton loading states
- [ ] Empty state design

---

#### Task 27: Post Editor Component
**File:** `client/src/components/scheduler/PostEditor.tsx`

**Fields:**
- Caption (textarea, max 250 chars)
- Schedule date/time picker
- Recurring schedule toggle
- Hashtag suggestions

**Acceptance Criteria:**
- [ ] Real-time character count
- [ ] Timezone selector
- [ ] Validate future time only
- [ ] Auto-save draft

---

#### Task 28: Post Preview Modal
**File:** `client/src/components/scheduler/PostPreview.tsx`

**Show:**
- Full media preview
- Caption with hashtags
- Scheduled time
- Preview as Snapchat story

**Acceptance Criteria:**
- [ ] Video playback works
- [ ] 9:16 aspect ratio preview
- [ ] Edit/Schedule buttons
- [ ] Close on ESC key

---

#### Task 29: Recurring Schedule UI
**File:** `client/src/components/scheduler/RecurringSchedule.tsx`

**Options:**
- Daily (same time)
- Weekly (select days)
- Custom interval
- End date

**Acceptance Criteria:**
- [ ] Clear visual design
- [ ] Validation for patterns
- [ ] Preview next 5 occurrences
- [ ] Save/cancel actions

---

#### Task 30: Analytics Dashboard Widget
**File:** `client/src/components/scheduler/SchedulerStats.tsx`

**Display:**
- Total scheduled
- Published today/week
- Success rate
- Next scheduled post

**Acceptance Criteria:**
- [ ] Real-time updates
- [ ] Chart/graph visualizations
- [ ] Click to filter queue
- [ ] Mobile responsive

---

### 🧪 Phase 6: Integration & Testing (Agent 6)

#### Task 31: E2E Test Suite
**File:** `tests/e2e/snapchat-scheduler.spec.ts`

**Test scenarios:**
1. Upload media → Schedule post → Verify in queue
2. Edit scheduled post → Verify changes saved
3. Cancel scheduled post → Verify removed
4. Publish post (mocked) → Verify status updated

**Acceptance Criteria:**
- [ ] All scenarios pass
- [ ] Tests run in CI/CD
- [ ] < 5 minute test run
- [ ] 80%+ code coverage

---

#### Task 32: API Integration Testing
**File:** `tests/integration/api.test.ts`

**Test:**
- All API endpoints
- Error responses
- Auth requirements
- Rate limiting
- Media validation

**Acceptance Criteria:**
- [ ] 100% endpoint coverage
- [ ] Both success and error paths
- [ ] Database rollback after tests
- [ ] Parallel test execution safe

---

#### Task 33: Performance Testing
**File:** `tests/performance/load.test.ts`

**Load test:**
- 100 concurrent users
- 1000 scheduled posts
- Publishing 50 posts/minute

**Metrics:**
- API response time < 200ms (p95)
- Queue processing < 1s per post
- No memory leaks
- Database query time < 100ms

**Acceptance Criteria:**
- [ ] Meets performance targets
- [ ] Graceful degradation
- [ ] Error rate < 0.1%
- [ ] Load test report generated

---

#### Task 34: UI/UX Polish
**Tasks:**
- Loading states (skeletons)
- Error toast notifications
- Success animations
- Hover effects
- Keyboard shortcuts

**Acceptance Criteria:**
- [ ] No layout shifts
- [ ] Smooth animations (60fps)
- [ ] Accessible (WCAG AA)
- [ ] Cross-browser tested

---

#### Task 35: Documentation & Deployment
**Files:**
- `docs/SNAPCHAT_SCHEDULER_USER_GUIDE.md`
- `docs/SNAPCHAT_SCHEDULER_ADMIN.md`

**Deploy:**
- Update Podman compose
- Environment variables
- Database migration
- Cron job setup

**Acceptance Criteria:**
- [ ] User guide complete
- [ ] Admin docs complete
- [ ] Deployment runbook
- [ ] Rollback plan

---

## 🚀 Execution Order

### Week 1: Foundation
- Day 1-2: Tasks 1-5 (Database)
- Day 3-4: Tasks 6-9 (Core Backend)
- Day 5: Tasks 13-15 (File Upload)

### Week 2: Publishing
- Day 6-7: Tasks 18-22 (Cron & Publishing)
- Day 8-9: Tasks 10-12 (Webhooks & Analytics)
- Day 10: Tasks 16-17 (Media Processing)

### Week 3: Frontend
- Day 11-12: Tasks 23-26 (Main UI)
- Day 13-14: Tasks 27-30 (Editor & Widgets)
- Day 15: Polish & refinement

### Week 4: Testing & Deploy
- Day 16-17: Tasks 31-33 (Testing)
- Day 18-19: Task 34 (Polish)
- Day 20: Task 35 (Deploy)

---

## 🎯 Success Metrics

**Feature Complete When:**
- [ ] User can upload and schedule Snapchat content
- [ ] Posts publish automatically at scheduled time
- [ ] 95%+ publish success rate
- [ ] < 200ms API response time
- [ ] Mobile-responsive UI
- [ ] E2E tests pass
- [ ] Deployed to production

---

## 📞 Communication Protocol

**Daily Standups:**
- What you completed
- What you're working on
- Any blockers

**HandofFs:**
- Agent 1 → Agent 2: Database schema ready
- Agent 2 → Agent 3: API routes defined
- Agent 3 → Agent 4: Storage endpoints ready
- Agent 4 → Agent 5: Backend complete
- Agent 5 → Agent 6: UI ready for testing

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)

**Frontend:**
- React + TypeScript
- TailwindCSS (DuckShot theme)
- Radix UI components
- Tanstack Query

**Infrastructure:**
- Podman containers
- Cron jobs
- S3-compatible storage

---

**Ready to start? Pick an agent role and begin! 🚀**
