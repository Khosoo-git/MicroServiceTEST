'use client';

import { ChevronRight } from 'lucide-react';

interface Service {
  id: number;
  serviceName: string;
  serviceType: string;
  status: 'critical' | 'warning' | 'info' | 'success';
  priority: 'P1' | 'P2' | 'P3';
  timestamp: string;
  statusLabel?: string;
}

interface ServiceListProps {
  services?: Service[];
  onViewAll?: () => void;
}

export default function ServiceList({
  services = [],
  onViewAll,
}: ServiceListProps) {
  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      critical: 'text-red-500',
      warning: 'text-amber-500',
      info: 'text-blue-500',
      success: 'text-green-500',
    };
    return styles[status] || styles.info;
  };

  const getStatusBadgeStyles = (statusLabel?: string) => {
    const styles: Record<string, string> = {
      Investigating: 'bg-blue-100 text-blue-700',
      Open: 'bg-amber-100 text-amber-700',
      Resolved: 'bg-green-100 text-green-700',
      Monitoring: 'bg-purple-100 text-purple-700',
      ActionRequired: 'bg-red-100 text-red-700',
    };
    return styles[statusLabel || ''] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityStyles = (priority: string) => {
    const styles: Record<string, string> = {
      P1: 'bg-red-50 text-red-700',
      P2: 'bg-amber-50 text-amber-700',
      P3: 'bg-blue-50 text-blue-700',
    };
    return styles[priority] || styles.P3;
  };

  // Sample data if no services provided
  const displayServices =
    services.length > 0
      ? services
      : ([
          {
            id: 1,
            serviceName: 'Increased error rate on checkout API',
            serviceType: 'api',
            status: 'critical' as const,
            priority: 'P1' as const,
            timestamp: '12/05/2025, 04:30:00',
            statusLabel: 'Investigating',
          },
          {
            id: 2,
            serviceName: 'Elevated latency in EU cluster',
            serviceType: 'cloud',
            status: 'warning' as const,
            priority: 'P2' as const,
            timestamp: '12/05/2025, 05:15:00',
            statusLabel: 'Open',
          },
          {
            id: 3,
            serviceName: 'Database outage in US region',
            serviceType: 'database',
            status: 'critical' as const,
            priority: 'P1' as const,
            timestamp: '12/05/2025, 06:00:00',
            statusLabel: 'Open',
          },
          {
            id: 4,
            serviceName: 'Network instability in APAC',
            serviceType: 'server',
            status: 'warning' as const,
            priority: 'P2' as const,
            timestamp: '12/05/2025, 07:30:00',
            statusLabel: 'Investigating',
          },
          {
            id: 5,
            serviceName: 'User authentication issues',
            serviceType: 'api',
            status: 'info' as const,
            priority: 'P3' as const,
            timestamp: '12/05/2025, 08:45:00',
            statusLabel: 'Resolved',
          },
          {
            id: 6,
            serviceName: 'Slow response times in NA service',
            serviceType: 'microservice',
            status: 'warning' as const,
            priority: 'P2' as const,
            timestamp: '12/05/2025, 09:15:00',
            statusLabel: 'Monitoring',
          },
        ] as Service[]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Incidents
        </h3>
        <button
          onClick={onViewAll}
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {displayServices.map((service) => (
          <div
            key={service.id}
            className="list-item list-item-border cursor-pointer"
          >
            <div className="flex items-start gap-3 flex-1">
              {/* Status Dot */}
              <div
                className={`status-dot ${getStatusStyles(service.status)} mt-1.5`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {service.serviceName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  INC-{service.id.toString().padStart(6, '0')} •{' '}
                  {service.timestamp}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyles(service.priority)}`}
              >
                {service.priority}
              </span>
              {service.statusLabel && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(service.statusLabel)}`}
                >
                  {service.statusLabel}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
