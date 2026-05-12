"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { RefreshCw, Activity, Server, TrendingUp, TrendingDown } from "lucide-react";

interface Metric {
  metric: {
    __name__: string;
    instance?: string;
    job?: string;
  };
  value: [number, string];
}

export default function MetricsPage() {
  const [sidebarCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("up");

  // Fetch metrics from Prometheus
  const loadMetrics = async () => {
    try {
      const response = await fetch(`http://localhost:9090/api/v1/query?query=${query}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setMetrics(data.data.result || []);
        }
      }
    } catch (error) {
      console.error("Failed to load metrics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, [query]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  const quickQueries = [
    { name: "Services Up", query: "up" },
    { name: "HTTP Requests", query: "rate(http_server_requests_seconds_count[1m])" },
    { name: "JVM Memory", query: "jvm_memory_used_bytes" },
    { name: "Active Threads", query: "jvm_threads_live_threads" },
  ];

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
                <h1 className="text-2xl font-bold text-slate-900">Metrics</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Real-time metrics from Prometheus
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Quick Queries */}
            <div className="card mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Queries</h3>
              <div className="flex flex-wrap gap-2">
                {quickQueries.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setQuery(item.query)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Input */}
            <div className="card mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                PromQL Query
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-modern flex-1"
                  placeholder="Enter PromQL query (e.g., up, rate(http_requests[5m]))"
                />
                <button onClick={handleRefresh} className="btn-primary">
                  Query
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Results ({metrics.length})
                </h3>
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
              </div>

              {metrics.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p>No metrics found</p>
                  <p className="text-sm mt-2">Try a different query or check if Prometheus is running</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-mono text-sm text-indigo-600 mb-1">
                            {metric.metric.__name__}
                          </div>
                          <div className="text-xs text-slate-500">
                            {metric.metric.instance && (
                              <span className="mr-3">
                                <Server className="w-3 h-3 inline mr-1" />
                                {metric.metric.instance}
                              </span>
                            )}
                            {metric.metric.job && (
                              <span>
                                <Activity className="w-3 h-3 inline mr-1" />
                                {metric.metric.job}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {parseFloat(metric.value[1]).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(metric.value[0] * 1000).toLocaleTimeString()}
                          </div>
                        </div>
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
