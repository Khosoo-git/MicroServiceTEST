'use client';

import { ChevronRight, User, Bot, GitCommit, AlertCircle, CheckCircle } from 'lucide-react';

interface Activity {
  id: number;
  user: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'user' | 'system';
  actionType: 'update' | 'create' | 'deploy' | 'login' | 'alert';
}

interface ActivityFeedProps {
  activities?: Activity[];
  onViewAll?: () => void;
}

export default function ActivityFeed({
  activities = [],
  onViewAll,
}: ActivityFeedProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'deploy':
        return GitCommit;
      case 'alert':
        return AlertCircle;
      case 'update':
        return CheckCircle;
      default:
        return User;
    }
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      deploy: 'text-purple-600 bg-purple-100',
      alert: 'text-red-600 bg-red-100',
      update: 'text-green-600 bg-green-100',
      create: 'text-blue-600 bg-blue-100',
      login: 'text-slate-600 bg-slate-100',
    };
    return colors[actionType] || colors.login;
  };

  // Sample data if no activities provided
  const displayActivities =
    activities.length > 0
      ? activities
      : ([
          {
            id: 1,
            user: 'Alex Rivera',
            action: 'Update',
            description: 'Changed status to Investigating',
            timestamp: '05:20:00',
            type: 'user' as const,
            actionType: 'update' as const,
          },
          {
            id: 2,
            user: 'System',
            action: 'Create',
            description: 'Automated alert trigger: High Latency',
            timestamp: '05:15:00',
            type: 'system' as const,
            actionType: 'create' as const,
          },
          {
            id: 3,
            user: 'Sarah Chen',
            action: 'Deploy',
            description: 'Rollback to v2.4.5',
            timestamp: '04:45:00',
            type: 'user' as const,
            actionType: 'deploy' as const,
          },
          {
            id: 4,
            user: 'Mike Ross',
            action: 'Login',
            description: 'Logged in from 192.168.1.5',
            timestamp: '12:30:00',
            type: 'user' as const,
            actionType: 'login' as const,
          },
          {
            id: 5,
            user: 'System',
            action: 'Alert',
            description: 'Critical: Database connection timeout',
            timestamp: '03:20:00',
            type: 'system' as const,
            actionType: 'alert' as const,
          },
        ] as Activity[]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">
          Activity Feed
        </h3>
        <button
          onClick={onViewAll}
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-4">
        {displayActivities.map((activity) => {
          const Icon = getActionIcon(activity.actionType);
          const colorClass = getActionColor(activity.actionType);

          return (
            <div key={activity.id} className="activity-item">
              {/* Avatar */}
              <div className="activity-avatar">
                {activity.type === 'system' ? (
                  <Bot className="w-4 h-4 text-slate-600" />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-slate-500"> performed </span>
                  <span className="font-medium">{activity.action}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activity.description}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {activity.timestamp}
                </div>
              </div>

              {/* Action Icon */}
              <div
                className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
