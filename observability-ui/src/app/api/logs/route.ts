const LOKI_URL = process.env.LOKI_URL ?? "http://localhost:3100";

export async function GET() {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 300;
  const query = '{job=~"company|job|review|gateway"}';
  const url = `${LOKI_URL}/loki/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}000000000&end=${end}000000000&limit=200`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return Response.json(
        { error: `Loki request failed: ${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 }
    );
  }
}
