import { scryptSync, randomBytes } from "node:crypto";
const code = process.argv[2];
if (!code || code.length < 16) {
  console.error(
    'Usage: node scripts/hash-admin-code.mjs "a-long-random-code-at-least-16-chars"',
  );
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const deploymentSecret = process.env.ADMIN_DEPLOYMENT_SECRET;
if (!deploymentSecret) {
  console.error("Set ADMIN_DEPLOYMENT_SECRET before generating the hash.");
  process.exit(1);
}
const digest = scryptSync(
  `${deploymentSecret}:${code}`,
  Buffer.from(salt, "hex"),
  64,
).toString("hex");
console.log(`scrypt$${salt}$${digest}`);
