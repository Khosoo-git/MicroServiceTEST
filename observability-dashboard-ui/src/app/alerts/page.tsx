"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { getApiBase } from "../../lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";

interface Alert {
  id: number;
  alertName: string;
  severity: string;
  status: string;
  serviceName: string;
  summary: string;
  description: string;
  instance: string;
  firedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
}

function AlertsContent() {
  const [sidebarCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/alerts/all`);
      const data = await response.json();
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts();
    setRefreshing(false);
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      const username = user?.username || "system";
      console.log("Acknowledging alert", alertId, "as user:", username);

      await fetch(`${getApiBase()}/api/alerts/${alertId}/acknowledge`, {
        method: "POST",
        headers: {
          "X-User": username,
          "Content-Type": "application/json",
        },
      });
      loadAlerts();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "active") return alert.status === "FIRING";
    if (filter === "acknowledged") return alert.status === "ACKNOWLEDGED";
    if (filter === "resolved") return alert.status === "RESOLVED";
    return true;
  });

  const stats = {
    firing: alerts.filter((a) => a.status === "FIRING").length,
    acknowledged: alerts.filter((a) => a.status === "ACKNOWLEDGED").length,
    resolved: alerts.filter((a) => a.status === "RESOLVED").length,
    critical: alerts.filter(
      (a) => a.severity === "critical" && a.status === "FIRING",
    ).length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "warning":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "FIRING":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "ACKNOWLEDGED":
        return <CheckCircle className="w-5 h-5 text-amber-600" />;
      case "RESOLVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Alert Management
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Monitor and manage system alerts
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card border-l-4 border-l-red-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.firing}
                    </div>
                    <div className="text-sm text-slate-500">Firing</div>
                  </div>
                </div>
              </div>

              <div className="card border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.acknowledged}
                    </div>
                    <div className="text-sm text-slate-500">Acknowledged</div>
                  </div>
                </div>
              </div>

              <div className="card border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.resolved}
                    </div>
                    <div className="text-sm text-slate-500">Resolved</div>
                  </div>
                </div>
              </div>

              <div className="card border-l-4 border-l-red-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {stats.critical}
                    </div>
                    <div className="text-sm text-slate-500">Critical</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="card mb-6">
              <div className="flex gap-2 border-b">
                {[
                  { id: "all", label: "All", count: alerts.length },
                  { id: "active", label: "Active", count: stats.firing },
                  {
                    id: "acknowledged",
                    label: "Acknowledged",
                    count: stats.acknowledged,
                  },
                  { id: "resolved", label: "Resolved", count: stats.resolved },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      filter === tab.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts List */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {filter === "all" ? "All Alerts" : `${filter} Alerts`}
                </h3>
                <span className="text-sm text-slate-500">
                  {filteredAlerts.length} alerts
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500">Loading alerts...</p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Alerts
                  </h3>
                  <p className="text-slate-500">
                    {filter === "active"
                      ? "No active alerts - all systems operational"
                      : "No alerts found"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-2 ${getSeverityColor(
                        alert.severity,
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(alert.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {alert.alertName}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/50">
                                {alert.severity}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/50">
                                {alert.status}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{alert.summary}</p>
                            <div className="text-xs space-y-1">
                              <div>
                                <strong>Service:</strong> {alert.serviceName}
                              </div>
                              {alert.instance && (
                                <div>
                                  <strong>Instance:</strong> {alert.instance}
                                </div>
                              )}
                              <div>
                                <strong>Fired:</strong>{" "}
                                {new Date(alert.firedAt).toLocaleString()}
                              </div>
                              {alert.status === "RESOLVED" &&
                                alert.resolvedAt && (
                                  <div>
                                    <strong>Resolved:</strong>{" "}
                                    {new Date(
                                      alert.resolvedAt,
                                    ).toLocaleString()}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {alert.status === "FIRING" && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="ml-4 px-3 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
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

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  );
}
