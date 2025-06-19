'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { PointsTableTeam, TeamPerformance, PlayerStats } from '@/types/ipl';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';

interface StatsChartProps {
  pointsTable: PointsTableTeam[];
}

type ChartType = 'points' | 'performance' | 'players' | 'trends';

const StatsChart: React.FC<StatsChartProps> = ({ pointsTable }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('points');

  // Sample data - in real app, this would come from API
  const teamPerformanceData: TeamPerformance[] = pointsTable.map(team => ({
    team: team.team.replace(/\s+/g, '\n'), // Break long team names
    matches: team.matches,
    wins: team.won,
    losses: team.lost,
    winPercentage: team.matches > 0 ? Math.round((team.won / team.matches) * 100) : 0,
    averageScore: Math.floor(Math.random() * 50) + 150, // Mock data
    totalRuns: Math.floor(Math.random() * 500) + 1500, // Mock data
    totalWickets: Math.floor(Math.random() * 50) + 100 // Mock data
  }));

  const topPlayers: PlayerStats[] = [
    { name: 'Virat Kohli', team: 'RCB', runs: 741, average: 61.75, strikeRate: 154.69 },
    { name: 'Ruturaj Gaikwad', team: 'CSK', runs: 583, average: 53.0, strikeRate: 142.56 },
    { name: 'Riyan Parag', team: 'RR', runs: 573, average: 52.09, strikeRate: 149.22 },
    { name: 'Sanju Samson', team: 'RR', runs: 531, average: 48.27, strikeRate: 153.46 },
    { name: 'Travis Head', team: 'SRH', runs: 567, average: 40.5, strikeRate: 191.55 }
  ];

  const pointsChartData = pointsTable.map(team => ({
    team: team.team.split(' ').map(word => word.substring(0, 3)).join(''),
    points: team.points,
    wins: team.won,
    losses: team.lost,
    nrr: parseFloat(team.netRunRate)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPointsChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={pointsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="team" className="text-sm" />
        <YAxis className="text-sm" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="points" fill="#8884d8" name="Points" />
        <Bar dataKey="wins" fill="#82ca9d" name="Wins" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPerformanceChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={teamPerformanceData.slice(0, 8)}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ team, winPercentage }) => `${team}: ${winPercentage}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="winPercentage"
        >
          {teamPerformanceData.slice(0, 8).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderPlayersChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={topPlayers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="name" className="text-sm" angle={-45} textAnchor="end" height={100} />
        <YAxis className="text-sm" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="runs" fill="#ff7300" name="Runs" />
        <Bar dataKey="strikeRate" fill="#00C49F" name="Strike Rate" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTrendsChart = () => {
    const trendData = pointsTable.map((team, index) => ({
      team: team.team.split(' ').map(word => word.substring(0, 3)).join(''),
      points: team.points,
      position: team.position,
      nrr: parseFloat(team.netRunRate) * 10 + 10 // Normalize for visibility
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="team" className="text-sm" />
          <YAxis className="text-sm" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="points" stroke="#8884d8" strokeWidth={3} name="Points" />
          <Line type="monotone" dataKey="nrr" stroke="#82ca9d" strokeWidth={2} name="NRR (scaled)" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const chartButtons = [
    { key: 'points', label: 'Points Analysis', icon: BarChart3, description: 'Team points and wins comparison' },
    { key: 'performance', label: 'Win Percentage', icon: PieChartIcon, description: 'Team win percentage distribution' },
    { key: 'players', label: 'Top Players', icon: Users, description: 'Leading run scorers and their stats' },
    { key: 'trends', label: 'Team Trends', icon: TrendingUp, description: 'Points and NRR trends' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Statistical Analysis
        </h2>
        <p className="text-indigo-100 text-sm mt-1">Interactive charts and performance metrics</p>
      </div>

      {/* Chart Type Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {chartButtons.map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              onClick={() => setActiveChart(key as ChartType)}
              className={`p-3 rounded-lg text-left transition-all ${
                activeChart === key
                  ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{label}</span>
              </div>
              <p className="text-xs opacity-75">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {chartButtons.find(btn => btn.key === activeChart)?.label}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {chartButtons.find(btn => btn.key === activeChart)?.description}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          {activeChart === 'points' && renderPointsChart()}
          {activeChart === 'performance' && renderPerformanceChart()}
          {activeChart === 'players' && renderPlayersChart()}
          {activeChart === 'trends' && renderTrendsChart()}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.max(...pointsTable.map(t => t.points))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Highest Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.max(...pointsTable.map(t => t.won))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Most Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.max(...pointsTable.map(t => parseFloat(t.netRunRate)))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Best NRR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {pointsTable.reduce((sum, t) => sum + t.matches, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart; 