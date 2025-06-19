"use client";

import React, { useState, useEffect } from "react";
import { IPLData, TabType } from "@/types/ipl";
import LiveMatchCard from "@/components/LiveMatchCard";
import PointsTable from "@/components/PointsTable";
import MatchSchedule from "@/components/MatchSchedule";
import StatsChart from "@/components/StatsChart";
import {
  NotificationManager,
  useNotifications,
} from "@/components/NotificationToast";
import {
  Radio,
  Trophy,
  Calendar,
  BarChart3,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";

export default function IPLDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const [iplData, setIplData] = useState<IPLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { notifications, addNotification, removeNotification } =
    useNotifications();

  // Fetch IPL data
  const fetchIPLData = async () => {
    try {
      setError(null);
      const response = await fetch("/api/scrape");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setIplData(result.data);
        setLastUpdated(new Date().toISOString());

        // Simulate real-time notifications
        if (result.data.liveMatch) {
          addNotification({
            type: "match_start",
            message: `Live: ${result.data.liveMatch.team1} vs ${result.data.liveMatch.team2}`,
            match: result.data.liveMatch,
          });
        }
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching IPL data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Show error notification
      addNotification({
        type: "wicket",
        message: "Failed to update data. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchIPLData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchIPLData();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Simulate live match events
  useEffect(() => {
    if (!iplData?.liveMatch) return;

    const events = [
      {
        type: "boundary" as const,
        message: "FOUR! Excellent shot through covers!",
      },
      {
        type: "wicket" as const,
        message: "WICKET! Bowled him with a brilliant delivery!",
      },
      {
        type: "milestone" as const,
        message: "FIFTY! A brilliant half-century!",
      },
      {
        type: "boundary" as const,
        message: "SIX! That ball has gone out of the park!",
      },
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of event
        const event = events[Math.floor(Math.random() * events.length)];
        addNotification({
          ...event,
          match: iplData.liveMatch,
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [iplData?.liveMatch]);

  const tabs = [
    {
      id: "live",
      label: "Live Match",
      icon: Radio,
      count: iplData?.liveMatch ? 1 : 0,
    },
    {
      id: "points",
      label: "Points Table",
      icon: Trophy,
      count: iplData?.pointsTable.length || 0,
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Calendar,
      count:
        (iplData?.upcomingMatches.length || 0) +
        (iplData?.recentMatches.length || 0),
    },
    {
      id: "stats",
      label: "Statistics",
      icon: BarChart3,
      count: iplData?.pointsTable.length || 0,
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    fetchIPLData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading IPL Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching latest match data. Please wait it may take a minute.
          </p>
        </div>
      </div>
    );
  }

  if (error && !iplData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2 mr-3">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  IPL T20 Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Live cricket updates & statistics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isOnline
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {isOnline ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>

              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
                title={
                  autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"
                }
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
              Last updated:{" "}
              {format(new Date(lastUpdated), "dd MMM yyyy, HH:mm:ss")}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {count > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {iplData && (
          <>
            {activeTab === "live" && (
              <div className="space-y-6">
                <LiveMatchCard match={iplData.liveMatch} />

                {/* Upcoming Matches Preview */}
                {iplData.upcomingMatches.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Next Matches
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {iplData.upcomingMatches.slice(0, 3).map((match) => (
                        <div
                          key={match.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {match.team1} vs {match.team2}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {format(
                                new Date(`${match.date}T${match.time}`),
                                "dd MMM, HH:mm"
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {match.venue}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "points" && (
              <PointsTable teams={iplData.pointsTable} />
            )}

            {activeTab === "schedule" && (
              <MatchSchedule
                upcomingMatches={iplData.upcomingMatches}
                recentMatches={iplData.recentMatches}
              />
            )}

            {activeTab === "stats" && (
              <StatsChart pointsTable={iplData.pointsTable} />
            )}
          </>
        )}
      </main>

      {/* Notifications */}
      <NotificationManager
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              © 2024 IPL T20 Live Dashboard. Built with Next.js, TypeScript &
              Tailwind CSS.
            </p>
            <p className="mt-2">
              Data sourced from official IPL channels. Updates every minute.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
