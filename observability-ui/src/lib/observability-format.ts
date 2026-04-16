/** Spring Boot log: `2026-04-14 02:00:13 [thread] LEVEL logger - message` */

export type ParsedSpringLog = {
  timestamp?: string;
  thread?: string;
  level?: string;
  logger?: string;
  message?: string;
  raw: string;
};

export function parseSpringLogLine(line: string): ParsedSpringLog {
  const m = line.match(
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+\[([^\]]*)\]\s+(\w+)\s+(\S+)\s+-\s+(.*)$/,
  );
  if (!m) return { raw: line };
  return {
    timestamp: m[1],
    thread: m[2],
    level: m[3],
    logger: m[4],
    message: m[5],
    raw: line,
  };
}

export function shortLoggerClass(logger: string): string {
  const parts = logger.split(".");
  return parts[parts.length - 1] ?? logger;
}

export type ParsedClientError = {
  message?: string;
  pageUrl?: string;
  siteKey?: string;
  clientIp?: string;
  receivedAtLabel?: string;
  stack?: string | null;
};

export function parseClientErrorJsonLine(line: string): ParsedClientError | null {
  const marker = "CLIENT_ERROR_JSON ";
  const i = line.indexOf(marker);
  if (i === -1) return null;
  const jsonPart = line.slice(i + marker.length).trim();
  try {
    const obj = JSON.parse(jsonPart) as {
      payload?: {
        message?: string;
        url?: string;
        siteKey?: string;
        stack?: string | null;
      };
      clientIp?: string;
      receivedAt?: number;
    };
    const receivedAt = obj.receivedAt;
    let receivedAtLabel: string | undefined;
    if (typeof receivedAt === "number" && Number.isFinite(receivedAt)) {
      receivedAtLabel = new Date(receivedAt).toLocaleString("mn-MN", {
        dateStyle: "short",
        timeStyle: "medium",
      });
    }
    return {
      message: obj.payload?.message,
      pageUrl: obj.payload?.url,
      siteKey: obj.payload?.siteKey,
      clientIp: obj.clientIp,
      receivedAtLabel,
      stack: obj.payload?.stack,
    };
  } catch {
    return null;
  }
}

export function formatDurationMs(ms: number | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/** Tempo may return startTimeUnixNano as string of nanoseconds */
export function formatTraceStartFromNano(nano: string | undefined): string | undefined {
  if (!nano) return undefined;
  try {
    const ms = Number(BigInt(nano) / BigInt(1_000_000));
    if (!Number.isFinite(ms)) return undefined;
    return new Date(ms).toLocaleString("mn-MN", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  } catch {
    return undefined;
  }
}

export function shortenTraceId(id: string | undefined, head = 8, tail = 4): string {
  if (!id) return "—";
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

/** Map Micrometer URI to short Mongolian label where possible */
export function friendlyUriLabel(uri: string): { short: string; hint?: string } {
  if (!uri || uri === "total") return { short: "Бүх зам (нийлбэр)", hint: "URI-аар ялгагдаагүй" };
  const u = uri.replace(/\?.*$/, "");
  if (u.startsWith("/companies")) return { short: "Company API", hint: u };
  if (u.startsWith("/jobs")) return { short: "Job API", hint: u };
  if (u.startsWith("/reviews")) return { short: "Review API", hint: u };
  if (u.startsWith("/api/client-errors")) return { short: "Browser алдаа (ingest)", hint: u };
  if (u.startsWith("/fallback")) return { short: "Fallback (circuit breaker)", hint: u };
  return { short: u || uri, hint: undefined };
}

const LEVEL_ORDER: Record<string, number> = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};

export function shouldShowLogLevel(
  level: string | undefined,
  min: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR",
): boolean {
  if (!level) return true;
  const a = LEVEL_ORDER[level.toUpperCase()] ?? 2;
  const b = LEVEL_ORDER[min] ?? 2;
  return a >= b;
}
