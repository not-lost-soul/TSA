import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  if (code) {
    const db = await createClient();
    if (db) {
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/", origin));
    }
  }
  return NextResponse.redirect(new URL("/sign-in?error=oauth", origin));
}
