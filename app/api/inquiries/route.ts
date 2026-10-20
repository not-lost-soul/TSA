import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/admin";
import { getRequestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(20),
  email: z.union([z.string().email().max(200), z.literal("")]).optional(),
  message: z.string().max(1500).optional(),
  course: z.string().min(1).max(150),
});
export async function POST(req: Request) {
  const ip = getRequestIp(req);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Please check the form fields." },
        { status: 400 },
      );
    const db = createServiceClient();
    const { error } = await db
      .from("inquiries")
      .insert({
        ...parsed.data,
        email: parsed.data.email || null,
        ip_address: ip,
      });
    if (error) throw error;
    await writeAudit({
      identity: parsed.data.email || parsed.data.name,
      ip,
      userAgent: req.headers.get("user-agent"),
      success: true,
      action: "public_inquiry_submitted",
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("inquiry submission failed", e);
    await writeAudit({
      ip,
      userAgent: req.headers.get("user-agent"),
      success: false,
      action: "public_inquiry_failed",
    });
    return NextResponse.json(
      { error: "Unable to save inquiry right now." },
      { status: 503 },
    );
  }
}
