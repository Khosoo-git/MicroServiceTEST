const LOKI_URL = process.env.LOKI_URL ?? "http://localhost:3100";

/** Loki lines containing browser errors from gateway logs. */
const CLIENT_ERROR_LOKI_EXPR = '{job="gateway"} |= "CLIENT_ERROR_JSON"';

export async function GET() {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 900; // Last 15 minutes
  
  const query = encodeURIComponent(CLIENT_ERROR_LOKI_EXPR);

  const url = `${LOKI_URL}/loki/api/v1/query_range?query=${query}&start=${start}000000000&end=${end}000000000&limit=50`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return Response.json(
        { error: `Loki request failed: ${res.status}`, entries: [] },
        { status: 502 },
      );
    }

    const data = await res.json();
    const entries: string[] =
      data?.data?.result?.flatMap((r: { values: [string, string][] }) =>
        r.values.map((v) => v[1]),
      ) ?? [];

    return Response.json({ entries });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error", entries: [] },
      { status: 502 }
    );
  }
}
