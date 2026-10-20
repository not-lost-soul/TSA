import type { PricingModel } from "@/lib/types";
export function normalizePricingModel(value: unknown): PricingModel | null {
  return value === "bundled" || value === "per_subject" ? value : null;
}
export function pricingUpdatePayload(
  input:
    | { operation: "set_model"; grade: number; pricing_model: PricingModel }
    | { operation: "set_bundle_fee"; grade: number; amount: number }
    | { operation: "set_subject_fee"; subject_id: string; amount: number },
) {
  if (input.operation === "set_model")
    return {
      grade: input.grade,
      pricing_model: input.pricing_model,
      ...(input.pricing_model === "per_subject" ? { bundled_fee: null } : {}),
    };
  if (input.operation === "set_bundle_fee")
    return {
      grade: input.grade,
      pricing_model: "bundled" as const,
      bundled_fee: input.amount,
    };
  return { subject_id: input.subject_id, fee: input.amount };
}
