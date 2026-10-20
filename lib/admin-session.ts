import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/crypto";
export async function isAdminSessionValid() {
  const identity = process.env.ADMIN_IDENTITY;
  const secret = process.env.ADMIN_DEPLOYMENT_SECRET;
  if (!identity || !secret) return false;
  const jar = await cookies();
  const token = jar.get("tsa_admin_session")?.value;
  return !!token && verifyAdminSession(token, identity, secret);
}
