export type PricingModel = "bundled" | "per_subject";
export type Subject = {
  id: string;
  class_id: string;
  name: string;
  description: string;
  fee: number | null;
  sort_order: number;
};
export type AcademyClass = {
  id: string;
  grade: number;
  title: string;
  description: string;
  pricing_model: PricingModel;
  bundled_fee: number | null;
  subjects: Subject[];
};
export type ExamCourse = {
  id: string;
  title: string;
  description: string;
  fee: number | null;
  duration_label: string;
  exams: string[];
  cta_label: string;
};
export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
