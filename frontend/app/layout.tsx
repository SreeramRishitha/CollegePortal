import type { Metadata } from 'next'
import { Poppins, Inter, Roboto } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Smart College Information & Assistance System',
  description: 'AI-powered college information and complaint management portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} ${roboto.variable} font-body`}>
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#111111',
              border: '1px solid #E6E6E6',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            },
            success: {
              iconTheme: {
                primary: '#1DB954',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#8A1E1E',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

