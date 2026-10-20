import { createServiceClient } from "@/lib/supabase/admin";
export type AuditInput = {
  identity?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  action: string;
  details?: Record<string, unknown>;
};
export async function writeAudit(input: AuditInput) {
  try {
    const db = createServiceClient();
    const { error } = await db
      .from("activity_logs")
      .insert({
        identity: input.identity ?? "unknown",
        ip_address: input.ip ?? "unknown",
        user_agent: input.userAgent ?? "unknown",
        success: input.success,
        action: input.action,
        details: input.details ?? {},
      });
    if (error) console.error("audit insert failed", error.message);
  } catch (e) {
    console.error(
      "audit unavailable",
      e instanceof Error ? e.message : "unknown error",
    );
  }
}
