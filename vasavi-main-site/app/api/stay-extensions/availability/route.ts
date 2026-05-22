const SUPERADMIN_BASE =
  process.env.SUPERADMIN_URL ?? process.env.NEXT_PUBLIC_SUPERADMIN_URL ?? "http://localhost:3001";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = `${SUPERADMIN_BASE}/api/stay-extensions/availability${url.search}`;
  const res = await fetch(target, { cache: "no-store" });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
