import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getRequestIp } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { isStudyTopic } from "@/lib/subjects";
import { resolveCoarseRegion } from "@/lib/radar";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  conversationId: z.string().uuid().nullish(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(3000),
      }),
    )
    .min(1)
    .max(30),
});

const REFUSAL =
  "I can help with school subjects for Classes 6–10 and competitive-exam study topics such as JEE, NEET, CET, CUET and UPSC. Please ask a study-related question.";

const SYSTEM_PROMPT =
  "You are The Solution Academy's school-level study assistant. Answer only study questions for Classes 6–10 and the competitive exams JEE, NEET, CET, CUET, UPSC and similar exams. Explain clearly, encourage learning, and never claim certainty where unsure. If the message is not a study question, politely refuse and redirect to study. Do not provide professional medical, legal, financial, or dangerous advice.";

export async function POST(req: Request) {
  const ip = getRequestIp(req);
  const userAgent = req.headers.get("user-agent");
  let userId: string | undefined;

  try {
    const auth = await createClient();
    if (!auth)
      return NextResponse.json(
        { error: "Authentication is not configured." },
        { status: 503 },
      );

    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      await writeAudit({
        ip,
        userAgent,
        success: false,
        action: "helpbox_unauthorized",
      });
      return NextResponse.json(
        { error: "Sign in to use the study helpbox." },
        { status: 401 },
      );
    }
    userId = user.id;

    const limit = Math.max(
      1,
      Math.min(30, Number(process.env.HELPBOX_RATE_LIMIT_PER_MINUTE) || 8),
    );
    if (!rateLimit(`helpbox:${user.id}`, limit).allowed) {
      await writeAudit({
        identity: user.email,
        ip,
        userAgent,
        success: false,
        action: "helpbox_rate_limited",
      });
      return NextResponse.json(
        {
          error:
            "You have reached the study help limit. Please try again in a minute.",
        },
        { status: 429 },
      );
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Please send a valid study question." },
        { status: 400 },
      );

    const { messages, conversationId } = parsed.data;
    const last = messages.filter((m) => m.role === "user").at(-1);
    if (!last)
      return NextResponse.json(
        { error: "Please ask a study question." },
        { status: 400 },
      );

    const db = createServiceClient();

    // Reuse the student's own conversation if one is given; otherwise start a new one.
    let convoId: string | null = null;
    if (conversationId) {
      const { data: existing } = await db
        .from("chat_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("student_id", user.id)
        .maybeSingle();
      convoId = existing?.id ?? null;
    }

    if (!convoId) {
      const { data: created, error: createError } = await db
        .from("chat_conversations")
        .insert({
          student_id: user.id,
          student_email: user.email ?? null,
          title: last.content.slice(0, 120),
        })
        .select("id")
        .single();
      if (createError || !created)
        throw new Error("Could not create conversation");
      convoId = created.id;

      const region = await resolveCoarseRegion(ip);
      await db.from("student_sessions").insert({
        student_id: user.id,
        conversation_id: convoId,
        ip_address: ip,
        city: region?.city ?? "unknown",
        region: region?.region ?? "unknown",
        country: region?.country ?? "unknown",
        location_status: region ? "resolved" : "unknown",
        user_agent: userAgent ?? "unknown",
      });
    }

    const refused = !isStudyTopic(last.content, messages.length > 1);
    let answer = "";

    if (refused) {
      answer = REFUSAL;
      await db.from("helpbox_refusals").insert({
        student_id: user.id,
        conversation_id: convoId,
        prompt: last.content,
        refusal_reason: "out_of_scope",
      });
    } else {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey)
        return NextResponse.json(
          { error: "Study help is temporarily unavailable." },
          { status: 503 },
        );

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 900,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.slice(-12),
            ],
          }),
          signal: AbortSignal.timeout(25_000),
        },
      );
      if (!response.ok) throw new Error(`Groq error ${response.status}`);
      const payload = await response.json();
      answer =
        payload.choices?.[0]?.message?.content?.toString() ||
        "I couldn't create an answer this time. Please try again.";
    }

    // Save only the new turn (the client resends the whole history every time).
    const { error: msgError } = await db.from("chat_messages").insert([
      {
        conversation_id: convoId,
        student_id: user.id,
        role: "user",
        content: last.content,
      },
      {
        conversation_id: convoId,
        student_id: user.id,
        role: "assistant",
        content: answer,
      },
    ]);
    if (msgError) throw msgError;

    await db
      .from("chat_conversations")
      .update({
        updated_at: new Date().toISOString(),
        last_message_preview: answer.slice(0, 240),
      })
      .eq("id", convoId);

    await writeAudit({
      identity: user.email,
      ip,
      userAgent,
      success: true,
      action: refused ? "helpbox_topic_refused" : "helpbox_answered",
      details: { conversation_id: convoId },
    });

    return NextResponse.json({ answer, conversationId: convoId });
  } catch (e) {
    console.error("helpbox request failed", e);
    await writeAudit({
      identity: userId ?? "unknown",
      ip,
      userAgent,
      success: false,
      action: "helpbox_error",
    });
    return NextResponse.json(
      { error: "Study help is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
