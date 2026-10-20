import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createServiceClient } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/audit";
import { getRequestIp } from "@/lib/http";
import { pricingUpdatePayload } from "@/lib/pricing";
const schema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("set_model"),
    grade: z.number().int().min(6).max(10),
    pricing_model: z.enum(["bundled", "per_subject"]),
  }),
  z.object({
    operation: z.literal("set_bundle_fee"),
    grade: z.number().int().min(6).max(10),
    amount: z.number().finite().min(0).max(10000000),
  }),
  z.object({
    operation: z.literal("set_subject_fee"),
    subject_id: z.string().uuid(),
    amount: z.number().finite().min(0).max(10000000),
  }),
]);
export async function POST(req: Request) {
  const ip = getRequestIp(req);
  if (!(await isAdminSessionValid()))
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid pricing operation." },
        { status: 400 },
      );
    const v = parsed.data,
      db = createServiceClient();
    let result: any;
    if (v.operation === "set_model") {
      const p = pricingUpdatePayload(v);
      result = await db
        .from("academy_classes")
        .update({
          pricing_model: p.pricing_model,
          ...("bundled_fee" in p ? { bundled_fee: p.bundled_fee } : {}),
        })
        .eq("grade", v.grade);
    } else if (v.operation === "set_bundle_fee") {
      const p = pricingUpdatePayload(v);
      result = await db
        .from("academy_classes")
        .update({ pricing_model: p.pricing_model, bundled_fee: p.bundled_fee })
        .eq("grade", v.grade);
    } else {
      const p = pricingUpdatePayload(v);
      result = await db
        .from("subjects")
        .update({ fee: p.fee })
        .eq("id", v.subject_id);
    }
    if (result.error) throw result.error;
    await writeAudit({
      identity: process.env.ADMIN_IDENTITY,
      ip,
      userAgent: req.headers.get("user-agent"),
      success: true,
      action: "admin_pricing_updated",
      details: { operation: v.operation },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("pricing update failed", e);
    await writeAudit({
      identity: process.env.ADMIN_IDENTITY,
      ip,
      userAgent: req.headers.get("user-agent"),
      success: false,
      action: "admin_pricing_update_failed",
    });
    return NextResponse.json(
      { error: "Unable to update pricing." },
      { status: 500 },
    );
  }
}
