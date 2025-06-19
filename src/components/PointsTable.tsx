'use client';

import React from 'react';
import { PointsTableTeam } from '@/types/ipl';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PointsTableProps {
  teams: PointsTableTeam[];
}

const PointsTable: React.FC<PointsTableProps> = ({ teams }) => {
  const getQualificationColor = (qualification: string | undefined, position: number) => {
    if (position <= 4) return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400';
    if (position <= 6) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
  };

  const getQualificationIcon = (position: number) => {
    if (position <= 4) return <Trophy className="h-4 w-4" />;
    if (position <= 6) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getNetRunRateColor = (nrr: string) => {
    const value = parseFloat(nrr);
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Points Table
        </h2>
        <p className="text-blue-100 text-sm mt-1">IPL 2024 League Standings</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">M</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">W</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">L</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">T</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NR</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pts</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NRR</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {teams.map((team, index) => (
              <tr key={team.team} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                team.position <= 4 ? 'bg-green-50/30 dark:bg-green-900/10' : 
                team.position <= 6 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : 
                'bg-red-50/30 dark:bg-red-900/10'
              }`}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{team.position}</span>
                    {getQualificationIcon(team.position)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900 dark:text-white">{team.team}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-gray-900 dark:text-white">{team.matches}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-green-600 dark:text-green-400 font-semibold">{team.won}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-red-600 dark:text-red-400 font-semibold">{team.lost}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{team.tied}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{team.noResult}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{team.points}</td>
                <td className={`px-4 py-4 whitespace-nowrap text-center font-semibold ${getNetRunRateColor(team.netRunRate)}`}>
                  {team.netRunRate}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getQualificationColor(team.qualification, team.position)}`}>
                    {getQualificationIcon(team.position)}
                    {team.position <= 4 ? 'Qualified' : team.position <= 6 ? 'Possible' : 'Eliminated'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {teams.map((team) => (
          <div key={team.team} className={`p-4 ${
            team.position <= 4 ? 'bg-green-50/50 dark:bg-green-900/10' : 
            team.position <= 6 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : 
            'bg-red-50/50 dark:bg-red-900/10'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{team.position}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{team.team}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getQualificationColor(team.qualification, team.position)}`}>
                    {getQualificationIcon(team.position)}
                    {team.position <= 4 ? 'Qualified' : team.position <= 6 ? 'Possible' : 'Eliminated'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.points}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{team.matches}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Matches</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">{team.won}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Won</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">{team.lost}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Lost</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${getNetRunRateColor(team.netRunRate)}`}>{team.netRunRate}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">NRR</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Qualified for Playoffs (Top 4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Possible Qualification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Eliminated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsTable; 