'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Layout from '@/components/Layout'
import { noticeAPI, deadlineAPI } from '@/lib/api'
import { format } from 'date-fns'
import Link from 'next/link'
import { FiFileText, FiCalendar, FiTag, FiDownload, FiQrCode } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function NoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState('All')

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (currentUser.role === 'admin') {
      router.push('/admin/notices')
      return
    }

    fetchNotices()
  }, [router, selectedDepartment])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedDepartment !== 'All') {
        params.department = selectedDepartment
      }
      const response = await noticeAPI.getAll(params)
      setNotices(response.data)
    } catch (error: any) {
      toast.error('Failed to load notices')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading notices...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notices & Circulars</h1>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
            <p className="mt-1 text-sm text-gray-500">No notices available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{notice.title}</h2>
                    {notice.summary && (
                      <p className="text-gray-600 mb-3">{notice.summary}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {notice.tags && notice.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <FiTag className="mr-1 h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                      {notice.department && notice.department !== 'All' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {notice.department}
                        </span>
                      )}
                    </div>
                  </div>
                  {notice.qrCodeUrl && (
                    <div className="ml-4">
                      <img src={notice.qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                    </div>
                  )}
                </div>

                {notice.deadlines && notice.deadlines.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Deadlines:</h3>
                    <div className="space-y-2">
                      {notice.deadlines.map((deadline: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="font-medium">{deadline.title}</span>
                            <span className="ml-2 text-sm text-gray-600">
                              - {format(new Date(deadline.date), 'PPp')}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const date = new Date(deadline.date)
                              const startDate = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                              const endDate = new Date(date.getTime() + 60 * 60 * 1000)
                                .toISOString()
                                .replace(/[-:]/g, '')
                                .split('.')[0] + 'Z'
                              const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                                deadline.title
                              )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(deadline.notes || '')}&location=College`
                              window.open(calendarUrl, '_blank')
                              toast.success('Opening Google Calendar...')
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Add to Calendar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${notice.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FiDownload className="mr-1 h-4 w-4" />
                      Download PDF
                    </a>
                    {notice.publicUrl && (
                      <Link
                        href={`/notices/${notice._id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {notice.createdAt ? format(new Date(notice.createdAt), 'PPp') : 'Unknown date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

