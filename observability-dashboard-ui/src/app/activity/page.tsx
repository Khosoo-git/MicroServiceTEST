"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { getApiBase } from "../../lib/api";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Server,
  Trash2,
} from "lucide-react";

interface Activity {
  id: number;
  action: string;
  serviceName: string;
  serviceType?: string;
  description: string;
  user: string;
  timestamp: string;
  details?: string;
}

export default function ActivityPage() {
  const [sidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch REAL activities from API
  const loadActivities = async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "SERVICE_REGISTERED":
        return <Server className="w-4 h-4" />;
      case "SERVICE_DELETED":
        return <Trash2 className="w-4 h-4" />;
      case "ALERT_FIRED":
        return <AlertCircle className="w-4 h-4" />;
      case "ALERT_RESOLVED":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      SERVICE_REGISTERED: "bg-green-100 text-green-600",
      SERVICE_DELETED: "bg-red-100 text-red-600",
      ALERT_FIRED: "bg-amber-100 text-amber-600",
      ALERT_RESOLVED: "bg-blue-100 text-blue-600",
    };
    return colors[action] || "bg-slate-100 text-slate-600";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      SERVICE_REGISTERED: "Registered",
      SERVICE_DELETED: "Deleted",
      ALERT_FIRED: "Alert Fired",
      ALERT_RESOLVED: "Alert Resolved",
    };
    return labels[action] || action;
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || activity.action === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-slate-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Activity</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Service registrations, deletions, and system events
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Stats Cards - REAL DATA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Activities</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {activities.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Last 100 events
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Services Registered
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {
                        activities.filter(
                          (a) => a.action === "SERVICE_REGISTERED",
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">New services</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Services Deleted</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {
                        activities.filter((a) => a.action === "SERVICE_DELETED")
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <Trash2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Removed services
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Alert Events</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {
                        activities.filter((a) => a.action.includes("ALERT"))
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Fired & resolved
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search activities..."
                      className="input-modern pl-9 w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="input-modern w-48"
                    >
                      <option value="all">All Types</option>
                      <option value="SERVICE_REGISTERED">Registered</option>
                      <option value="SERVICE_DELETED">Deleted</option>
                      <option value="ALERT_FIRED">Alert Fired</option>
                      <option value="ALERT_RESOLVED">Alert Resolved</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  Showing {filteredActivities.length} of {activities.length}{" "}
                  activities
                </div>
              </div>
            </div>

            {/* Activity Table - REAL DATA */}
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Activity
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Service
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Type
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        User
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p>No activities found</p>
                          <p className="text-sm mt-2">
                            {activities.length === 0
                              ? "No recent activities - register a service to see activity"
                              : "Try adjusting your search or filters"}
                          </p>
                          {activities.length === 0 && (
                            <p className="text-xs mt-4 text-slate-400">
                              Activities are automatically logged when you
                              register or delete services
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((activity) => (
                        <tr
                          key={activity.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(activity.action)}`}
                              >
                                {getActionIcon(activity.action)}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {getActionLabel(activity.action)}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {activity.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Server className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">
                                {activity.serviceName}
                              </span>
                              {activity.serviceType && (
                                <span className="text-xs text-slate-500">
                                  ({activity.serviceType})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}
                            >
                              {getActionIcon(activity.action)}
                              {getActionLabel(activity.action)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                {activity.user
                                  ? activity.user.charAt(0).toUpperCase()
                                  : "A"}
                              </div>
                              <span className="text-sm font-medium text-slate-900 capitalize">
                                {activity.user || "Anonymous"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
