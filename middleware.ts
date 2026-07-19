import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next()
  }

  // secureCookie must be explicit here — on HTTPS prod NextAuth stores the
  // session under `__Secure-next-auth.session-token` instead of
  // `next-auth.session-token`, and getToken()'s auto-detection of which
  // cookie name to read can fail in the Edge middleware runtime behind a
  // proxy (Vercel), silently returning null even for a valid session.
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })
  const role = (token as any)?.role

  if (!token || role !== "ADMIN") {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
