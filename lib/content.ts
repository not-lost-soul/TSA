import { createServiceClient } from "@/lib/supabase/admin";
import type { AcademyClass, ExamCourse } from "@/lib/types";
export async function getClasses(): Promise<AcademyClass[]> {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("academy_classes")
      .select(
        "id,grade,title,description,pricing_model,bundled_fee,subjects:subjects(id,class_id,name,description,fee,sort_order)",
      )
      .order("grade");
    if (error) {
      console.error(error.message);
      return [];
    }
    return (data ?? []) as AcademyClass[];
  } catch {
    return [];
  }
}
export async function getExamCourse(): Promise<ExamCourse | null> {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("exam_courses")
      .select("*")
      .eq("slug", "one-day-competitive-exam-preparation")
      .maybeSingle();
    if (error) console.error(error.message);
    return data as ExamCourse | null;
  } catch {
    return null;
  }
}
