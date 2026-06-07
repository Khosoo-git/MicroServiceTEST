"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { getApiBase } from "../../lib/api";
import {
  RefreshCw,
  Zap,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface Trace {
  traceID: string;
  rootServiceName?: string;
  rootTraceName?: string;
  startTimeUnixNano?: string;
  durationMs?: number;
}

export default function TracesPage() {
  const [sidebarCollapsed] = useState(false);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [limit, setLimit] = useState(20);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState("");

  const loadTraces = async () => {
    try {
      setError("");

      let url = `${getApiBase()}/api/proxy/tempo?limit=${limit}`;
      if (serviceName) {
        url += `&service=${encodeURIComponent(serviceName)}`;
      }

      console.log("Fetching traces from:", url);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Tempo response:", data);

        if (data.traces && data.traces.length > 0) {
          setTraces(data.traces);
          setHasData(true);
        } else {
          setTraces([]);
          setHasData(false);
          setError(
            "No traces found. Services need to be configured with OpenTelemetry to send traces to Tempo.",
          );
        }
      } else {
        const errText = await response.text();
        console.error("Tempo error:", errText);
        setError(`Error: ${response.status} - ${errText}`);
        setTraces([]);
        setHasData(false);
      }
    } catch (err: any) {
      console.error("Failed to load traces:", err.message);
      setError(
        `Failed to load traces. Check that Tempo is running and services are sending traces.`,
      );
      setTraces([]);
      setHasData(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTraces();
  }, [serviceName, limit]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTraces();
  };

  const quickServices = [
    { name: "All Services", value: "" },
    { name: "Company", value: "company" },
    { name: "Job", value: "job" },
    { name: "Review", value: "review" },
    { name: "Gateway", value: "gateway" },
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Traces</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Distributed traces from Tempo (OpenTelemetry)
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

            {/* Info Banner - No Traces */}
            {!hasData && !loading && (
              <div className="card mb-6 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">
                      No Traces Available
                    </h3>
                    <p className="text-sm text-amber-700 mb-2">
                      {error || "Tempo doesn't have any traces yet."}
                    </p>
                    <div className="text-sm text-amber-700">
                      <p className="font-semibold mb-1">To enable tracing:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Add OpenTelemetry dependencies to your services</li>
                        <li>
                          Configure:{" "}
                          <code className="bg-amber-100 px-1 rounded">
                            OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://tempo:4318/v1/traces
                          </code>
                        </li>
                        <li>
                          Set:{" "}
                          <code className="bg-amber-100 px-1 rounded">
                            OTEL_SERVICE_NAME=your-service
                          </code>
                        </li>
                        <li>Make HTTP requests through the services</li>
                        <li>Wait a few seconds, then click Refresh</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Filter */}
            <div className="card mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Filter by Service
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickServices.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setServiceName(item.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      serviceName === item.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {hasData ? `Traces (${traces.length})` : "No Traces"}
                  </h3>
                </div>
                {loading && (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                )}
              </div>

              {!hasData && !loading ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Ready to Query
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Select a service above to filter traces
                  </p>
                  <p className="text-sm text-slate-400">
                    Traces will appear when services send OpenTelemetry data to
                    Tempo
                  </p>
                </div>
              ) : hasData ? (
                <div className="space-y-3">
                  {traces.map((trace, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-4 h-4 text-indigo-600" />
                            <span className="font-mono text-sm text-indigo-600">
                              {trace.traceID
                                ? trace.traceID.substring(0, 16) + "..."
                                : "Unknown Trace"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {trace.rootServiceName || "Unknown Service"}
                            </span>
                            {trace.durationMs && (
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                {trace.durationMs.toFixed(2)} ms
                              </span>
                            )}
                            {trace.startTimeUnixNano && (
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                {new Date(
                                  parseInt(trace.startTimeUnixNano) / 1000000,
                                ).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
