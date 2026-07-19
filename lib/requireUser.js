import { verifyExternalToken } from "@/lib/jwt";

/**
 * Shared guard for customer-facing (non-admin) routes that handle personal
 * data. Reads the bearer token external frontends (e.g. ptar_elearning)
 * attach on every request and returns the verified identity, or null.
 * Callers must derive `userId` from this — never from a client-supplied
 * query/body param — and respond 401 when this returns null.
 */
export function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return null;

  const verification = verifyExternalToken(token);
  if (!verification.valid) return null;

  return verification.data; // { userId, email, name, role, lineId, iat }
}
