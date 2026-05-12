"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import StatsCard from "../components/StatsCard";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Plus,
  RefreshCw,
} from "lucide-react";

interface Incident {
  id: number;
  title: string;
  severity: string;
  service: string;
  status: string;
  createdAt: string;
}

interface Activity {
  id: number;
  action: string;
  serviceName: string;
  description: string;
  user: string;
  timestamp: string;
}

function DashboardContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    activeIncidents: 0,
    serviceHealth: 0,
    totalSystems: 0,
  });
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadDashboardData = async () => {
    try {
      // Load services count and health
      const servicesRes = await fetch("http://localhost:8085/api/services");
      const services = await servicesRes.json();

      setStats({
        activeIncidents: 0,
        serviceHealth: services.filter((s: any) => s.status === "HEALTHY")
          .length,
        totalSystems: services.length,
      });

      // Load activities
      const activitiesRes = await fetch(
        "http://localhost:8085/api/activities?limit=5",
      );
      const activities = await activitiesRes.json();
      setActivities(activities);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Welcome back, {user?.username || "Guest"}!
                </p>
              </div>
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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard
                title="Active Incidents"
                value={stats.activeIncidents.toString()}
                icon={AlertTriangle}
                variant="critical"
              />
              <StatsCard
                title="Service Health"
                value={`${stats.serviceHealth}/${stats.totalSystems}`}
                icon={CheckCircle}
                variant="success"
              />
              <StatsCard
                title="Total Systems"
                value={stats.totalSystems.toString()}
                icon={Server}
                variant="info"
              />
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500">Loading activity feed...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">
                    No recent activity. Register a service to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <Clock className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.user} •{" "}
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
