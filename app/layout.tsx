import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import Helpbox from "@/components/Helpbox";
export const metadata: Metadata = {
  title: {
    default: "The Solution Academy | Learn with clarity",
    template: "%s | The Solution Academy",
  },
  description:
    "Focused academic learning for Classes 6–10 and competitive-exam awareness.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};
// Pages read live prices from the database and the signed-in student from cookies,
// so they must be rendered per request instead of frozen at build time.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let signedIn = false;
  try {
    const db = await createClient();
    if (db) {
      const { data } = await db.auth.getUser();
      signedIn = !!data.user;
    }
  } catch {}
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        {signedIn && <Helpbox />}
      </body>
    </html>
  );
}
