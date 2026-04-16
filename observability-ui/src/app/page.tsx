"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatDurationMs,
  formatTraceStartFromNano,
  friendlyUriLabel,
  parseClientErrorJsonLine,
  parseSpringLogLine,
  shortenTraceId,
  shouldShowLogLevel,
  shortLoggerClass,
} from "@/lib/observability-format";

type Metric = {
  metric: { uri?: string; [key: string]: string | undefined };
  value: [number, string];
};

type TraceSearch = {
  traceID?: string;
  rootServiceName?: string;
  rootTraceName?: string;
  startTimeUnixNano?: string;
  durationMs?: number;
};

type AlloyStatus = {
  ready?: boolean;
  url?: string;
  status?: string;
  metrics?: Record<string, number>;
  error?: string;
};

const grafanaBase =
  process.env.NEXT_PUBLIC_GRAFANA_URL ?? "http://localhost:3000";
const overviewUid =
  process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID ?? "ms-observability-overview";

function levelBadgeClass(level: string | undefined): string {
  const u = (level ?? "").toUpperCase();
  if (u === "ERROR") return "bg-red-900/60 text-red-200 border-red-500/40";
  if (u === "WARN") return "bg-amber-900/50 text-amber-100 border-amber-500/35";
  if (u === "INFO") return "bg-blue-900/40 text-blue-100 border-blue-500/30";
  if (u === "DEBUG") return "bg-gray-800 text-gray-300 border-gray-600/40";
  if (u === "TRACE") return "bg-gray-900/80 text-gray-500 border-gray-700/50";
  return "bg-gray-800 text-gray-300 border-gray-600/40";
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [traces, setTraces] = useState<TraceSearch[]>([]);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [alloyStatus, setAlloyStatus] = useState<AlloyStatus | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logLevelMin, setLogLevelMin] = useState<
    "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR"
  >("INFO");

  const grafanaOverviewUrl = useMemo(
    () => `${grafanaBase}/d/${overviewUid}`,
    [],
  );

  const grafanaExploreLogsUrl = useMemo(
    () =>
      `${grafanaBase}/explore?left=${encodeURIComponent('{"datasource":"loki","queries":[{"refId":"A","expr":"{job=~\\"company|job|review|gateway\\"}"}]}')}`,
    [],
  );

  const grafanaExploreTracesUrl = useMemo(
    () =>
      `${grafanaBase}/explore?left=${encodeURIComponent('{"datasource":"tempo","queries":[{"refId":"A","queryType":"search"}]}')}`,
    [],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const nextErrors: string[] = [];

    const [metricsRes, logsRes, tracesRes, clientErrRes, alloyRes] = await Promise.all([
      fetch("/api/metrics"),
      fetch("/api/logs"),
      fetch("/api/traces"),
      fetch("/api/client-errors"),
      fetch("/api/alloy-status"),
    ]);

    if (metricsRes.ok) {
      const metricsJson = await metricsRes.json();
      setMetrics(metricsJson.data?.result ?? []);
    } else {
      nextErrors.push("Could not connect to metrics (Prometheus)");
    }

    if (logsRes.ok) {
      const logsJson = await logsRes.json();
      const entries =
        logsJson.data?.result?.flatMap((r: { values: [string, string][] }) =>
          r.values.map((v) => v[1]),
        ) ?? [];
      setLogs(entries.slice(-40));
    } else {
      nextErrors.push("Could not connect to logs (Loki)");
    }

    if (tracesRes.ok) {
      const tracesJson = await tracesRes.json();
      setTraces(tracesJson.traces ?? []);
    } else {
      nextErrors.push("Could not connect to traces (Tempo)");
    }

    if (clientErrRes.ok) {
      const ce = await clientErrRes.json();
      setClientErrors(ce.entries ?? []);
    } else {
      nextErrors.push("Could not load browser error data");
    }

    if (alloyRes.ok) {
      const alloyData = await alloyRes.json();
      setAlloyStatus(alloyData);
    } else {
      // Don't add to errors - Alloy status is informational
      setAlloyStatus(null);
    }

    setErrors(nextErrors);
    setLastRefresh(
      new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      }),
    );
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const tick = () => void refresh();
    tick();
    const timer = setInterval(tick, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const filteredLogs = useMemo(() => {
    return logs.filter((line) => {
      const p = parseSpringLogLine(line);
      return shouldShowLogLevel(p.level, logLevelMin);
    });
  }, [logs, logLevelMin]);

  const metricsSorted = useMemo(() => {
    return [...metrics].sort((a, b) => {
      const ra = Number(a.value[1]) || 0;
      const rb = Number(b.value[1]) || 0;
      return rb - ra;
    });
  }, [metrics]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Observability Dashboard
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed">
              View your microservices&apos;{" "}
              <strong className="text-gray-300">metrics</strong> (request load),{" "}
              <strong className="text-gray-300">logs</strong> (server messages),
              and <strong className="text-gray-300">traces</strong> (request
              paths) all in one place. The numbers are technical measurements;
              use Grafana for deeper analysis.
            </p>
            {lastRefresh && (
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {lastRefresh} · auto-refreshes every 5 seconds
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M14 8A6 6 0 1 1 8 2" />
                <polyline
                  points="13 2 14 8 8 7"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
            <a
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
              href={grafanaOverviewUrl}
              target="_blank"
              rel="noreferrer"
            >
              Grafana Dashboard
            </a>
            <a
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              href={grafanaExploreTracesUrl}
              target="_blank"
              rel="noreferrer"
            >
              Search Traces
            </a>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
            {errors.join(" · ")}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm">HTTP Routes</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {metrics.length}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Average over the last 1 minute: requests per second (req/s) per
              route.
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm">Log Lines</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {filteredLogs.length}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Lines matching the selected level from the last ~5 minutes
              (filtered below).
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm">Traces</p>
            <p className="text-2xl font-bold text-violet-400 mt-1">
              {traces.length}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Distributed traces (request paths) from the last 15 minutes.
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm">Browser Errors</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {clientErrors.length}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Last 15 minutes (JS errors sent to the gateway).
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-sm">Alloy</p>
            <p className={`text-2xl font-bold mt-1 ${alloyStatus?.ready ? "text-emerald-400" : "text-gray-500"}`}>
              {alloyStatus?.status ?? "—"}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Log collector status (Grafana Alloy).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded-2xl shadow border border-gray-800">
            <h2 className="text-lg font-semibold mb-1">Metrics — HTTP Load</h2>
            <p className="text-sm text-gray-400 mb-4">
              Prometheus: average request rate over the last 1 minute per route
              (<span className="text-gray-300">req/s</span>). Higher = more
              traffic.
            </p>
            {metricsSorted.length === 0 ? (
              <p className="text-sm text-gray-500">
                No data. Make sure your services are running and receiving
                requests.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-800">
                      <th className="pb-2 pr-3 font-medium">Route / Service</th>
                      <th className="pb-2 pr-3 font-medium hidden sm:table-cell">
                        Technical URI
                      </th>
                      <th className="pb-2 font-medium text-right whitespace-nowrap">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsSorted.map((m, i) => {
                      const uri = m.metric.uri ?? "—";
                      const { short, hint } = friendlyUriLabel(uri);
                      const rate = Number(m.value[1]);
                      return (
                        <tr
                          key={`${uri}-${i}`}
                          className="border-b border-gray-800/80 last:border-0"
                        >
                          <td className="py-2.5 pr-3 align-top">
                            <div className="text-white font-medium">
                              {short}
                            </div>
                            {hint && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {hint}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 align-top hidden sm:table-cell font-mono text-xs text-gray-400 break-all max-w-48">
                            {uri}
                          </td>
                          <td className="py-2.5 text-right align-top whitespace-nowrap">
                            <span className="text-green-300 font-semibold tabular-nums">
                              {Number.isFinite(rate) ? rate.toFixed(2) : "—"}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              req/s
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl shadow border border-gray-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Logs — Server Messages
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Loki: Spring Boot logs. Note: TRACE level can produce a very
                  high volume of lines.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">
                  Minimum level
                </label>
                <select
                  value={logLevelMin}
                  onChange={(e) =>
                    setLogLevelMin(e.target.value as typeof logLevelMin)
                  }
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white"
                >
                  <option value="TRACE">TRACE (all)</option>
                  <option value="DEBUG">DEBUG+</option>
                  <option value="INFO">INFO+</option>
                  <option value="WARN">WARN+</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <a
                  className="text-sm text-cyan-300 hover:text-cyan-200 whitespace-nowrap"
                  href={grafanaExploreLogsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Grafana
                </a>
              </div>
            </div>
            <div className="h-72 overflow-y-auto space-y-2 pr-1">
              {filteredLogs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No logs found or none match the current filter.
                </p>
              ) : (
                filteredLogs.map((line, i) => {
                  const p = parseSpringLogLine(line);
                  return (
                    <div
                      key={i}
                      className="bg-gray-800/90 rounded-lg border border-gray-700/60 p-2.5 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {p.timestamp && (
                          <time className="text-xs text-gray-500 font-mono">
                            {p.timestamp}
                          </time>
                        )}
                        {p.level && (
                          <span
                            className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${levelBadgeClass(p.level)}`}
                          >
                            {p.level}
                          </span>
                        )}
                        {p.logger && (
                          <span className="text-xs text-gray-400 font-mono truncate max-w-full sm:max-w-[18rem]">
                            {shortLoggerClass(p.logger)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 text-xs leading-relaxed wrap-break-word">
                        {p.message ?? p.raw}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl shadow mt-4 border border-gray-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Browser Errors</h2>
              <p className="text-sm text-gray-400 mt-1">
                Errors sent from external websites — shows the page URL,
                message, and site key.
              </p>
            </div>
            <a
              className="text-sm text-amber-300 hover:text-amber-200 shrink-0"
              href={grafanaExploreLogsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Grafana Explore
            </a>
          </div>
          {clientErrors.length === 0 ? (
            <p className="text-sm text-gray-500">
              No submissions in the last 15 minutes. Use{" "}
              <code className="text-gray-400">POST /api/client-errors</code> to
              send a test error.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {clientErrors.slice(0, 20).map((line, i) => {
                const parsed = parseClientErrorJsonLine(line);
                if (parsed) {
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3"
                    >
                      <p className="text-white font-medium text-sm">
                        {parsed.message ?? "(no message)"}
                      </p>
                      <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {parsed.pageUrl && (
                          <>
                            <dt className="text-gray-500">Page</dt>
                            <dd className="text-amber-100/90 break-all">
                              {parsed.pageUrl}
                            </dd>
                          </>
                        )}
                        {parsed.siteKey && (
                          <>
                            <dt className="text-gray-500">Site key</dt>
                            <dd className="text-gray-200">{parsed.siteKey}</dd>
                          </>
                        )}
                        {parsed.clientIp && (
                          <>
                            <dt className="text-gray-500">Sender IP</dt>
                            <dd className="text-gray-200 font-mono">
                              {parsed.clientIp}
                            </dd>
                          </>
                        )}
                        {parsed.receivedAtLabel && (
                          <>
                            <dt className="text-gray-500">Received at</dt>
                            <dd className="text-gray-300">
                              {parsed.receivedAtLabel}
                            </dd>
                          </>
                        )}
                      </dl>
                      {parsed.stack && (
                        <pre className="mt-2 text-[11px] text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono bg-black/30 rounded p-2">
                          {parsed.stack}
                        </pre>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="bg-gray-800 p-2 rounded font-mono text-xs break-all text-amber-100/80"
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl shadow mt-4 border border-gray-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Traces — Request Paths</h2>
              <p className="text-sm text-gray-400 mt-1">
                Tempo: the path a single request takes through gateway →
                services, including total duration.
              </p>
            </div>
            <a
              className="text-sm text-violet-300 hover:text-violet-200 shrink-0"
              href={grafanaExploreTracesUrl}
              target="_blank"
              rel="noreferrer"
            >
              Search Traces (Grafana)
            </a>
          </div>

          {traces.length === 0 ? (
            <p className="text-sm text-gray-500">
              No traces in the last 15 minutes. Send a request to the API and
              verify that OTLP is exporting to{" "}
              <code className="text-gray-400">tempo</code>.
            </p>
          ) : (
            <div className="space-y-3">
              {traces.slice(0, 20).map((trace, i) => {
                const startLabel = formatTraceStartFromNano(
                  trace.startTimeUnixNano,
                );
                const tid = trace.traceID ?? "";
                return (
                  <div
                    key={trace.traceID ?? i}
                    className="rounded-xl border border-violet-900/35 bg-violet-950/15 p-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs text-gray-500">Trace ID</span>
                      <code className="text-violet-200 font-mono text-xs break-all">
                        {shortenTraceId(tid)}
                      </code>
                    </div>
                    <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-gray-500">Root service</dt>
                        <dd className="text-gray-100 font-medium">
                          {trace.rootServiceName ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Operation</dt>
                        <dd className="text-gray-200">
                          {trace.rootTraceName ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Duration</dt>
                        <dd className="text-violet-200 font-semibold tabular-nums">
                          {formatDurationMs(trace.durationMs)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Start time</dt>
                        <dd className="text-gray-300 text-sm">
                          {startLabel ?? "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl shadow mt-4 border border-gray-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Alloy — Log Collector</h2>
              <p className="text-sm text-gray-400 mt-1">
                Grafana Alloy: collects log files from services and forwards them to Loki.
              </p>
            </div>
            {alloyStatus?.url && (
              <a
                className="text-sm text-cyan-300 hover:text-cyan-200 shrink-0"
                href={`${alloyStatus.url}/-/ready`}
                target="_blank"
                rel="noreferrer"
              >
                Alloy API
              </a>
            )}
          </div>

          {!alloyStatus ? (
            <p className="text-sm text-gray-500">
              Alloy status unavailable. Ensure the container is running and port 12345 is exposed.
            </p>
          ) : alloyStatus.error ? (
            <p className="text-sm text-red-300">
              {alloyStatus.error}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">Status</dt>
                  <dd className={`text-lg font-semibold ${alloyStatus.ready ? "text-emerald-400" : "text-gray-500"}`}>
                    {alloyStatus.ready ? "Ready" : "Not Ready"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">URL</dt>
                  <dd className="text-gray-200 font-mono text-sm">
                    {alloyStatus.url ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Log Lines Read</dt>
                  <dd className="text-cyan-300 font-semibold tabular-nums">
                    {alloyStatus.metrics?.["loki_source_file_read_lines_total"]
                      ? Math.round(alloyStatus.metrics["loki_source_file_read_lines_total"]).toLocaleString()
                      : "—"}
                  </dd>
                </div>
              </div>
              {alloyStatus.metrics && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Key Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { key: "loki_source_file_read_lines_total", label: "Lines Read Total" },
                      { key: "loki_source_file_files_active", label: "Active Files" },
                      { key: "loki_write_batch_sent_bytes_total", label: "Bytes Sent to Loki" },
                      { key: "loki_write_batch_dropped_total", label: "Dropped Batches" },
                    ].map(({ key, label }) => {
                      const value = alloyStatus.metrics![key];
                      const display = value != null
                        ? typeof value === "number" && value > 1000
                          ? Math.round(value).toLocaleString()
                          : value
                        : "—";
                      return (
                        <div key={key} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-lg font-semibold text-gray-100 mt-1">{display}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
