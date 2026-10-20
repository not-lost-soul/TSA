import { redirect } from "next/navigation";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createServiceClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function Students() {
  if (!(await isAdminSessionValid())) redirect("/private-console");
  const db = createServiceClient();
  const { data: conversations, error } = await db
    .from("chat_conversations")
    .select(
      "id,student_id,student_email,title,created_at,updated_at,last_message_preview,chat_messages(id,role,content,created_at)",
    )
    .order("updated_at", { ascending: false })
    .limit(100);
  const { data: sessions } = await db
    .from("student_sessions")
    .select(
      "student_id,conversation_id,ip_address,city,region,country,location_status,created_at,user_agent",
    )
    .order("created_at", { ascending: false })
    .limit(300);
  const latest = new Map<string, any>();
  for (const s of sessions ?? [])
    if (!latest.has(s.conversation_id)) latest.set(s.conversation_id, s);
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Owner tools / Student study records</span>
        <h1>
          Study
          <br />
          sessions.
        </h1>
        <p>
          Review helpbox conversations and coarse region records. Unknown
          locations are intentionally not guessed.
        </p>
      </section>
      <section className="section console-panel">
        {error ? (
          <p>Could not load student records.</p>
        ) : !(conversations ?? []).length ? (
          <p>No study sessions recorded yet.</p>
        ) : (
          <table className="console-table">
            <thead>
              <tr>
                <th>Student / time</th>
                <th>Conversation</th>
                <th>Session metadata</th>
              </tr>
            </thead>
            <tbody>
              {(conversations ?? []).map((c) => {
                const s = latest.get(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      {c.student_email || c.student_id}
                      <br />
                      <small>
                        {new Date(c.created_at).toLocaleString("en-IN")}
                      </small>
                    </td>
                    <td>
                      <strong>{c.title}</strong>
                      {(c.chat_messages ?? [])
                        .sort((a: any, b: any) =>
                          a.created_at.localeCompare(b.created_at),
                        )
                        .map((m: any) => (
                          <p key={m.id}>
                            <b>{m.role}:</b> {m.content}
                          </p>
                        ))}
                    </td>
                    <td>
                      <p>IP: {s?.ip_address || "unknown"}</p>
                      <p>
                        Location:{" "}
                        {s?.location_status === "resolved"
                          ? [s.city, s.region, s.country]
                              .filter((x: string) => x && x !== "unknown")
                              .join(", ")
                          : "unknown / unresolved"}
                      </p>
                      <div className="map-unknown">
                        {s?.location_status === "resolved"
                          ? "Approximate region resolved — no precise pin stored"
                          : "Location unresolved — no pin shown"}
                      </div>
                      <small>{s?.user_agent || "unknown"}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
