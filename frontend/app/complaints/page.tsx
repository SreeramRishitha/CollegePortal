'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { complaintAPI } from '@/lib/api'
import { getUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { FiPlus, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface Complaint {
  _id: string
  title: string
  description: string
  category: string
  status: string
  createdAt: string
  reply?: string
  attachments?: string[]
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-review': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusIcons = {
  pending: FiClock,
  'in-review': FiClock,
  resolved: FiCheckCircle,
  rejected: FiXCircle,
}

export default function ComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    attachments: null as FileList | null,
  })

  // Redirect admins away from student complaints page
  useEffect(() => {
    const user = getUser()
    if (user && user.role === 'admin') {
      router.push('/admin/complaints')
    }
  }, [router])

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll()
      setComplaints(response.data)
    } catch (error: any) {
      toast.error('Failed to fetch complaints')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('category', formData.category)
      if (formData.attachments) {
        Array.from(formData.attachments).forEach((file) => {
          data.append('attachments', file)
        })
      }

      await complaintAPI.create(data)
      toast.success('Complaint submitted successfully!')
      setShowForm(false)
      setFormData({ title: '', description: '', category: 'general', attachments: null })
      fetchComplaints()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <FiPlus />
            <span>New Complaint</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Submit New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your complaint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="attendance">Attendance</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your complaint in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFormData({ ...formData, attachments: e.target.files })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  accept="image/*,.pdf"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p>No complaints yet. Submit your first complaint!</p>
            </div>
          ) : (
            complaints.map((complaint) => {
              const StatusIcon = statusIcons[complaint.status as keyof typeof statusIcons] || FiClock
              return (
                <div key={complaint._id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {complaint.createdAt 
                          ? format(new Date(complaint.createdAt), 'PPp')
                          : 'Unknown date'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon />
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[complaint.status as keyof typeof statusColors] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{complaint.description}</p>

                  {complaint.reply && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                      <p className="font-semibold text-blue-900 mb-1">Admin Reply:</p>
                      <p className="text-blue-800">{complaint.reply}</p>
                    </div>
                  )}

                  {complaint.attachments && complaint.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                      <div className="flex space-x-2">
                        {complaint.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

