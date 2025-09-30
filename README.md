# DuckShot Analytics

A powerful Snapchat analytics dashboard that transforms complex social media data into intuitive, engaging insights through advanced AI-powered analysis and user-friendly interfaces.

![DuckShot Analytics](./public/assets/logo.png)

## 🚀 Features

## Agent-Based System

DuckSnapAnalytics now uses a sophisticated agent-based system to handle data fetching, analysis, and processing. This system is built on the Google Agent Development Kit (ADK) and provides a more robust, scalable, and maintainable architecture.

The agent-based system consists of the following agents:

*   **`OrchestratorAgent`**: Manages the entire data fetching and processing workflow.
*   **`SnapchatDataFetcherAgent`**: Fetches data from the Snapchat API.
*   **`DataAnalysisAgent`**: Analyzes Snapchat data and generates insights.
*   **`TestAgent`**: Validates the data and insights.
*   **`DatabaseAgent`**: Stores the data and insights in the database.
*   **`SafetyAgent`**: Screens the data and insights for PII and inappropriate content.
*   **`EvaluationAgent`**: Evaluates the quality of the generated insights.

This new architecture allows for better separation of concerns, improved error handling, and enhanced scalability.

DuckShots SnapAlytics offers a range of features to help Snapchat creators and marketers optimize their content strategy:

### Free Tier
- Basic analytics dashboard with fundamental metrics
- 30-day data retention
- Daily data refresh rate
- Basic audience demographics
- Limited content analytics (10 most recent items)
- Ad-supported experience
- Standard support with 72-hour response time

### Premium Tier
- Comprehensive analytics dashboard with advanced metrics
- 90-day data retention
- Near real-time data refresh (every 15 minutes)
- Advanced audience segmentation
- Full content history and analytics
- Exportable reports in multiple formats (PDF, CSV, Excel, PowerPoint)
- Custom date ranges
- AI-powered insights and recommendations
- Competitor analysis
- Growth prediction algorithms
- Priority support with 24-hour response time
- Monthly strategy consultation
- Ad-free experience
- Advanced security features

## 📋 Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with PostgreSQL session store
- **AI Integration**: Google Gemini for premium insights, Google Agent Development Kit (ADK)
- **State Management**: React Context API, TanStack Query
- **Routing**: Wouter

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- Snapchat API credentials (for production use)
- Stripe API keys (for subscription handling)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/duckshots-snapalytics.git
   cd duckshots-snapalytics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables (see `.env.example`):
   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/duckshots
   
   # Session
   SESSION_SECRET=your_session_secret
   
   # Stripe (for subscription management)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
   
   # OAuth (Snapchat)
   SNAPCHAT_CLIENT_ID=your_snapchat_client_id
   SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret
   # Base URL used to build the OAuth callback. Must match your deployed URL exactly.
   APP_URL=http://localhost:5000
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to http://localhost:5000

### Snapchat OAuth Setup

1. Register your app in the Snapchat Developer Portal (`https://kit.snapchat.com/portal/`).
2. Add the OAuth redirect URL: `${APP_URL}/api/auth/snapchat/callback`.
3. Set `SNAPCHAT_CLIENT_ID`, `SNAPCHAT_CLIENT_SECRET`, and `APP_URL` in your `.env`.
4. In development, start the server with `npm run dev` and test OAuth via the Connect page or `GET /api/auth/snapchat`.

If OAuth env vars are missing, the app will skip registering the Snapchat OAuth routes and log a warning. You can still test using the manual credentials form on `/connect-account` which stores credentials and loads mock data.

## 🧩 Project Structure

```
duckshots-snapalytics/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Root component
│   └── index.html        # HTML entry point
├── scripts/              # Helper scripts
│   ├── backup-database.sh  # Database backup script
│   └── restore-database.sh # Database restore script
├── server/               # Backend code
│   ├── services/         # Service integrations
│   │   └── gemini.ts     # Google Gemini AI service
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema and types
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🚀 Deployment

### Production Setup

1. Build the production assets:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Database Management

#### Backup

A database backup script is provided in `scripts/backup-database.sh`. Run it to create a backup:

```bash
bash scripts/backup-database.sh
```

Backups are stored in the `backups/` directory with a timestamp.

#### Restore

To restore from a backup:

```bash
bash scripts/restore-database.sh backups/your-backup-file.sql
```

## 🔒 Security Considerations

- All user passwords are hashed using scrypt with salt
- Sessions are stored in PostgreSQL for persistence
- HTTPS is recommended for production deployment
- API keys are stored securely and not exposed to the client
- Premium users have access to enhanced security features like two-factor authentication

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify your PostgreSQL service is running
- Check that your DATABASE_URL is correct in your .env file
- Ensure your database user has appropriate permissions

#### Authentication Issues
- Clear your browser cookies and try logging in again
- Check the server logs for session-related errors
- Verify the SESSION_SECRET is set correctly

#### Snapchat API Connection Problems
- Confirm your Snapchat API credentials are correct
- Check for API rate limiting issues
- Verify your account has the necessary permissions

### Debugging

- Enable debug logs by setting `DEBUG=duckshots:*` in your environment
- Check browser console for frontend errors
- Review server logs for backend issues

## 📈 Roadmap

- Mobile application
- Advanced content scheduling
- Influencer collaboration tools
- White-labeling for agencies
- Enhanced AI recommendations
- Social media integration beyond Snapchat

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

For support or questions, please contact support@duckshotssnapalytics.com