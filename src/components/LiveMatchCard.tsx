'use client';

import React from 'react';
import { Match } from '@/types/ipl';
import { Clock, MapPin, Radio } from 'lucide-react';
import { format } from 'date-fns';

interface LiveMatchCardProps {
  match?: Match;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match }) => {
  if (!match) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">No Live Match</h3>
          <p className="text-gray-500 dark:text-gray-400">Check back for live match updates</p>
        </div>
      </div>
    );
  }

  const isLive = match.isLive || match.status.toLowerCase().includes('live');

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-lg">
      {/* Live Indicator */}
      {isLive && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wide">Live</span>
        </div>
      )}

      {/* Match Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {match.team1} vs {match.team2}
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(`${match.date}T${match.time}`), 'dd MMM, yyyy - HH:mm')}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-xs">{match.venue}</span>
          </div>
        </div>
      </div>

      {/* Teams Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Team 1 */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-600 rounded-lg p-4 shadow-md">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{match.team1}</h3>
            {match.score1 && (
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {match.score1}
                {match.overs1 && <div className="text-sm text-gray-600 dark:text-gray-300">({match.overs1} overs)</div>}
              </div>
            )}
          </div>
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto font-bold text-lg shadow-lg">
            VS
          </div>
        </div>

        {/* Team 2 */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-600 rounded-lg p-4 shadow-md">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{match.team2}</h3>
            {match.score2 && (
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {match.score2}
                {match.overs2 && <div className="text-sm text-gray-600 dark:text-gray-300">({match.overs2} overs)</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Status */}
      <div className="mt-6 text-center">
        <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
          isLive 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
        }`}>
          {match.status}
        </div>
        {match.result && (
          <div className="mt-2 text-lg font-semibold text-green-600 dark:text-green-400">
            {match.result}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatchCard; 