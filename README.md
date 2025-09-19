# CreaShort Dashboard

A comprehensive dashboard application for monitoring AI agent video generation systems. This dashboard provides real-time insights into video generation schedules, processing status, and analytics.

## Features

### 📊 Dashboard Overview
- Real-time statistics and metrics
- System status monitoring
- Quick action buttons
- Auto-refresh capabilities

### 👥 Agent Management
- View all AI agents and their status
- Filter agents by status (active, behind schedule, processing)
- Search functionality
- Pagination support
- Detailed agent information

### 📅 Schedule Tracking
- Monitor upcoming video generations
- Track overdue videos
- Expandable schedule items with detailed information
- Filter by time periods (3, 7, 14, 30 days)

### ⚡ Processing Queue
- Real-time processing status
- Processing duration tracking
- Progress indicators
- Auto-refresh for live updates
- Processing tips and guidance

### 📈 Analytics
- Daily video generation trends
- Status distribution charts
- Agent performance metrics
- Frequency distribution analysis
- Exportable data

### ⚙️ Settings
- Configurable refresh intervals
- Notification preferences
- System configuration
- Database connection status

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with Headless UI

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creashort-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/creashort
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/creashort
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application expects a MongoDB collection called `useragents` with the following schema:

```javascript
{
  userId: String,
  agentId: String,
  agentName: String,
  agentRole: String,
  promptTemplate: String,
  originalPromptTemplate: String,
  customInstructions: String,
  voiceId: String,
  fontStyle: String,
  textColor: String,
  selectedSocialMediaAccount: String,
  language: String,
  frequency: {
    plan: String, // 'basic', 'standard', 'premium'
    intervalDays: Number,
    monthlyVideos: Number,
    credits: Number
  },
  schedule: {
    startDate: Date,
    nextGenerationDate: Date,
    active: Boolean,
    pausedUntil: Date,
    generationHistory: [{
      date: Date,
      generationId: ObjectId,
      scriptId: String,
      videoId: String,
      videoUrl: String,
      status: String, // 'pending', 'processing', 'published', 'failed'
      error: String
    }],
    upcomingDates: [Date],
    scheduledScripts: [{
      date: Date,
      script: String,
      used: Boolean,
      generationId: ObjectId,
      videoUrl: String,
      status: String,
      error: String
    }]
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Dashboard Overview
- `GET /api/dashboard/overview` - Get overview statistics

### Agents
- `GET /api/dashboard/agents` - Get agents with filtering and pagination
  - Query params: `status`, `page`, `limit`, `search`

### Schedule
- `GET /api/dashboard/schedule` - Get schedule information
  - Query params: `type` (all/upcoming/overdue), `days`

### Analytics
- `GET /api/dashboard/analytics` - Get analytics data
  - Query params: `period` (week/month/year), `agentId`

## Configuration

### Auto-refresh Settings
The dashboard supports configurable auto-refresh intervals:
- 10 seconds (high frequency)
- 30 seconds (default)
- 1 minute
- 5 minutes

### Notification Settings
- Browser notifications for important events
- Email alerts for critical issues
- Webhook integration for external services

### System Settings
- Maximum retry attempts for failed generations
- Timeout settings for video processing
- Database connection monitoring

## Development

### Project Structure
```
├── app/
│   ├── api/dashboard/     # API routes
│   ├── agents/           # Agents page
│   ├── analytics/        # Analytics page
│   ├── processing/       # Processing queue page
│   ├── schedule/         # Schedule page
│   ├── settings/         # Settings page
│   └── page.js           # Dashboard overview
├── components/           # Reusable components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── models/              # Database models
└── public/              # Static assets
```

### Adding New Features

1. **New API Endpoint**: Add to `app/api/dashboard/`
2. **New Page**: Create in `app/` directory
3. **New Component**: Add to `components/`
4. **New Hook**: Add to `hooks/`

### Real-time Updates

The dashboard uses polling for real-time updates. To implement WebSocket support:

1. Add WebSocket server configuration
2. Update `useRealTimeData` hook to use WebSockets
3. Configure WebSocket endpoints in settings

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure environment variables
4. Set up MongoDB connection

## Monitoring

The dashboard includes built-in monitoring for:
- Database connection status
- API server health
- Video generation service status
- Scheduler service status

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MongoDB connection string
   - Ensure MongoDB is running
   - Verify network connectivity

2. **API Errors**
   - Check console for error messages
   - Verify API endpoint URLs
   - Check network connectivity

3. **Real-time Updates Not Working**
   - Check auto-refresh settings
   - Verify browser allows notifications
   - Check network connectivity

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

Built with ❤️ for AI video generation monitoring