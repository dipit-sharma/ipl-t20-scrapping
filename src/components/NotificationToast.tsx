'use client';

import React, { useState, useEffect } from 'react';
import { NotificationData } from '@/types/ipl';
import { Bell, X, Trophy, Target, Users, Calendar } from 'lucide-react';

interface NotificationToastProps {
  notification: NotificationData;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'wicket':
        return <Target className="h-5 w-5" />;
      case 'boundary':
        return <Trophy className="h-5 w-5" />;
      case 'milestone':
        return <Users className="h-5 w-5" />;
      case 'match_start':
      case 'match_end':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'wicket':
        return 'bg-red-500';
      case 'boundary':
        return 'bg-green-500';
      case 'milestone':
        return 'bg-blue-500';
      case 'match_start':
        return 'bg-purple-500';
      case 'match_end':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-in-out transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`${getColor()} h-1 w-full`}></div>
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`${getColor()} text-white p-2 rounded-full flex-shrink-0`}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {notification.type.replace('_', ' ')}
                </p>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {notification.message}
              </p>
              
              {notification.match && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <div className="font-medium">
                    {notification.match.team1} vs {notification.match.team2}
                  </div>
                  <div>{notification.match.venue}</div>
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-2">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Manager Component
interface NotificationManagerProps {
  notifications: NotificationData[];
  onRemoveNotification: (id: string) => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onRemoveNotification
}) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => onRemoveNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};

export default NotificationToast; 