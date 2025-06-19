export interface Match {
  id: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  venue: string;
  status: string;
  result?: string;
  isLive?: boolean;
  score1?: string;
  score2?: string;
  overs1?: string;
  overs2?: string;
}

export interface PointsTableTeam {
  position: number;
  team: string;
  matches: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: string;
  qualification?: 'qualified' | 'eliminated' | 'possible';
}

export interface IPLData {
  liveMatch?: Match;
  upcomingMatches: Match[];
  pointsTable: PointsTableTeam[];
  recentMatches: Match[];
  lastUpdated: string;
}

export interface HistoricalData {
  season: string;
  winner: string;
  runnerUp: string;
  totalMatches: number;
  topScorer: string;
  topWicketTaker: string;
}

export interface PlayerStats {
  name: string;
  team: string;
  runs?: number;
  wickets?: number;
  average?: number;
  strikeRate?: number;
  economy?: number;
}

export interface TeamPerformance {
  team: string;
  matches: number;
  wins: number;
  losses: number;
  winPercentage: number;
  averageScore: number;
  totalRuns: number;
  totalWickets: number;
}

export interface NotificationData {
  id: string;
  type: 'wicket' | 'boundary' | 'milestone' | 'match_start' | 'match_end';
  message: string;
  timestamp: string;
  match?: Match;
}

export type TabType = 'live' | 'points' | 'schedule' | 'stats'; 