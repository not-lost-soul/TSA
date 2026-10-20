import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const db = await createClient();
    if (!db)
      return NextResponse.json(
        { error: "Sign-in is not configured." },
        { status: 503 },
      );

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const { data, error } = await db.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error || !data.url) {
      return NextResponse.json(
        { error: "Unable to start Google sign-in." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json(
      { error: "Unable to start sign-in." },
      { status: 500 },
    );
  }
}
