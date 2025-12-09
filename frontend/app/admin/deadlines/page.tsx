'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Layout from '@/components/Layout'
import { deadlineAPI, noticeAPI } from '@/lib/api'
import { format } from 'date-fns'
import { FiCalendar, FiPlus, FiEdit, FiTrash2, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminDeadlinesPage() {
  const router = useRouter()
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    department: 'All',
    priority: 'medium',
    type: 'other',
    description: '',
    noticeId: '',
    reminderSettings: {
      daysBefore: [7, 3, 1],
      notifyChannels: ['inapp', 'email'],
    },
  })

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login')
      return
    }

    fetchDeadlines()
    fetchNotices()
  }, [router])

  const fetchDeadlines = async () => {
    try {
      setLoading(true)
      const response = await deadlineAPI.getAll()
      setDeadlines(response.data)
    } catch (error: any) {
      toast.error('Failed to load deadlines')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotices = async () => {
    try {
      const response = await noticeAPI.getAll()
      setNotices(response.data)
    } catch (error: any) {
      console.error('Failed to load notices:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDeadline) {
        await deadlineAPI.update(editingDeadline._id, formData)
        toast.success('Deadline updated successfully')
      } else {
        await deadlineAPI.create(formData)
        toast.success('Deadline created successfully')
      }
      setShowCreateModal(false)
      setEditingDeadline(null)
      setFormData({
        title: '',
        date: '',
        department: 'All',
        priority: 'medium',
        type: 'other',
        description: '',
        noticeId: '',
        reminderSettings: {
          daysBefore: [7, 3, 1],
          notifyChannels: ['inapp', 'email'],
        },
      })
      fetchDeadlines()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save deadline')
    }
  }

  const handleEdit = (deadline: any) => {
    setEditingDeadline(deadline)
    setFormData({
      title: deadline.title,
      date: deadline.date ? new Date(deadline.date).toISOString().split('T')[0] : '',
      department: deadline.department || 'All',
      priority: deadline.priority || 'medium',
      type: deadline.type || 'other',
      description: deadline.description || '',
      noticeId: deadline.noticeId?._id || deadline.noticeId || '',
      reminderSettings: deadline.reminderSettings || {
        daysBefore: [7, 3, 1],
        notifyChannels: ['inapp', 'email'],
      },
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deadline?')) return

    try {
      await deadlineAPI.delete(id)
      toast.success('Deadline deleted')
      fetchDeadlines()
    } catch (error: any) {
      toast.error('Failed to delete deadline')
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Deadlines</h1>
          <button
            onClick={() => {
              setEditingDeadline(null)
              setFormData({
                title: '',
                date: '',
                department: 'All',
                priority: 'medium',
                type: 'other',
                description: '',
                noticeId: '',
                reminderSettings: {
                  daysBefore: [7, 3, 1],
                  notifyChannels: ['inapp', 'email'],
                },
              })
              setShowCreateModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Create Deadline
          </button>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingDeadline ? 'Edit Deadline' : 'Create Deadline'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="All">All</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="fee">Fee</option>
                      <option value="exam">Exam</option>
                      <option value="hostel">Hostel</option>
                      <option value="form">Form</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to Notice (Optional)
                  </label>
                  <select
                    value={formData.noticeId}
                    onChange={(e) => setFormData({ ...formData, noticeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">None</option>
                    {notices.map((notice) => (
                      <option key={notice._id} value={notice._id}>
                        {notice.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingDeadline ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingDeadline(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deadlines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deadlines</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first deadline to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <div key={deadline._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{deadline.title}</h2>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          deadline.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : deadline.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : deadline.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {deadline.priority}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                        {deadline.type}
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
                      {deadline.department && deadline.department !== 'All' && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {deadline.department}
                        </span>
                      )}
                      {deadline.noticeId && (
                        <span className="text-blue-600 text-xs">
                          Linked to notice
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(deadline)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                  >
                    <FiEdit className="mr-1 h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(deadline._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center"
                  >
                    <FiTrash2 className="mr-1 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

