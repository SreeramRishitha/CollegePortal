'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Layout from '@/components/Layout'
import { deadlineAPI } from '@/lib/api'
import { format, differenceInDays } from 'date-fns'
import { FiCalendar, FiClock, FiDownload } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function DeadlinesPage() {
  const router = useRouter()
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (currentUser.role === 'admin') {
      router.push('/admin/deadlines')
      return
    }

    fetchDeadlines()
  }, [router, selectedType])

  const fetchDeadlines = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedType) {
        params.type = selectedType
      }
      const response = await deadlineAPI.getAll(params)
      setDeadlines(response.data)
    } catch (error: any) {
      toast.error('Failed to load deadlines')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCalendar = async (deadline: any) => {
    try {
      const response = await deadlineAPI.getCalendarLink(deadline._id)
      window.open(response.data.url, '_blank')
      toast.success('Opening Google Calendar...')
    } catch (error) {
      toast.error('Failed to open calendar')
    }
  }

  const handleDownloadICS = async (deadline: any) => {
    try {
      const response = await deadlineAPI.getICS(deadline._id)
      const blob = new Blob([response.data], { type: 'text/calendar' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deadline-${deadline._id}.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Calendar file downloaded')
    } catch (error) {
      toast.error('Failed to download calendar file')
    }
  }

  const getDaysUntil = (date: Date) => {
    const days = differenceInDays(new Date(date), new Date())
    if (days < 0) return 'Past'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `${days} days`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading deadlines...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Deadlines</h1>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="fee">Fee</option>
            <option value="exam">Exam</option>
            <option value="hostel">Hostel</option>
            <option value="form">Form</option>
            <option value="other">Other</option>
          </select>
        </div>

        {deadlines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deadlines</h3>
            <p className="mt-1 text-sm text-gray-500">No upcoming deadlines at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline) => {
              const daysUntil = getDaysUntil(new Date(deadline.date))
              const isUrgent = daysUntil === 'Today' || daysUntil === 'Tomorrow' || (typeof daysUntil === 'string' && parseInt(daysUntil) <= 7)

              return (
                <div
                  key={deadline._id}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                    isUrgent ? 'border-red-500' : 'border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{deadline.title}</h2>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                            deadline.priority
                          )}`}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                      {deadline.description && (
                        <p className="text-gray-600 mb-2">{deadline.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1 h-4 w-4" />
                          {format(new Date(deadline.date), 'PPp')}
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-1 h-4 w-4" />
                          {daysUntil}
                        </div>
                        {deadline.department && deadline.department !== 'All' && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {deadline.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleAddToCalendar(deadline)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add to Google Calendar
                    </button>
                    <button
                      onClick={() => handleDownloadICS(deadline)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center"
                    >
                      <FiDownload className="mr-1 h-4 w-4" />
                      Download ICS
                    </button>
                    {deadline.noticeId && (
                      <a
                        href={`/notices/${deadline.noticeId._id || deadline.noticeId}`}
                        className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Related Notice →
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

