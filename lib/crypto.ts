import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCb);
export async function verifyAccessCode(
  code: string,
  encoded: string,
  deploymentSecret: string,
) {
  // Format: scrypt$<salt-hex>$<digest-hex>. The deployment secret is mixed into the input.
  const parts = encoded.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expected] = parts;
  if (!/^[a-f0-9]{32,128}$/i.test(salt) || !/^[a-f0-9]{128}$/i.test(expected))
    return false;
  const actual = (await scrypt(
    `${deploymentSecret}:${code}`,
    Buffer.from(salt, "hex"),
    64,
  )) as Buffer;
  const target = Buffer.from(expected, "hex");
  return actual.length === target.length && timingSafeEqual(actual, target);
}
export function signAdminSession(
  identity: string,
  secret: string,
  issuedAt = Date.now(),
) {
  const payload = `${identity}|${issuedAt}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}
export function verifyAdminSession(
  token: string,
  identity: string,
  secret: string,
  maxAgeMs = 8 * 60 * 60 * 1000,
) {
  try {
    const raw = Buffer.from(token, "base64url").toString();
    const [email, ts, sig] = raw.split("|");
    if (email !== identity || !ts || !sig) return false;
    const issued = Number(ts);
    if (
      !Number.isFinite(issued) ||
      Date.now() - issued > maxAgeMs ||
      issued > Date.now() + 60_000
    )
      return false;
    const expected = createHmac("sha256", secret)
      .update(`${email}|${ts}`)
      .digest("hex");
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
export function newSalt() {
  return randomBytes(16).toString("hex");
}
