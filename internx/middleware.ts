import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  // Use a simple wildcard to avoid complex regex failures in Edge Runtime
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    
    // Ignore static assets manually to be safe
    if (
      pathname.includes('.') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api')
    ) {
      return NextResponse.next()
    }

    const hasToken = request.cookies.has('auth_token')

    const isPublicRoute = [
      '/', 
      '/login', 
      '/signup', 
      '/payment',
      '/forgot-password',
      '/favicon.ico'
    ].includes(pathname) || 
    pathname.startsWith('/auth/callback')

    if (!hasToken && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (hasToken && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.next()
  }
}
