'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getUser, logout } from '@/lib/auth'
import { User } from '@/lib/auth'
import NotificationBell from './NotificationBell'
import Logo from './Logo'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUserState] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push('/login')
    } else {
      setUserState(currentUser)
    }
  }, [router])

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="min-h-screen bg-soft-silver">
      <nav className="bg-white shadow-soft border-b border-soft-silver sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link 
                href={isAdmin ? '/admin/complaints' : '/dashboard'} 
                className="flex items-center space-x-3 group"
              >
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <Logo size={45} />
                </div>
                <div>
                  <h1 className="text-lg font-heading font-bold text-charcoal">College Portal</h1>
                  <p className="text-xs text-deep-gray font-ui">Smart Information System</p>
                </div>
              </Link>
              <div className="hidden lg:flex items-center space-x-1 ml-8">
                {/* Show Chat and Complaints only for students */}
                {!isAdmin && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/dashboard'
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      AI Assistant
                    </Link>
                    <Link
                      href="/notices"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/notices' || pathname?.startsWith('/notices/')
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Notices
                    </Link>
                    <Link
                      href="/deadlines"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/deadlines'
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Deadlines
                    </Link>
                    <Link
                      href="/complaints"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/complaints'
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Complaint Box
                    </Link>
                  </>
                )}
                {/* Show Admin Dashboard and Documents only for admins */}
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/complaints"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/admin/complaints'
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Complaints
                    </Link>
                    <Link
                      href="/admin/notices"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/admin/notices' || pathname?.startsWith('/admin/notices')
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Notices
                    </Link>
                    <Link
                      href="/admin/deadlines"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/admin/deadlines'
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Deadlines
                    </Link>
                    <Link
                      href="/admin/documents"
                      className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-300 ${
                        pathname === '/admin/documents'
                          ? 'bg-brand-red text-white shadow-soft'
                          : 'text-charcoal hover:bg-soft-silver'
                      }`}
                    >
                      Documents
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isAdmin && <NotificationBell />}
              <span className="text-sm text-charcoal font-ui font-medium">
                {user.name} <span className="text-deep-gray">({user.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-ui font-medium text-brand-red hover:bg-red-50 rounded-lg transition-all duration-300 hover:shadow-soft"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

