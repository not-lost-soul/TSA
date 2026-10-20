import { describe, it, expect, beforeEach } from "vitest";
import {
  verifyAccessCode,
  signAdminSession,
  verifyAdminSession,
} from "../lib/crypto";
import { rateLimit, _clearRateLimitsForTests } from "../lib/rate-limit";
import { isStudyTopic } from "../lib/subjects";
import { scryptSync } from "node:crypto";
const secret = "test-secret",
  code = "this-is-a-long-test-code";
const salt = "0123456789abcdef0123456789abcdef";
const hash = `scrypt$${salt}$${scryptSync(`${secret}:${code}`, Buffer.from(salt, "hex"), 64).toString("hex")}`;
describe("admin access-code validation", () => {
  it("accepts correct code and rejects incorrect code", async () => {
    expect(await verifyAccessCode(code, hash, secret)).toBe(true);
    expect(await verifyAccessCode("wrong", hash, secret)).toBe(false);
  });
  it("rejects malformed hashes", async () =>
    expect(await verifyAccessCode(code, "not-a-hash", secret)).toBe(false));
});
describe("admin session", () => {
  it("validates a signed session for the fixed identity", () => {
    const t = signAdminSession("owner@example.com", secret);
    expect(verifyAdminSession(t, "owner@example.com", secret)).toBe(true);
    expect(verifyAdminSession(t, "other@example.com", secret)).toBe(false);
  });
  it("rejects tampered tokens", () =>
    expect(verifyAdminSession("bad", "owner@example.com", secret)).toBe(false));
});
describe("rate limiting", () => {
  beforeEach(_clearRateLimitsForTests);
  it("allows up to the configured count then blocks", () => {
    expect(rateLimit("a", 2, 1000, 100).allowed).toBe(true);
    expect(rateLimit("a", 2, 1000, 101).allowed).toBe(true);
    expect(rateLimit("a", 2, 1000, 102).allowed).toBe(false);
  });
  it("resets after window", () => {
    rateLimit("a", 1, 10, 100);
    expect(rateLimit("a", 1, 10, 111).allowed).toBe(true);
  });
});
describe("helpbox topic scope", () => {
  it("allows school study questions", () => {
    expect(isStudyTopic("Explain photosynthesis for Class 8")).toBe(true);
    expect(isStudyTopic("Help me solve this algebra equation")).toBe(true);
  });
  it("refuses non-study prompts", () => {
    expect(isStudyTopic("Tell me celebrity gossip")).toBe(false);
    expect(isStudyTopic("Give me a recipe for pasta")).toBe(false);
  });
});

describe("helpbox follow-ups and math", () => {
  it("allows short follow-ups only inside a conversation", () => {
    expect(isStudyTopic("why?")).toBe(false);
    expect(isStudyTopic("why?", true)).toBe(true);
  });
  it("allows arithmetic and still blocks off-topic follow-ups", () => {
    expect(isStudyTopic("what is 12 x 7 + 3 = ?")).toBe(true);
    expect(isStudyTopic("tell me celebrity gossip", true)).toBe(false);
  });
});
