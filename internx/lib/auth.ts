import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import dbConnect from '@/lib/mongodb'
import MongoUser from '@/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const inputIdent = credentials.email.trim()
                const normIdent = inputIdent.toLowerCase()
                const rawPassword = typeof credentials.password === 'string' ? credentials.password : ''
                const password = rawPassword

                // 1. Master Admin — ONLY from environment variables (fail closed).
                //    No hardcoded email/password pairs are accepted anymore.
                const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase()
                const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
                if (
                    ADMIN_EMAIL && ADMIN_PASSWORD &&
                    normIdent === ADMIN_EMAIL &&
                    password === ADMIN_PASSWORD
                ) {
                    return {
                        id: 'admin-id',
                        email: normIdent,
                        name: 'internX Administrator',
                        role: 'admin'
                    }
                }

                // 2. Check MongoDB Exam Users
                try {
                    await dbConnect()
                    const mUser = await MongoUser.findOne({
                        $or: [
                            { email: normIdent },
                            { rollNo: inputIdent },
                            { mobile: inputIdent }
                        ]
                    })

                    if (mUser && mUser.password) {
                        // Strict bcrypt verification only. The former universal
                        // backdoors ('password123', 'admin123', phone-as-password)
                        // and plaintext comparison have been removed.
                        const isMatch = await bcrypt.compare(password, mUser.password)
                        if (isMatch) {
                            return {
                                id: (mUser._id as any).toString(),
                                email: mUser.email,
                                name: mUser.fullName || 'Exam Candidate',
                                role: mUser.role as 'student' | 'admin'
                            }
                        }
                    }
                } catch (mongoErr) {
                    console.warn('NextAuth MongoDB check deferred:', (mongoErr as any)?.message)
                }

                // 3. Check Prisma PostgreSQL (Users & Registrations)
                try {
                    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
                        const dbUser = await prisma.user.findFirst({
                            where: {
                                OR: [
                                    { email: normIdent },
                                    { phone: inputIdent }
                                ]
                            }
                        })

                        if (dbUser && dbUser.password) {
                            // Strict bcrypt verification only. The former universal
                            // backdoors ('password123', phone-as-password) and the
                            // plaintext comparison have been removed.
                            const matches = await bcrypt.compare(password, dbUser.password)

                            if (matches) {
                                // Ensure user exists in MongoDB with an ObjectId for seamless exam attempts
                                let mongoUserId = dbUser.id
                                try {
                                    await dbConnect()
                                    let syncUser = await MongoUser.findOne({ email: dbUser.email.toLowerCase() })
                                    if (!syncUser) {
                                        syncUser = await MongoUser.create({
                                            email: dbUser.email.toLowerCase(),
                                            fullName: dbUser.name,
                                            role: dbUser.role || 'student',
                                            mobile: dbUser.phone || '',
                                            college: dbUser.college || '',
                                            department: dbUser.department || '',
                                            rollNo: inputIdent
                                        })
                                    }
                                    if (syncUser) {
                                        mongoUserId = syncUser._id.toString()
                                    }
                                } catch {}

                                return {
                                    id: mongoUserId,
                                    email: dbUser.email,
                                    name: dbUser.name || 'Student Candidate',
                                    role: dbUser.role as 'student' | 'admin'
                                }
                            }
                        }

                        // Check StudentRegistration
                        const reg = await prisma.studentRegistration.findFirst({
                            where: {
                                OR: [
                                    { email: normIdent },
                                    { whatsappNumber: inputIdent }
                                ]
                            }
                        })

                        if (reg) {
                            let mongoUserId = reg.id
                            try {
                                await dbConnect()
                                let syncUser = await MongoUser.findOne({ email: reg.email.toLowerCase() })
                                if (!syncUser) {
                                    syncUser = await MongoUser.create({
                                        email: reg.email.toLowerCase(),
                                        fullName: reg.name,
                                        role: 'student',
                                        mobile: reg.whatsappNumber || '',
                                        college: reg.collegeName || '',
                                        department: reg.department || '',
                                        rollNo: inputIdent
                                    })
                                }
                                if (syncUser) mongoUserId = syncUser._id.toString()
                            } catch {}

                            return {
                                id: mongoUserId,
                                email: reg.email,
                                name: reg.name,
                                role: 'student'
                            }
                        }
                    }
                } catch (prismaErr) {
                    console.warn('NextAuth Prisma check deferred:', (prismaErr as any)?.message)
                }

                // 4. Demo Candidate Shortcut — DISABLED unless explicitly enabled.
                //    Set ALLOW_DEMO_LOGIN=true in a local/dev environment only.
                if (
                    process.env.ALLOW_DEMO_LOGIN === 'true' &&
                    (normIdent === 'student@example.com' || normIdent === '26cs101' || normIdent === 'demo') &&
                    (password === 'password123' || password === 'admin123')
                ) {
                    let mongoId = '6ae3a44293aeaa5a4ff92eac'
                    try {
                        await dbConnect()
                        const mDemo = await MongoUser.findOne({ email: 'student@example.com' })
                        if (mDemo) mongoId = mDemo._id.toString()
                    } catch {}

                    return {
                        id: mongoId,
                        email: 'student@example.com',
                        name: 'Demo Exam Candidate',
                        role: 'student'
                    }
                }

                return null
            }
        })
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Exam routes strictly stay in /exam ecosystem
            if (url.includes('/exam')) {
                if (url.startsWith('/')) return `${baseUrl}${url}`
                if (new URL(url).origin === baseUrl) return url
                return `${baseUrl}/exam/onboarding`
            }
            // Admin routes
            if (url.includes('/admin') && !url.includes('/exam')) {
                if (url.startsWith('/')) return `${baseUrl}${url}`
                if (new URL(url).origin === baseUrl) return url
                return `${baseUrl}/admin`
            }
            if (url.startsWith('/')) return `${baseUrl}${url}`
            if (new URL(url).origin === baseUrl) return url
            return `${baseUrl}/dashboard`
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role || 'student'
            }

            if (account?.provider === 'google' && user?.email) {
                try {
                    const normEmail = user.email.toLowerCase().trim()
                    const existingUser = await prisma.user.findUnique({
                        where: { email: normEmail }
                    })

                    if (existingUser) {
                        token.id = existingUser.id
                        token.role = existingUser.role
                    } else {
                        const newUser = await prisma.user.create({
                            data: {
                                email: normEmail,
                                name: user.name || 'Google Student',
                                password: '',
                                role: 'student',
                            }
                        })
                        token.id = newUser.id
                        token.role = 'student'
                    }
                } catch (err) {
                    console.warn('Prisma sync deferred during Google signin:', (err as any)?.message)
                    token.id = user.id || user.email
                    token.role = 'student'
                }
            }
            return token
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role || 'student'
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt'
    },
    // Fail closed in production: never fall back to a guessable secret.
    secret: process.env.NEXTAUTH_SECRET ||
        (process.env.NODE_ENV === 'production'
            ? (() => { throw new Error('NEXTAUTH_SECRET is not set. Refusing to run in production without it.') })()
            : 'dev-only-insecure-nextauth-secret')
}
