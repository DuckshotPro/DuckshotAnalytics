# Plan: Fix Snapchat Scheduler Analytics and Integration

## Phase 1: Fix Component Lint Errors & Missing Imports
1. **Fix `SchedulerAnalytics.tsx`**:
    - Add missing `cn` import from `@/lib/utils`.
    - Fix TypeScript errors by defining a proper `SchedulerStats` interface in the hook and using it.
    - Update the component to gracefully handle missing or differently named properties from the backend.

2. **Fix `ScheduleForm.tsx`**:
    - Ensure `motion` and `cn` are imported (already did some but check again if anything missed).
    - Renaming `type` to `contentType` was correct, ensure all uses are updated.

## Phase 2: Update Hooks & Types
1. **Update `useSnapchatScheduler` hook**:
    - Define a robust `SchedulerStats` interface.
    - Ensure the `stats` query is typed.
    - Handle the nested structure `{ success: true, stats: { ... } }` if necessary.

## Phase 3: Enhance Backend Stats
1. **Update `server/db/queries/snapchat-scheduler.ts`**:
    - Modify `getPostingStats` to return more detailed metrics:
        - `successCount` (Total published)
        - `failCount` (Total failed)
        - `pendingCount` (Total scheduled)
        - `queueCount` (Scheduled for next 48 hours)
        - `errorCount` (Total failed)
        - `successRate` (Already exists)

## Phase 4: Verification
1. Verify that all lint errors are gone.
2. Verify that the Snapchat Scheduler page loads and displays (dummy) data correctly if backend is not fully integrated yet, but stats should work if there's data in the database.
