'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_1234567890_change_me'
)

const COOKIE_NAME = 'auth_token'

async function createSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

// 1. SIGNUP ACTION
export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password) {
    redirect('/signup?message=Email and password are required')
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  // Insert into public.users
  const { data: newUser, error } = await supabase
    .from('users')
    .insert([{ 
      email, 
      password_hash: passwordHash, 
      full_name: name 
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
       redirect('/signup?message=User already exists with this email')
    }
    redirect('/signup?message=' + error.message)
  }

  // Create JWT session
  await createSession(newUser.id, newUser.email)

  revalidatePath('/', 'layout')
  redirect('/payment')
}

// 2. LOGIN ACTION
export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  // Fetch user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    redirect('/login?message=Invalid email or password')
  }

  // Compare Password
  if (!user.password_hash) {
    redirect('/login?message=This email is registered with Google. Please use Google Login.')
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    redirect('/login?message=Invalid email or password')
  }

  // Create JWT session
  await createSession(user.id, user.email)

  revalidatePath('/', 'layout')
  
  if (user.payment_status === 'paid') {
    redirect('/dashboard')
  } else {
    redirect('/payment')
  }
}

// 3. LOGOUT ACTION
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/login')
}

// 4. GOOGLE OAUTH ACTION
export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?message=' + error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// 4. REQUEST OTP (FORGOT PASSWORD)
export async function requestOTP(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) redirect('/login?message=Email is required')

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  const { error } = await supabase
    .from('users')
    .update({ 
      otp_code: otp, 
      otp_expiry: expiry.toISOString() 
    })
    .eq('email', email)

  if (error) {
    redirect('/login?message=Could not process request')
  }

  // NOTE: This is where you would send the email.
  // Using console.log as a mock since no email provider is set yet.
  console.log(`[AUTH] OTP for ${email}: ${otp}`)
  
  // In production, use: 
  // await sendEmail({ to: email, subject: 'Your OTP', text: `Code: ${otp}` })

  redirect(`/forgot-password/verify?email=${email}&message=OTP sent to your email!`)
}

// 5. VERIFY OTP AND RESET PASSWORD
export async function resetPasswordWithOTP(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const otp = formData.get('otp') as string
  const newPassword = formData.get('password') as string

  // Find user and check OTP
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user || user.otp_code !== otp) {
    redirect(`/forgot-password/verify?email=${email}&message=Invalid or expired OTP`)
  }

  // Check Expiry
  if (new Date(user.otp_expiry) < new Date()) {
    redirect(`/forgot-password/verify?email=${email}&message=OTP has expired`)
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(newPassword, salt)

  // Update password and clear OTP
  await supabase
    .from('users')
    .update({ 
      password_hash: passwordHash, 
      otp_code: null, 
      otp_expiry: null 
    })
    .eq('email', email)

  redirect('/login?message=Password reset successful! Please log in.')
}

// 6. HELPER: GET SESSION (Used in components)
export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string, email: string }
  } catch {
    return null
  }
}
