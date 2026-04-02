import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'IELTS Mentor - AI-Powered IELTS Preparation',
  description: 'Prepare for IELTS with AI-powered practice tests, instant feedback, and performance analytics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              borderRadius: '0.75rem',
              border: '1px solid #f1f5f9',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
              fontSize: '14px',
              padding: '12px 16px',
            },
          }} />
        </AuthProvider>
      </body>
    </html>
  )
}
