'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'critical' | 'success' | 'warning' | 'info';
  badge?: string;
}

export default function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  variant = 'info',
  badge,
}: StatsCardProps) {
  const variantStyles = {
    critical: {
      icon: 'stat-icon-critical',
      badge: 'bg-red-100 text-red-700',
    },
    success: {
      icon: 'stat-icon-success',
      badge: 'bg-green-100 text-green-700',
    },
    warning: {
      icon: 'stat-icon-warning',
      badge: 'bg-amber-100 text-amber-700',
    },
    info: {
      icon: 'stat-icon-info',
      badge: 'bg-blue-100 text-blue-700',
    },
  };

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          <div className={`stat-icon ${variantStyles[variant].icon} mb-4`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* Value */}
          <div className="stat-number">{value}</div>

          {/* Title */}
          <div className="stat-label">{title}</div>

          {/* Trend or Subtitle */}
          {trend && (
            <div
              className={`mt-2 text-xs font-medium ${
                trend.isPositive ? 'trend-up' : 'trend-down'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
          {subtitle && !trend && (
            <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
          )}
        </div>

        {/* Badge */}
        {badge && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${variantStyles[variant].badge}`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
