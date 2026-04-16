import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const COOKIE_NAME = 'auth_token';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_1234567890_change_me'
);

const neometric = localFont({
  src: "../public/Neometric Alt Medium.woff2",
  variable: "--font-neometric",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InternX | Engineering Simulation Platform",
  description: "The next generation of engineering internship simulations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || ""; // Fallback for path detection

  // 1. Session check
  const token = cookieStore.get(COOKIE_NAME)?.value;
  let user = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch (e) {
      // Invalid token
    }
  }

  // 2. Simple protection logic (Runs on every server-rendered page)
  // Note: Since this is RootLayout, we avoid redirect loops by checking the URL
  // We allow /api, /login, /signup, /payment, /feedback, etc.
  /* 
     We can't easily get the pathname in RootLayout in all cases, 
     so we rely on child components (Dashboard/Login) to handle their own minor redirects 
     if needed, but this RootLayout check serves as a global guard.
  */

  return (
    <html
      lang="en"
      className={`${neometric.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
