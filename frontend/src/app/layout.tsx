import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IELTS Mentor - AI-Powered IELTS Preparation',
  description: 'Prepare for IELTS with AI-powered practice tests, instant feedback, and performance analytics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#1e293b', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
          }} />
        </AuthProvider>
      </body>
    </html>
  )
}
