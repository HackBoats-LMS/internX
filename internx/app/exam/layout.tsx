import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InternX Exam Platform',
  description: 'InternX online examination and evaluation platform',
}

export default function ExamLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={inter.className}>
      <Providers>
        {children}
        <Toaster richColors position="top-right" />
      </Providers>
    </div>
  )
}
