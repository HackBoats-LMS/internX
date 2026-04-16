import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_1234567890_change_me'
)
const COOKIE_NAME = 'auth_token'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      const email = user.email?.toLowerCase()
      const fullName = user.user_metadata.full_name || user.user_metadata.name

      // Sync with public.users table (Using the admin-like bypass or just service role if configured)
      // Since we are in a server route, we can check if user exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      let finalUserId = existingUser?.id

      if (!existingUser) {
        // Create new user in public.users
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ 
            email, 
            full_name: fullName,
            payment_status: 'unpaid'
          }])
          .select()
          .single()
        
        if (insertError) {
           return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(insertError.message)}`)
        }
        finalUserId = newUser.id
      }

      // Create Session JWT
      const token = await new SignJWT({ userId: finalUserId, email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)

      // Determine redirect path
      let redirectPath = next
      if (!existingUser || existingUser.payment_status !== 'paid') {
        redirectPath = '/payment'
      }

      // Set Cookie
      const response = NextResponse.redirect(`${origin}${redirectPath}`)
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}
