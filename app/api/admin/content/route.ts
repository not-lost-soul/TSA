import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createServiceClient } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/audit";
import { getRequestIp } from "@/lib/http";
const fee = z.number().finite().min(0).max(10000000).nullable();
const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("class"),
    id: z.string().uuid(),
    title: z.string().max(120),
    description: z.string().max(3000),
    pricing_model: z.enum(["bundled", "per_subject"]),
    bundled_fee: fee,
  }),
  z.object({
    kind: z.literal("new_class"),
    grade: z.number().int().min(6).max(10),
    title: z.string().max(120),
    description: z.string().max(3000),
    pricing_model: z.enum(["bundled", "per_subject"]),
    bundled_fee: fee,
  }),
  z.object({
    kind: z.literal("subject"),
    id: z.string().uuid(),
    name: z.string().max(120),
    description: z.string().max(2000),
    fee,
    sort_order: z.number().int().min(0).max(1000),
  }),
  z.object({
    kind: z.literal("new_subject"),
    class_id: z.string().uuid(),
    name: z.string().min(1).max(120),
    description: z.string().max(2000),
    fee,
    sort_order: z.number().int().min(0).max(1000),
  }),
  z.object({
    kind: z.literal("exam"),
    id: z.string().uuid(),
    title: z.string().max(160),
    description: z.string().max(3000),
    fee,
    duration_label: z.string().max(100),
    exams: z.array(z.string().max(60)).max(30),
    cta_label: z.string().max(100),
  }),
]);
export async function POST(req: Request) {
  const ip = getRequestIp(req);
  if (!(await isAdminSessionValid())) {
    await writeAudit({
      identity: process.env.ADMIN_IDENTITY,
      ip,
      userAgent: req.headers.get("user-agent"),
      success: false,
      action: "admin_content_unauthorized",
    });
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success)
      return NextResponse.json(
        { error: "Invalid content fields." },
        { status: 400 },
      );
    const v = body.data,
      db = createServiceClient();
    let result: any;
    if (v.kind === "class")
      result = await db
        .from("academy_classes")
        .update({
          title: v.title,
          description: v.description,
          pricing_model: v.pricing_model,
          bundled_fee: v.pricing_model === "bundled" ? v.bundled_fee : null,
        })
        .eq("id", v.id);
    else if (v.kind === "new_class")
      result = await db
        .from("academy_classes")
        .insert({
          grade: v.grade,
          title: v.title,
          description: v.description,
          pricing_model: v.pricing_model,
          bundled_fee: v.pricing_model === "bundled" ? v.bundled_fee : null,
        });
    else if (v.kind === "subject")
      result = await db
        .from("subjects")
        .update({
          name: v.name,
          description: v.description,
          fee: v.fee,
          sort_order: v.sort_order,
        })
        .eq("id", v.id);
    else if (v.kind === "new_subject")
      result = await db
        .from("subjects")
        .insert({
          class_id: v.class_id,
          name: v.name,
          description: v.description,
          fee: v.fee,
          sort_order: v.sort_order,
        });
    else
      result = await db
        .from("exam_courses")
        .update({
          title: v.title,
          description: v.description,
          fee: v.fee,
          duration_label: v.duration_label,
          exams: v.exams,
          cta_label: v.cta_label,
        })
        .eq("id", v.id);
    if (result.error) throw result.error;
    await writeAudit({
      identity: process.env.ADMIN_IDENTITY,
      ip,
      userAgent: req.headers.get("user-agent"),
      success: true,
      action: "admin_content_updated",
      details: { kind: v.kind },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("content update failed", e);
    await writeAudit({
      identity: process.env.ADMIN_IDENTITY,
      ip,
      userAgent: req.headers.get("user-agent"),
      success: false,
      action: "admin_content_update_failed",
    });
    return NextResponse.json(
      { error: "Unable to save content." },
      { status: 500 },
    );
  }
}
