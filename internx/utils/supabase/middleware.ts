import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_1234567890_change_me'
)

const COOKIE_NAME = 'auth_token'

export async function updateSession(request: NextRequest) {
  let user = null

  // Verify custom JWT token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      user = payload
    } catch (e) {
      // Token invalid or expired
    }
  }

  const path = request.nextUrl.pathname
  const isPublicRoute = ['/', '/login', '/signup', '/payment'].includes(path) || 
                       path.startsWith('/api') || 
                       path.startsWith('/_next') || 
                       path.startsWith('/favicon.ico') ||
                       path.startsWith('/forgot-password') ||
                       path.startsWith('/auth/callback')

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If a logged-in user hits /login or /signup, redirect them to dashboard
  if (user && (path === '/login' || path === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
