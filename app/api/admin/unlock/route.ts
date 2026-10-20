import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAccessCode, signAdminSession } from "@/lib/crypto";
import { getRequestIp } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";
const schema = z.object({ code: z.string().min(1).max(256) });
export async function POST(req: Request) {
  const ip = getRequestIp(req),
    ua = req.headers.get("user-agent");
  const rate = rateLimit(`admin-unlock:${ip}`, 5, 15 * 60_000);
  if (!rate.allowed) {
    await writeAudit({
      identity: process.env.ADMIN_IDENTITY,
      ip,
      userAgent: ua,
      success: false,
      action: "admin_unlock_rate_limited",
    });
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }
  try {
    const parsed = schema.safeParse(await req.json());
    const hash = process.env.ADMIN_ACCESS_CODE_HASH,
      secret = process.env.ADMIN_DEPLOYMENT_SECRET,
      identity = process.env.ADMIN_IDENTITY;
    if (!parsed.success || !hash || !secret || !identity) {
      await writeAudit({
        identity,
        ip,
        userAgent: ua,
        success: false,
        action: "admin_unlock_failed",
        details: { reason: "invalid_input_or_configuration" },
      });
      return NextResponse.json({ error: "Access denied." }, { status: 401 });
    }
    const valid = await verifyAccessCode(parsed.data.code, hash, secret);
    await writeAudit({
      identity,
      ip,
      userAgent: ua,
      success: valid,
      action: valid ? "admin_unlock_success" : "admin_unlock_failed",
    });
    if (!valid)
      return NextResponse.json({ error: "Access denied." }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("tsa_admin_session", signAdminSession(identity, secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return res;
  } catch (e) {
    console.error("admin unlock failed", e);
    return NextResponse.json(
      { error: "Unable to validate access right now." },
      { status: 500 },
    );
  }
}
