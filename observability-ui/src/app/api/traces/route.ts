const TEMPO_URL = process.env.TEMPO_URL ?? "http://localhost:3200";

export async function GET() {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 900;

  // Tempo search API: return recent traces without hard filters.
  const url = `${TEMPO_URL}/api/search?start=${start}&end=${end}&limit=20`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return Response.json(
      { error: `Tempo request failed: ${res.status}` },
      { status: 502 },
    );
  }

  const data = await res.json();

  // Tempo search responses can differ by version; normalize for the UI.
  const traces =
    data?.traces ??
    data?.data?.traces ??
    data?.data ??
    [];

  return Response.json({ traces });
}
