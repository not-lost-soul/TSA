import type { Metadata } from "next";
import AdminUnlock from "@/components/AdminUnlock";
import { isAdminSessionValid } from "@/lib/admin-session";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Private console",
  robots: { index: false, follow: false, noarchive: true },
};
export const dynamic = "force-dynamic";
export default async function ConsolePage() {
  const valid = await isAdminSessionValid();
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Restricted / Owner access</span>
        <h1>
          Private
          <br />
          <em>console.</em>
        </h1>
        <p>
          This route is not linked from the public navigation. Access is logged
          and rate-limited.
        </p>
      </section>
      {valid ? (
        <section className="section">
          <div className="console-layout">
            <nav className="console-menu">
              <Link href="/private-console/content">Content & pricing</Link>
              <Link href="/private-console/students">
                Student study records
              </Link>
              <Link href="/private-console/activity">Activity log</Link>
              <Link href="/private-console/session">Lock console</Link>
            </nav>
            <div className="console-panel">
              <h2>Owner tools</h2>
              <p>
                Manage classes, subjects, prices, the competitive-exam program,
                student helpbox records, and security activity.
              </p>
              <p className="notice">
                Student prompts, IP addresses and approximate region are
                personal data. Use only for legitimate educational/security
                purposes and tell students and guardians how the data is
                handled.
              </p>
              <Link className="pill-link" href="/private-console/content">
                Open content manager ↗
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <AdminUnlock />
      )}
    </div>
  );
}
