'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import AIChatWidget from '@/components/AIChatWidget'
import { noticeAPI, deadlineAPI } from '@/lib/api'
import { format } from 'date-fns'
import { 
  FiSearch, 
  FiMic, 
  FiBell, 
  FiFileText, 
  FiCalendar, 
  FiMessageCircle, 
  FiEdit3, 
  FiUsers, 
  FiBook,
  FiDownload,
  FiChevronRight,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiX,
  FiZap
} from 'react-icons/fi'
import { HiQrCode } from 'react-icons/hi2'
import { BsStars } from 'react-icons/bs'
import toast from 'react-hot-toast'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [recentNotices, setRecentNotices] = useState<any[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [insights, setInsights] = useState({
    noticesToday: 0,
    totalDeadlines: 0,
    resolvedComplaints: 0,
    activeQuestions: 0,
  })
  const [loading, setLoading] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === 'admin') {
          router.push('/admin/complaints')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } else {
      // For public homepage, fetch data for preview
      fetchHomeData()
    }
  }, [router])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        // For public users, we can still show some data or use mock data
        setLoading(false)
        return
      }
      
      // Fetch recent notices
      const noticesRes = await noticeAPI.getAll()
      const notices = noticesRes.data.slice(0, 6)
      setRecentNotices(notices)
      
      // Fetch upcoming deadlines
      const deadlinesRes = await deadlineAPI.getAll()
      const deadlines = deadlinesRes.data
        .filter((d: any) => new Date(d.date) >= new Date())
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)
      setUpcomingDeadlines(deadlines)
      
      // Calculate insights
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const noticesToday = notices.filter((n: any) => {
        const noticeDate = new Date(n.createdAt)
        noticeDate.setHours(0, 0, 0, 0)
        return noticeDate.getTime() === today.getTime()
      }).length
      
      setInsights({
        noticesToday,
        totalDeadlines: deadlines.length,
        resolvedComplaints: 0, // Would need API call
        activeQuestions: 0, // Would need API call
      })
    } catch (error) {
      console.error('Failed to fetch home data:', error)
      // Don't show error to public users
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/notices?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const quickAccessTiles = [
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: 'Notices & Circulars',
      description: 'View all college notices',
      link: '/notices',
      color: 'bg-brand-red',
      hoverColor: 'hover:bg-red-800',
    },
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: 'Upcoming Deadlines',
      description: 'Track important dates',
      link: '/deadlines',
      color: 'bg-electric-blue',
      hoverColor: 'hover:bg-blue-700',
    },
    {
      icon: <FiMessageCircle className="w-8 h-8" />,
      title: 'Ask the AI Assistant',
      description: 'Get instant answers',
      link: '/dashboard',
      color: 'bg-electric-blue',
      hoverColor: 'hover:bg-blue-700',
    },
    {
      icon: <FiEdit3 className="w-8 h-8" />,
      title: 'Submit a Complaint',
      description: 'Report issues',
      link: '/complaints',
      color: 'bg-alert-orange',
      hoverColor: 'hover:bg-orange-600',
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Faculty Directory',
      description: 'Find faculty members',
      link: '#',
      color: 'bg-deep-gray',
      hoverColor: 'hover:bg-gray-700',
    },
    {
      icon: <FiBook className="w-8 h-8" />,
      title: 'Syllabus & Academic Info',
      description: 'Academic resources',
      link: '#',
      color: 'bg-success-green',
      hoverColor: 'hover:bg-green-600',
    },
  ]

  const getDeadlineColor = (deadline: any) => {
    const daysUntil = Math.ceil((new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 3) return 'text-alert-orange bg-orange-50 border-alert-orange'
    if (daysUntil <= 7) return 'text-electric-blue bg-blue-50 border-electric-blue'
    return 'text-success-green bg-green-50 border-success-green'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-soft border-b border-soft-silver sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <Logo size={50} />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-charcoal">College Portal</h1>
                  <p className="text-xs text-deep-gray font-ui">Smart College Information & Assistance System</p>
                </div>
              </Link>
              <div className="hidden lg:flex items-center space-x-1 ml-8">
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg text-sm font-ui font-medium text-brand-red bg-red-50 transition-all duration-300 hover:bg-brand-red hover:text-white"
                >
                  Home
                </Link>
                <Link 
                  href="/notices" 
                  className="px-4 py-2 rounded-lg text-sm font-ui font-medium text-charcoal hover:bg-soft-silver transition-all duration-300"
                >
                  Notices
                </Link>
                <Link 
                  href="/deadlines" 
                  className="px-4 py-2 rounded-lg text-sm font-ui font-medium text-charcoal hover:bg-soft-silver transition-all duration-300"
                >
                  Deadlines
                </Link>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-ui font-medium text-charcoal hover:bg-soft-silver transition-all duration-300"
                >
                  AI Assistant
                </Link>
                <Link 
                  href="/complaints" 
                  className="px-4 py-2 rounded-lg text-sm font-ui font-medium text-charcoal hover:bg-soft-silver transition-all duration-300"
                >
                  Complaint Box
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
              >
                <FiUserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-red via-red-800 to-charcoal text-white py-24 overflow-hidden">
        {/* Logo Pattern Background */}
        <div className="absolute inset-0 logo-pattern opacity-10"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in leading-tight">
              Ask Anything About Your College
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90 font-body">
              Notices, Deadlines, Syllabus, Exams, Faculty Info...
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto mb-6">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl p-2 border-2 border-white/20">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Notices, Deadlines, Syllabus, Faculty Info..."
                  className="flex-1 px-6 py-5 text-charcoal placeholder-deep-gray focus:outline-none rounded-xl text-lg font-body"
                />
                <button
                  type="button"
                  className="p-4 text-deep-gray hover:text-electric-blue transition-all duration-300 hover:scale-110 mx-2"
                  aria-label="Voice input"
                  onClick={() => toast('Voice input coming soon!')}
                >
                  <FiMic className="w-6 h-6" />
                </button>
                <button
                  type="submit"
                  className="btn-ai flex items-center space-x-2 px-8 py-5 rounded-xl"
                >
                  <FiSearch className="w-5 h-5" />
                  <span className="font-ui font-medium">Search</span>
                </button>
              </div>
            </form>
            <p className="text-sm text-white/80 flex items-center justify-center space-x-2 font-body">
              <BsStars className="w-4 h-4 animate-pulse" />
              <span>Powered by AI. Backed by official college data.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Quick Access Tiles */}
      <section className="py-16 bg-soft-silver">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-heading font-bold text-charcoal mb-12 text-center">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {quickAccessTiles.map((tile, idx) => (
              <Link
                key={idx}
                href={tile.link}
                className="card text-center group hover:scale-105 transition-all duration-300"
              >
                <div className={`${tile.color} ${tile.hoverColor} text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {tile.icon}
                </div>
                <h4 className="font-heading font-semibold text-charcoal mb-2 text-sm">{tile.title}</h4>
                <p className="text-xs text-deep-gray font-body">{tile.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Notices & Deadlines Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Notices */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-heading font-bold text-charcoal">Recent Notices</h3>
                <Link href="/notices" className="text-brand-red hover:underline font-ui text-sm flex items-center group">
                  View All <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {loading ? (
                <div className="card text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
                  <p className="text-deep-gray mt-4 font-body">Loading notices...</p>
                </div>
              ) : recentNotices.length === 0 ? (
                <div className="card text-center py-12">
                  <FiFileText className="w-16 h-16 text-deep-gray mx-auto mb-4 opacity-50" />
                  <p className="text-deep-gray font-body">No notices available</p>
                  <p className="text-sm text-deep-gray mt-2 font-body">Check back later for updates</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotices.map((notice, idx) => (
                    <div 
                      key={notice._id} 
                      className="card border-l-4 border-brand-red hover:border-l-8 transition-all duration-300 hover:shadow-lift group animate-slide-up"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-heading font-semibold text-charcoal flex-1 group-hover:text-brand-red transition-colors">{notice.title}</h4>
                        {notice.fileUrl && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${notice.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-red hover:text-red-700 ml-2 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiDownload className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                      {notice.department && (
                        <span className="inline-block px-3 py-1 bg-soft-silver text-deep-gray text-xs rounded-full mb-2 font-ui">
                          {notice.department}
                        </span>
                      )}
                      <p className="text-sm text-deep-gray mb-3 font-body">
                        {notice.createdAt ? format(new Date(notice.createdAt), 'PPp') : 'Unknown date'}
                      </p>
                      <Link
                        href={`/notices/${notice._id}`}
                        className="text-brand-red hover:underline text-sm font-ui flex items-center group/link"
                      >
                        View Details <FiChevronRight className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-heading font-bold text-charcoal">Upcoming Deadlines</h3>
                <Link href="/deadlines" className="text-brand-red hover:underline font-ui text-sm flex items-center group">
                  View All <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {loading ? (
                <div className="card text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto"></div>
                  <p className="text-deep-gray mt-4 font-body">Loading deadlines...</p>
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <div className="card text-center py-12">
                  <FiCalendar className="w-16 h-16 text-deep-gray mx-auto mb-4 opacity-50" />
                  <p className="text-deep-gray font-body">No upcoming deadlines</p>
                  <p className="text-sm text-deep-gray mt-2 font-body">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline, idx) => {
                    const daysUntil = Math.ceil((new Date(deadline.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div
                        key={deadline._id}
                        className={`card border-l-4 ${getDeadlineColor(deadline)} hover:shadow-lift transition-all duration-300 animate-slide-up`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <FiClock className="w-4 h-4" />
                              <h4 className="font-heading font-semibold text-charcoal">{deadline.title}</h4>
                            </div>
                            <p className="text-sm text-deep-gray font-body">
                              {format(new Date(deadline.date), 'PPp')}
                            </p>
                            {daysUntil > 0 && (
                              <p className="text-xs mt-2 font-ui font-medium">
                                {daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days remaining`}
                              </p>
                            )}
                          </div>
                          {daysUntil <= 3 && (
                            <FiAlertCircle className="w-5 h-5 text-alert-orange flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QR Scanner Banner */}
      <section className="py-12 bg-gradient-to-r from-electric-blue via-blue-600 to-electric-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <HiQrCode className="w-16 h-16" />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold mb-2">Scan Campus QR Codes</h3>
                <p className="text-base opacity-90 font-body">View Authentic Notices Instantly</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowQRScanner(true)
                toast('QR Scanner feature coming soon!')
              }}
              className="bg-white text-electric-blue px-8 py-4 rounded-xl font-ui font-medium hover:bg-soft-silver transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <HiQrCode className="w-5 h-5" />
              <span>Scan Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* Insights / Analytics Section */}
      <section className="py-16 bg-soft-silver">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-heading font-bold text-charcoal mb-12 text-center">
            Platform Insights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiFileText className="w-8 h-8 text-brand-red" />
              </div>
              <div className="text-4xl font-heading font-bold text-charcoal mb-2">
                {insights.noticesToday}
              </div>
              <p className="text-sm text-deep-gray font-body">Notices Added Today</p>
            </div>
            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-8 h-8 text-electric-blue" />
              </div>
              <div className="text-4xl font-heading font-bold text-charcoal mb-2">
                {insights.totalDeadlines}
              </div>
              <p className="text-sm text-deep-gray font-body">Upcoming Deadlines</p>
            </div>
            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-success-green" />
              </div>
              <div className="text-4xl font-heading font-bold text-charcoal mb-2">
                {insights.resolvedComplaints}
              </div>
              <p className="text-sm text-deep-gray font-body">Complaints Resolved</p>
            </div>
            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-alert-orange" />
              </div>
              <div className="text-4xl font-heading font-bold text-charcoal mb-2">
                {insights.activeQuestions}
              </div>
              <p className="text-sm text-deep-gray font-body">Active Questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Announcements */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-r from-brand-red/10 via-electric-blue/10 to-brand-red/10 border-2 border-brand-red/20 hover:shadow-lift transition-all duration-300">
              <div className="flex items-start space-x-6">
                <div className="bg-brand-red text-white rounded-2xl p-4 flex-shrink-0 shadow-lg">
                  <FiBell className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-charcoal mb-3 text-xl">Welcome to Smart College Portal</h4>
                  <p className="text-deep-gray font-body leading-relaxed">
                    This platform aims to simplify communication between students, faculty, and administration. 
                    Get instant access to notices, deadlines, and AI-powered assistance for all your college-related queries.
                  </p>
                  <div className="mt-4 flex items-center space-x-2 text-sm text-deep-gray font-body">
                    <FiZap className="w-4 h-4 text-electric-blue" />
                    <span>Powered by advanced AI technology</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-16 relative overflow-hidden">
        {/* Logo pattern background with low opacity */}
        <div className="absolute inset-0 logo-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Logo size={45} />
                <div>
                  <h4 className="font-heading font-bold text-lg">College Portal</h4>
                  <p className="text-xs text-soft-silver font-ui">Smart Information System</p>
                </div>
              </div>
              <p className="text-sm text-soft-silver font-body leading-relaxed">
                AI-powered platform for seamless college communication and information access.
              </p>
            </div>
            <div>
              <h5 className="font-heading font-semibold mb-4 text-lg">Quick Links</h5>
              <ul className="space-y-3 text-sm text-soft-silver font-body">
                <li>
                  <Link href="/notices" className="hover:text-white transition-colors duration-300 flex items-center group">
                    <FiChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Notices
                  </Link>
                </li>
                <li>
                  <Link href="/deadlines" className="hover:text-white transition-colors duration-300 flex items-center group">
                    <FiChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Deadlines
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors duration-300 flex items-center group">
                    <FiChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    AI Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/complaints" className="hover:text-white transition-colors duration-300 flex items-center group">
                    <FiChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Complaints
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-heading font-semibold mb-4 text-lg">Support</h5>
              <ul className="space-y-3 text-sm text-soft-silver font-body">
                <li>
                  <Link href="#" className="hover:text-white transition-colors duration-300">Contact Us</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors duration-300">Help Center</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors duration-300">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-heading font-semibold mb-4 text-lg">Connect</h5>
              <p className="text-sm text-soft-silver font-body leading-relaxed mb-4">
                Stay updated with the latest college information and announcements.
              </p>
              <div className="flex items-center space-x-2 text-sm text-soft-silver">
                <BsStars className="w-4 h-4 text-electric-blue" />
                <span>AI-Powered Platform</span>
              </div>
            </div>
          </div>
          <div className="border-t border-deep-gray pt-8 text-center text-sm text-soft-silver font-body">
            <p>&copy; {new Date().getFullYear()} College Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  )
}
