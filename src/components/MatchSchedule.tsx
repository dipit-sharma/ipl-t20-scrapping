'use client';

import React, { useState } from 'react';
import { Match } from '@/types/ipl';
import { Calendar, Clock, MapPin, Filter, ChevronDown } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

interface MatchScheduleProps {
  upcomingMatches: Match[];
  recentMatches: Match[];
}

type FilterType = 'all' | 'upcoming' | 'recent' | 'today';

const MatchSchedule: React.FC<MatchScheduleProps> = ({ upcomingMatches, recentMatches }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const getMatchesByFilter = () => {
    const allMatches = [...upcomingMatches, ...recentMatches];
    
    switch (filter) {
      case 'upcoming':
        return upcomingMatches;
      case 'recent':
        return recentMatches;
      case 'today':
        return allMatches.filter(match => isToday(parseISO(match.date)));
      default:
        return allMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd MMM yyyy');
  };

  const getMatchStatus = (match: Match) => {
    if (match.status === 'Completed') {
      return {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        text: 'Completed'
      };
    }
    if (match.status === 'Upcoming') {
      return {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        text: 'Upcoming'
      };
    }
    if (match.status.toLowerCase().includes('live')) {
      return {
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        text: 'Live'
      };
    }
    return {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
      text: match.status
    };
  };

  const filteredMatches = getMatchesByFilter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Match Schedule
        </h2>
        <p className="text-purple-100 text-sm mt-1">Upcoming and Recent Matches</p>
      </div>

      {/* Filter Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Matches', count: upcomingMatches.length + recentMatches.length },
            { key: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
            { key: 'recent', label: 'Recent', count: recentMatches.length },
            { key: 'today', label: 'Today', count: [...upcomingMatches, ...recentMatches].filter(m => isToday(parseISO(m.date))).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                filter === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              {label}
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No matches found for the selected filter</p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const status = getMatchStatus(match);
            const isExpanded = expandedMatch === match.id;
            
            return (
              <div key={match.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div 
                  className="cursor-pointer"
                  onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 min-w-fit">
                        {getDateLabel(match.date)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                      {match.status.toLowerCase().includes('live') && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Team 1 */}
                    <div className="text-center md:text-right">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{match.team1}</h3>
                      {match.score1 && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          {match.score1} {match.overs1 && `(${match.overs1})`}
                        </div>
                      )}
                    </div>

                    {/* VS & Time */}
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full h-10 w-10 flex items-center justify-center mx-auto font-bold text-sm shadow-lg mb-2">
                        VS
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{match.time}</span>
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div className="text-center md:text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{match.team2}</h3>
                      {match.score2 && (
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          {match.score2} {match.overs2 && `(${match.overs2})`}
                        </div>
                      )}
                    </div>
                  </div>

                  {match.result && (
                    <div className="mt-3 text-center">
                      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-2">
                        <span className="text-green-800 dark:text-green-200 font-semibold">{match.result}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{match.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{format(parseISO(match.date), 'EEEE, dd MMMM yyyy')}</span>
                      </div>
                    </div>
                    
                    {/* Additional match details could go here */}
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Match ID: {match.id} • Status: {match.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredMatches.length} of {upcomingMatches.length + recentMatches.length} matches
        </div>
      </div>
    </div>
  );
};

export default MatchSchedule; 