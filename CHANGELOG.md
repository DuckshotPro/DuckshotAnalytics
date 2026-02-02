# Changelog

## [Unreleased]

### Changed
- Migrated CI/CD workflow to `pnpm`.
- Updated core dependencies to latest versions:
  - `typescript` -> `5.6.3`
  - `vite` -> `7.3.1`
  - `react` -> `19.2.4`
  - `@paypal/paypal-server-sdk` -> `2.2.0`
  - `drizzle-orm` -> `0.45.1`
- Refactored `job-scheduler.ts` to use explicit Redis URL.
- Refactored `competitor-analysis.ts` to include `analyzeCompetitors`.
- Updated `server/types.d.ts` to match new `SnapchatData` structure.
- Removed `allowedHosts` from Vite config.
- Cleaned up duplicate dependencies.

### Fixed
- Fixed TypeScript errors in `resend` by updating TypeScript version.
- Fixed various type errors in server services (`paypal.ts`, `export.ts`, `storage.ts`).
- Removed misplaced `server/routes/paypal-webhook.ts`.

## [1.0.0] - 2025-01-20
- Initial release.
