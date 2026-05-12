"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { RefreshCw, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface LogEntry {
  labels: { [key: string]: string };
  entries: Array<{
    timestamp: string;
    line: string;
  }>;
}

export default function LogsPage() {
  const [sidebarCollapsed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filename, setFilename] = useState("/logs/company.log");
  const [limit, setLimit] = useState(100);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      setError("");

      // Use current time in nanoseconds
      const now = Date.now();
      const nowNs = now * 1000000;
      const startNs = (now - 86400000) * 1000000; // 24 hours ago

      // Use backend API proxy - pass as query params
      const url = `http://localhost:8085/api/proxy/loki?filename=${encodeURIComponent(filename)}&start=${startNs}&end=${nowNs}&limit=${limit}`;

      console.log("Fetching logs from:", url);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Loki response:", data);

        if (
          data.status === "success" &&
          data.data &&
          data.data.result &&
          data.data.result.length > 0
        ) {
          // Transform Loki response to our format
          // Loki returns: { stream: {...}, values: [[timestamp, line], ...] }
          // We need: { labels: {...}, entries: [{timestamp, line}, ...] }
          const transformedLogs = data.data.result.map((result: any) => ({
            labels: result.stream || {},
            entries: (result.values || []).map((v: any[]) => ({
              timestamp: v[0],
              line: v[1],
            })),
          }));

          console.log("Transformed logs:", transformedLogs);
          setLogs(transformedLogs);
          setHasData(true);
        } else {
          console.log("No logs found in response");
          setLogs([]);
          setHasData(false);
          setError(
            "No logs found yet. Make some API requests to generate logs, then try again.",
          );
        }
      } else {
        const errText = await response.text();
        console.error("Loki error:", errText);
        setError(`Error: ${response.status} - ${errText}`);
        setLogs([]);
        setHasData(false);
      }
    } catch (err: any) {
      console.error("Failed to load logs:", err.message);
      setError(
        `Failed to load logs. Check that Alloy is running and services are writing logs.`,
      );
      setLogs([]);
      setHasData(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filename]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const quickQueries = [
    { name: "Company", filename: "/logs/company.log" },
    { name: "Job", filename: "/logs/job.log" },
    { name: "Review", filename: "/logs/review.log" },
    { name: "Gateway", filename: "/logs/gateway.log" },
    { name: "App", filename: "/logs/app.log" },
  ];

  const totalLines = logs
    ? logs.reduce((sum, log) => sum + (log.entries ? log.entries.length : 0), 0)
    : 0;

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
                <h1 className="text-2xl font-bold text-slate-900">Logs</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Real-time logs from Loki (via Alloy)
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

            {/* Info Banner */}
            {!hasData && !loading && (
              <div className="card mb-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">
                      No Logs Yet
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      {error ||
                        "Alloy only collects NEW logs written after it starts."}
                    </p>
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">To generate logs:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          Make API requests:{" "}
                          <code className="bg-blue-100 px-1 rounded">
                            curl http://localhost:8081/actuator/health
                          </code>
                        </li>
                        <li>
                          Or add manual logs:{" "}
                          <code className="bg-blue-100 px-1 rounded">
                            echo &quot;test&quot; {">>"} logs/company.log
                          </code>
                        </li>
                        <li>Wait 5-10 seconds for Alloy to collect</li>
                        <li>Click Refresh</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Queries */}
            <div className="card mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Select Log File
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickQueries.map((item) => (
                  <button
                    key={item.filename}
                    onClick={() => setFilename(item.filename)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filename === item.filename
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
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
                  <FileText className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {hasData ? `Log Lines (${totalLines})` : "No Logs"}
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
                  <p className="text-slate-500">
                    Select a log file above and make some requests to generate
                    logs
                  </p>
                </div>
              ) : hasData ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs &&
                    logs.length > 0 &&
                    logs.map(
                      (log, logIndex) =>
                        log.entries &&
                        log.entries.length > 0 &&
                        log.entries.map((entry, entryIndex) => (
                          <div
                            key={`${logIndex}-${entryIndex}`}
                            className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 text-xs text-slate-500">
                                {new Date(
                                  parseInt(entry.timestamp) / 1000000,
                                ).toLocaleString()}
                              </div>
                              <div className="flex-1 break-all">
                                <span
                                  className={
                                    entry.line.includes("ERROR")
                                      ? "text-red-600"
                                      : entry.line.includes("WARN")
                                        ? "text-amber-600"
                                        : "text-slate-700"
                                  }
                                >
                                  {entry.line}
                                </span>
                              </div>
                            </div>
                          </div>
                        )),
                    )}
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
