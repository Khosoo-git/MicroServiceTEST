const PROM_URL = process.env.PROMETHEUS_URL ?? "http://localhost:9090";

export async function GET() {
  const query = encodeURIComponent(
    "sum by (uri) (rate(http_server_requests_seconds_count[1m]))",
  );
  const url = `${PROM_URL}/api/v1/query?query=${query}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return Response.json(
      { error: `Prometheus request failed: ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  return Response.json(data);
}
