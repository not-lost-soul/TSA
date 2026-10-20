import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("tsa_admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  await writeAudit({
    identity: process.env.ADMIN_IDENTITY,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown",
    userAgent: req.headers.get("user-agent"),
    success: true,
    action: "admin_session_locked",
  });
  return res;
}
