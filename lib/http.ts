import { NextResponse } from "next/server";
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export function getRequestIp(req: Request) {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return candidate.length < 80 ? candidate : "unknown";
}
