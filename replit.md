# DuckShot Analytics

## Overview

DuckShot Analytics is a Snapchat analytics dashboard that transforms social media data into actionable insights through AI-powered analysis. The application offers both free and premium tiers, providing creators and businesses with comprehensive analytics, audience intelligence, and performance optimization tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety
- **UI Library**: Tailwind CSS with shadcn/ui components for consistent design
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for analytics data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with session-based authentication
- **Session Storage**: PostgreSQL session store for scalability
- **API Design**: RESTful endpoints with comprehensive error handling

### ETL Pipeline & Batch Processing (NEW)
- **Job Scheduler**: Node-cron for time-based task scheduling
- **Queue System**: Bull queues with Redis (falls back to in-memory for development)
- **Data Sync**: Automated Snapchat API data fetching (15min premium, 24hr free)
- **Report Generation**: Weekly automated report creation for premium users
- **Data Cleanup**: Automated retention policy enforcement (30/90 days)
- **Job Monitoring**: Complete job execution logging with error tracking
- **Graceful Shutdown**: Proper cleanup on server termination

### Data Storage Solutions
- **Primary Database**: PostgreSQL for all persistent data
- **Schema Management**: Drizzle ORM with TypeScript schema definitions
- **Session Storage**: Connect-pg-simple for PostgreSQL session management
- **Data Encryption**: AES-256 encryption for sensitive data at rest

## Key Components

### Authentication System
- **Strategy**: Username/password authentication with Passport.js
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Password Security**: Scrypt-based password hashing with salt
- **OAuth Integration**: Snapchat OAuth 2.0 flow for API access

### Snapchat Integration
- **API Access**: Official Snapchat Marketing API integration
- **Data Collection**: Follower metrics, engagement rates, story analytics, demographics
- **Real-time Updates**: Configurable refresh rates (daily for free, 15min for premium)
- **Credential Management**: Secure storage of API keys and client IDs

### Analytics Engine
- **Data Processing**: Server-side analytics calculation and caching
- **AI Insights**: Google Gemini integration for content recommendations
- **Audience Segmentation**: Advanced demographic and behavioral analysis
- **Competitor Analysis**: Benchmarking against similar creators

### Privacy & Compliance
- **GDPR Compliance**: Full data subject rights implementation
- **Consent Management**: Granular privacy controls with audit logging
- **Data Retention**: Configurable retention periods (30-90 days)
- **Export Functionality**: Complete data portability in multiple formats

## Data Flow

### Real-time Flow (User-Initiated)
1. **User Authentication**: User logs in → Session created → Stored in PostgreSQL
2. **Snapchat Connection**: User provides API credentials → OAuth flow → Credentials encrypted and stored
3. **Dashboard Display**: User requests → Cached data retrieved → Charts and metrics rendered
4. **Manual Report Generation**: User exports → Data compiled → Multiple formats generated

### ETL Pipeline Flow (Automated Background Processing)
1. **Scheduled Data Sync**: 
   - Premium users: Every 15 minutes → Snapchat API calls → Fresh data cached
   - Free users: Every 24 hours → Snapchat API calls → Daily data updates
2. **Background Analytics**: Raw data → AI processing → Insights generated → Stored in database
3. **Automated Reports**: Weekly schedule → Premium users → Email reports generated
4. **Data Cleanup**: Daily retention jobs → Old data removed → Storage optimized
5. **Job Monitoring**: All background tasks → Execution logged → Error tracking enabled
6. **Queue Management**: Failed jobs → Automatic retry → Manual intervention alerts

## External Dependencies

### Third-Party APIs
- **Snapchat Marketing API**: Core analytics data source
- **Google Gemini AI**: Content insights and recommendations generation
- **Stripe**: Payment processing for premium subscriptions (planned)

### Infrastructure Services
- **Neon Database**: PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time data updates capability
- **File Storage**: Local storage for exported reports and user uploads

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **TypeScript**: Type safety across frontend and backend
- **Zod**: Runtime schema validation for API endpoints

## Deployment Strategy

### Development Environment
- **Local Development**: Node.js with hot reload via Vite
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Environment Variables**: Configuration for API keys, database connections

### Production Considerations
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Database Migrations**: Drizzle migrations for schema updates
- **Security**: HTTPS enforcement, secure session cookies, CSRF protection
- **Performance**: Connection pooling, query optimization, caching strategies

### Scalability Architecture
- **Session Storage**: PostgreSQL-based sessions for horizontal scaling
- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: Application-level caching for frequently accessed data
- **API Rate Limiting**: Built-in rate limiting for API abuse prevention

## Recent Changes (July 28, 2025)

### Major Architecture Enhancement: Comprehensive ETL Pipeline Implementation

**What Was Added:**
✓ Complete job scheduling system with node-cron
✓ Queue management with Bull queues (Redis) and development fallback
✓ Automated data sync (15min premium, 24hr free)
✓ Weekly automated report generation for premium users
✓ Data retention cleanup (30 days free, 90 days premium)
✓ Job execution logging with error tracking
✓ Graceful shutdown handling for background processes

**Database Schema Updates:**
✓ Added job_execution_logs table for monitoring
✓ Enhanced storage interface with batch processing methods
✓ Type-safe job tracking with Drizzle ORM integration

**Services Created:**
✓ job-scheduler.ts - Main ETL pipeline controller
✓ automated-reports.ts - Weekly report generation
✓ development-queue.ts - In-memory queue fallback
✓ Enhanced audience-segmentation.ts with recommendations

**Key Features:**
✓ Background data processing when server is non-booted
✓ Automatic retry of failed jobs
✓ Complete monitoring and logging system
✓ Production-ready scalability with Redis queues
✓ Development environment compatibility

**Production Readiness Features (July 28, 2025):**
✓ Production health monitoring system with /api/health endpoints
✓ Comprehensive error alerting and notification system
✓ Redis integration for production-grade queue management
✓ System metrics and performance monitoring
✓ Automated health checks for all services
✓ Production alert testing and validation
✓ Enhanced roadmap with future enhancement options

The application now features a sophisticated ETL pipeline alongside the existing real-time architecture, transforming it from a simple analytics dashboard into a comprehensive data processing platform suitable for both development and production deployment while maintaining security and privacy compliance standards. The system is now production-ready for Snapchat application review with enterprise-level monitoring and alerting capabilities.