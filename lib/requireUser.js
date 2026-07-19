import { verifyExternalToken } from "@/lib/jwt";

/**
 * Shared guard for customer-facing (non-admin) routes that handle personal
 * data. Reads the bearer token external frontends (e.g. ptar_elearning)
 * attach on every request and returns the verified identity, or null.
 * Callers must derive `userId` from this — never from a client-supplied
 * query/body param — and respond 401 when this returns null.
 *
 * Falls back to the httpOnly `jwt` cookie when there's no Authorization
 * header — covers requests where localStorage (and so the bearer token)
 * was cleared but the cookie survived, e.g. private browsing.
 */
export function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token =
    (authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null) ||
    request.cookies?.get?.("jwt")?.value ||
    null;
  if (!token) return null;

  const verification = verifyExternalToken(token);
  if (!verification.valid) return null;

  return verification.data; // { userId, email, name, role, lineId, iat }
}
