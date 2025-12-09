'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { documentAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { FiUpload, FiTrash2, FiFile } from 'react-icons/fi'

interface Document {
  _id: string
  filename: string
  originalName: string
  uploadedAt: string
  size: number
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getAll()
      setDocuments(response.data)
    } catch (error: any) {
      toast.error('Failed to fetch documents')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
      } else {
        toast.error('Please upload a PDF file')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      await documentAPI.upload(selectedFile)
      toast.success('Document uploaded and processed successfully!')
      setSelectedFile(null)
      fetchDocuments()
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await documentAPI.delete(id)
      toast.success('Document deleted successfully')
      fetchDocuments()
    } catch (error: any) {
      toast.error('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Document Management</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PDF File
              </label>
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
            >
              <FiUpload />
              <span>{uploading ? 'Uploading...' : 'Upload & Process'}</span>
            </button>
            <p className="text-sm text-gray-500">
              Upload official circulars, notices, or academic calendars. The system will
              automatically extract text and make it searchable.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
          {documents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FiFile className="text-6xl mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <FiFile className="text-2xl text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.size)} •{' '}
                        {doc.uploadedAt 
                          ? format(new Date(doc.uploadedAt), 'PPp')
                          : doc.createdAt 
                          ? format(new Date(doc.createdAt), 'PPp')
                          : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

