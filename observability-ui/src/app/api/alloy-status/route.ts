import { NextResponse } from "next/server";

const ALLOY_URL = process.env.ALLOY_URL ?? "http://localhost:1234";

export async function GET() {
  try {
    // Check readiness and collect basic status
    const readyRes = await fetch(`${ALLOY_URL}/-/ready`, {
      cache: "no-store",
    });

    const isReady = readyRes.status === 200;

    // Fetch Alloy's own metrics endpoint for component stats
    const metricsRes = await fetch(`${ALLOY_URL}/metrics`, {
      cache: "no-store",
    });
    const metricsText = await metricsRes.text();

    // Parse key metrics from Prometheus exposition format
    const metrics = parseAlloyMetrics(metricsText);

    return NextResponse.json({
      ready: isReady,
      url: ALLOY_URL,
      status: isReady ? "running" : "starting",
      metrics,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Alloy unreachable";
    return NextResponse.json(
      { error: message, url: ALLOY_URL, ready: false },
      { status: 502 }
    );
  }
}

function parseAlloyMetrics(text: string) {
  const result: Record<string, number> = {};
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) continue;

    // Match pattern: metric_name{...} value or metric_name value
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\{[^}]*\}\s+([\d.eE+\-]+)/);
    const simpleMatch = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s+([\d.eE+\-]+)/);

    const m = match ?? simpleMatch;
    if (m) {
      result[m[1]] = parseFloat(m[2]);
    }
  }

  return result;
}
