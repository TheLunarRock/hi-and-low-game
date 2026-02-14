import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for messenger auth routing.
 * Checks for a lightweight auth cookie flag (set by client on login/logout).
 * This is NOT a security measure — actual auth is verified client-side.
 * Purpose: avoid loading 161KB of JS just to show "login required".
 */

const PUBLIC_PATHS = ['/m/login', '/m/signup', '/m/add', '/m/group/invite']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply to /m routes
  if (!pathname.startsWith('/m')) return NextResponse.next()

  // Skip public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check auth cookie flag
  const hasAuth = request.cookies.get('sb-auth-status')?.value === '1'

  if (!hasAuth) {
    const loginUrl = new URL('/m/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/m/:path*'],
}
