import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Shared guard for /api/admin/** routes. Returns the session when the
 * caller is a real, logged-in ADMIN; otherwise null. Callers respond with
 * 401 when this returns null.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}
