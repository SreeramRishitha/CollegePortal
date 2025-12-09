'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Layout from '@/components/Layout'
import { noticeAPI } from '@/lib/api'
import { format } from 'date-fns'
import { FiFileText, FiUpload, FiCheck, FiX, FiEdit, FiTrash2, FiQrCode } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminNoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'pdf' | 'text'>('pdf')
  const [formData, setFormData] = useState({
    title: '',
    file: null as File | null,
    textContent: '',
    department: 'All',
    targetAudience: 'All',
  })

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login')
      return
    }

    fetchNotices()
  }, [router])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const response = await noticeAPI.getAll()
      setNotices(response.data)
    } catch (error: any) {
      toast.error('Failed to load notices')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadType === 'pdf') {
      if (!formData.file) {
        toast.error('Please select a PDF file')
        return
      }
    } else {
      if (!formData.textContent || formData.textContent.trim().length === 0) {
        toast.error('Please enter notice text content')
        return
      }
    }

    try {
      setUploading(true)
      
      if (uploadType === 'pdf') {
        await noticeAPI.upload(formData.file, {
          title: formData.title || formData.file.name,
          department: formData.department,
          targetAudience: formData.targetAudience,
        })
      } else {
        // Text-based upload
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title || 'Untitled Notice')
        formDataToSend.append('textContent', formData.textContent)
        formDataToSend.append('department', formData.department)
        formDataToSend.append('targetAudience', formData.targetAudience)
        
        await noticeAPI.uploadText(formDataToSend)
      }
      
      toast.success('Notice uploaded! Processing in background...')
      setShowUploadModal(false)
      setFormData({ title: '', file: null, textContent: '', department: 'All', targetAudience: 'All' })
      setUploadType('pdf')
      fetchNotices()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload notice')
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await noticeAPI.publish(id)
      toast.success('Notice published!')
      fetchNotices()
    } catch (error: any) {
      toast.error('Failed to publish notice')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    try {
      await noticeAPI.delete(id)
      toast.success('Notice deleted')
      fetchNotices()
    } catch (error: any) {
      toast.error('Failed to delete notice')
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Upload Notice
          </button>
        </div>

        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Upload Notice</h2>
              
              {/* Upload Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType('pdf')
                      setFormData({ ...formData, textContent: '', file: null })
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                      uploadType === 'pdf'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    PDF Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType('text')
                      setFormData({ ...formData, file: null, textContent: '' })
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                      uploadType === 'text'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Text Input
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Notice title"
                    required
                  />
                </div>

                {uploadType === 'pdf' ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PDF File *
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          file: e.target.files?.[0] || null,
                          title: e.target.files?.[0]?.name || formData.title,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required={uploadType === 'pdf'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a PDF file containing the notice/circular
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notice Content *
                    </label>
                    <textarea
                      value={formData.textContent}
                      onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={10}
                      placeholder="Enter the notice content here...&#10;&#10;Example:&#10;Fee Payment Notice&#10;All students are required to pay their semester fees by November 20, 2026. Late payments will incur a penalty."
                      required={uploadType === 'text'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the notice text directly. AI will automatically extract summary, deadlines, and tags.
                    </p>
                  </div>
                )}

                <div className="mb-4">
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : uploadType === 'pdf' ? 'Upload PDF' : 'Upload Text'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false)
                      setFormData({ title: '', file: null, textContent: '', department: 'All', targetAudience: 'All' })
                      setUploadType('pdf')
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

        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your first notice to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          notice.processingStatus === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : notice.processingStatus === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : notice.processingStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {notice.processingStatus}
                      </span>
                      {notice.published && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          Published
                        </span>
                      )}
                    </div>
                    {notice.summary && (
                      <p className="text-gray-600 mb-2">{notice.summary}</p>
                    )}
                    {notice.deadlines && notice.deadlines.length > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        {notice.deadlines.length} deadline(s) extracted
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{format(new Date(notice.createdAt), 'PPp')}</span>
                    {notice.qrCodeUrl && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${notice.qrCodeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FiQrCode className="mr-1 h-4 w-4" />
                        View QR Code
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {notice.processingStatus === 'completed' && !notice.published && (
                      <button
                        onClick={() => handlePublish(notice._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
                      >
                        <FiCheck className="mr-1 h-4 w-4" />
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center"
                    >
                      <FiTrash2 className="mr-1 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

