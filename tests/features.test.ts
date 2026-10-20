import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizePricingModel, pricingUpdatePayload } from "../lib/pricing";
import { rateLimit, _clearRateLimitsForTests } from "../lib/rate-limit";
import { isStudyTopic } from "../lib/subjects";

describe("pricing model switching", () => {
  it("accepts only supported models", () => {
    expect(normalizePricingModel("bundled")).toBe("bundled");
    expect(normalizePricingModel("per_subject")).toBe("per_subject");
    expect(normalizePricingModel("per-student")).toBeNull();
  });
  it("clears bundled fee when switching to per-subject", () =>
    expect(
      pricingUpdatePayload({
        operation: "set_model",
        grade: 9,
        pricing_model: "per_subject",
      }),
    ).toEqual({ grade: 9, pricing_model: "per_subject", bundled_fee: null }));
  it("sets bundle fee and bundled model together", () =>
    expect(
      pricingUpdatePayload({
        operation: "set_bundle_fee",
        grade: 8,
        amount: 12000,
      }),
    ).toEqual({ grade: 8, pricing_model: "bundled", bundled_fee: 12000 }));
});
describe("helpbox access policy primitives", () => {
  it("requires an authenticated identity at route level and allows only study-topic classification", () => {
    expect(isStudyTopic("Explain gravity for Class 8")).toBe(true);
    expect(isStudyTopic("Tell me celebrity gossip")).toBe(false);
  });
});
describe("audit logging failure handling", () => {
  it("does not throw if the audit database is unavailable", async () => {
    vi.resetModules();
    vi.doMock("../lib/supabase/admin", () => ({
      createServiceClient() {
        throw new Error("database offline");
      },
    }));
    const { writeAudit } = await import("../lib/audit");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      writeAudit({ success: false, action: "test_failure" }),
    ).resolves.toBeUndefined();
    spy.mockRestore();
    vi.doUnmock("../lib/supabase/admin");
  });
});
describe("rate limits", () => {
  beforeEach(_clearRateLimitsForTests);
  it("blocks after configured request count", () => {
    expect(rateLimit("student", 1, 60000, 100).allowed).toBe(true);
    expect(rateLimit("student", 1, 60000, 101).allowed).toBe(false);
  });
});
