'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { complaintAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { FiFilter, FiSearch, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi'

interface Complaint {
  _id: string
  title: string
  description: string
  category: string
  status: string
  createdAt: string
  reply?: string
  submittedBy: {
    name: string
    email: string
  }
  attachments?: string[]
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
  })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [complaints, filters])

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll()
      setComplaints(response.data)
    } catch (error: any) {
      toast.error('Failed to fetch complaints')
    }
  }

  const applyFilters = () => {
    let filtered = [...complaints]

    if (filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status)
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((c) => c.category === filters.category)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      )
    }

    setFilteredComplaints(filtered)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await complaintAPI.updateStatus(id, status)
      toast.success('Status updated successfully')
      fetchComplaints()
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const handleReply = async () => {
    if (!selectedComplaint || !replyText.trim()) return

    setLoading(true)
    try {
      await complaintAPI.reply(selectedComplaint._id, replyText)
      toast.success('Reply sent successfully')
      setSelectedComplaint(null)
      setReplyText('')
      fetchComplaints()
    } catch (error: any) {
      toast.error('Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard - Complaints</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiSearch className="inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Search complaints..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFilter className="inline mr-2" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="attendance">Attendance</option>
                <option value="certificate">Certificate</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p>No complaints found matching your filters.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{complaint.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      By: {complaint.submittedBy.name} ({complaint.submittedBy.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      {complaint.createdAt 
                        ? format(new Date(complaint.createdAt), 'PPp')
                        : 'Unknown date'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {complaint.category.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        complaint.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : complaint.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {complaint.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{complaint.description}</p>

                {complaint.reply && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                    <p className="font-semibold text-green-900 mb-1">Your Reply:</p>
                    <p className="text-green-800">{complaint.reply}</p>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                  >
                    <FiMessageSquare />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(complaint._id, 'in-review')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                  >
                    Mark In Review
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(complaint._id, 'resolved')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                  >
                    <FiCheckCircle />
                    <span>Resolve</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(complaint._id, 'rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
                  >
                    <FiXCircle />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Reply to Complaint</h2>
              <p className="text-gray-600 mb-4">{selectedComplaint.title}</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Enter your reply..."
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleReply}
                  disabled={loading || !replyText.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={() => {
                    setSelectedComplaint(null)
                    setReplyText('')
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

