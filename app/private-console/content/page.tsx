import { redirect } from "next/navigation";
import { isAdminSessionValid } from "@/lib/admin-session";
import { createServiceClient } from "@/lib/supabase/admin";
import ContentManager from "@/components/ContentManager";
export const dynamic = "force-dynamic";
export default async function ContentPage() {
  if (!(await isAdminSessionValid())) redirect("/private-console");
  const db = createServiceClient();
  const [{ data: classes }, { data: subjects }, { data: exam }] =
    await Promise.all([
      db.from("academy_classes").select("*").order("grade"),
      db.from("subjects").select("*").order("sort_order"),
      db
        .from("exam_courses")
        .select("*")
        .eq("slug", "one-day-competitive-exam-preparation")
        .maybeSingle(),
    ]);
  return (
    <div className="wrap">
      <section className="page-title">
        <span className="eyebrow">Owner tools / Content</span>
        <h1>
          Content &<br />
          pricing.
        </h1>
      </section>
      <section className="section">
        <ContentManager
          classes={classes ?? []}
          subjects={subjects ?? []}
          exam={exam}
        />
      </section>
    </div>
  );
}
