import { redirect } from "next/navigation";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createServiceClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function Activity() {
  if (!(await isAdminSessionValid())) redirect("/private-console");
  const db = createServiceClient();
  const { data, error } = await db
    .from("activity_logs")
    .select("created_at,identity,ip_address,user_agent,success,action,details")
    .order("created_at", { ascending: false })
    .limit(250);
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Owner tools / Audit</span>
        <h1>
          Activity
          <br />
          log.
        </h1>
      </section>
      <section className="section console-panel">
        {error ? (
          <p>Could not load activity logs.</p>
        ) : (
          <table className="console-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Identity</th>
                <th>IP</th>
                <th>Result</th>
                <th>Action</th>
                <th>User agent</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((r, i) => (
                <tr key={i}>
                  <td>{new Date(r.created_at).toLocaleString("en-IN")}</td>
                  <td>{r.identity}</td>
                  <td>{r.ip_address}</td>
                  <td>{r.success ? "Success" : "Failure"}</td>
                  <td>{r.action}</td>
                  <td>{r.user_agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
