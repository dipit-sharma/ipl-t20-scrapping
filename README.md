# IPL T20 Live Dashboard 🏏

A comprehensive, real-time IPL T20 cricket dashboard built with Next.js, TypeScript, and Tailwind CSS. The application provides live match updates, points table, match schedules, and detailed statistical analysis with beautiful data visualizations.

![IPL Dashboard Demo](https://via.placeholder.com/800x400/0066cc/ffffff?text=IPL+T20+Dashboard)

## ✨ Features

### Core Functionality
- **🔴 Live Match Display**: Real-time match information with scores, overs, and match status
- **🏆 Points Table**: Complete IPL standings with qualification indicators and team statistics  
- **📅 Match Schedule**: Comprehensive fixture list with filtering options (upcoming, recent, today)
- **📊 Statistical Analysis**: Interactive charts and performance metrics using Recharts

### Advanced Features
- **⚡ Real-time Updates**: Auto-refresh every minute with manual refresh option
- **🔔 Live Notifications**: Toast notifications for match events (wickets, boundaries, milestones)
- **💾 Smart Caching**: 5-minute cache mechanism to minimize API calls
- **🌓 Dark Mode**: Toggle between light and dark themes
- **📱 Mobile-First Design**: Fully responsive across all devices
- **🌐 Offline Support**: Connection status monitoring and offline handling
- **♿ Accessibility**: Screen reader friendly with proper ARIA labels

### Data Visualization
- **Bar Charts**: Team points and wins comparison
- **Pie Charts**: Win percentage distribution  
- **Line Charts**: Team performance trends and NRR analysis
- **Player Statistics**: Top scorers and their performance metrics

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Server-Side Rendering**: Fast initial page loads with Next.js
- **API Routes**: Custom endpoints for data scraping and management
- **Component Architecture**: Modular, reusable React components
- **Performance Optimized**: Lazy loading and efficient re-rendering

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization  
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Data Fetching**: Axios with custom caching
- **Notifications**: Custom toast system
- **State Management**: React Hooks (useState, useEffect)

## 📋 Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn package manager
- Modern web browser with JavaScript enabled

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ipl-t20-dashboard.git
   cd ipl-t20-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ipl-t20-dashboard)

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### Manual Deployment
```bash
npm run build
npm start
```

## 📱 Usage Guide

### Navigation
- **Live Match**: View current live match or upcoming match details
- **Points Table**: Browse IPL team standings with qualification status
- **Schedule**: Filter matches by status (all, upcoming, recent, today)
- **Statistics**: Interactive charts for team and player analysis

### Features
- **Auto-refresh**: Toggle automatic data updates (every 60 seconds)
- **Dark Mode**: Switch between light and dark themes
- **Notifications**: Get real-time match event notifications
- **Mobile**: Swipe through tabs on mobile devices

### Data Refresh
- Automatic refresh every minute (when enabled)
- Manual refresh button in the header
- Smart caching prevents excessive API calls
- Offline detection and error handling

## 🏗️ Project Structure

```
ipl-t20-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── scrape/
│   │   │       └── route.ts          # Data scraping API endpoint
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main dashboard page
│   ├── components/
│   │   ├── LiveMatchCard.tsx         # Live match display
│   │   ├── PointsTable.tsx           # Points table component
│   │   ├── MatchSchedule.tsx         # Match schedule with filters
│   │   ├── StatsChart.tsx            # Interactive charts
│   │   └── NotificationToast.tsx     # Notification system
│   └── types/
│       └── ipl.ts                    # TypeScript interfaces
├── public/                           # Static assets
├── package.json                      # Dependencies and scripts
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project documentation
```

## 🔧 API Endpoints

### GET /api/scrape
Fetches latest IPL data including live matches, points table, and schedules.

**Response:**
```json
{
  "success": true,
  "data": {
    "liveMatch": { /* Match object */ },
    "upcomingMatches": [ /* Array of matches */ ],
    "pointsTable": [ /* Array of team standings */ ],
    "recentMatches": [ /* Array of recent matches */ ],
    "lastUpdated": "2024-05-25T10:30:00.000Z"
  },
  "cached": false
}
```

### POST /api/scrape
Clears the data cache and forces fresh data fetch.

## 🎨 Customization

### Themes
Modify `tailwind.config.js` to customize colors and themes:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color'
      }
    }
  }
}
```

### Data Sources
Update the scraping logic in `src/app/api/scrape/route.ts` to use different data sources or APIs.

### Components
All components are modular and can be easily customized or extended. Each component has its own props interface for type safety.

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Build the project
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js version is 18.18.0 or higher
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

2. **Data Not Loading**
   - Check network connection
   - Verify API endpoints are accessible
   - Check browser console for errors

3. **Charts Not Displaying**
   - Ensure Recharts is properly installed
   - Check for console errors related to SVG rendering

4. **Mobile Responsiveness Issues**
   - Clear browser cache
   - Test on different devices and screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IPL**: For the amazing cricket league and inspiration
- **Next.js Team**: For the incredible React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Recharts**: For beautiful and responsive charts
- **Lucide**: For the comprehensive icon library

## 📞 Support

For support, email support@yourcompany.com or create an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Historical season data and comparisons
- [ ] Player detailed statistics and profiles
- [ ] Match predictions using ML algorithms
- [ ] Social media integration
- [ ] Multiple language support
- [ ] Fantasy cricket integration
- [ ] Push notifications for mobile
- [ ] Video highlights integration
- [ ] Live audio commentary
- [ ] Betting odds integration (where legal)

---

<div align="center">
  <h3>Built with ❤️ for Cricket Fans</h3>
  <p>
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
    </a>
    <a href="https://www.typescriptlang.org">
      <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    </a>
  </p>
</div>
#   i p l - t 2 0 - s c r a p p i n g  
 