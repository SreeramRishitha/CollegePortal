'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Layout from '@/components/Layout'
import { noticeAPI, queryAPI } from '@/lib/api'
import { format } from 'date-fns'
import { FiFileText, FiCalendar, FiTag, FiDownload, FiMessageCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function NoticeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const noticeId = params.id as string
  const [notice, setNotice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; answer: string }>>([])

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    fetchNotice()
  }, [router, noticeId])

  const fetchNotice = async () => {
    try {
      setLoading(true)
      const response = await noticeAPI.getById(noticeId)
      setNotice(response.data)
    } catch (error: any) {
      toast.error('Failed to load notice')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setAsking(true)
    const currentQuestion = question
    setQuestion('')

    try {
      const response = await queryAPI.ask(currentQuestion, noticeId)
      const newAnswer = response.data.answer
      setAnswer(newAnswer)
      setChatHistory([...chatHistory, { question: currentQuestion, answer: newAnswer }])
    } catch (error: any) {
      toast.error('Failed to get answer')
      console.error(error)
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading notice...</div>
        </div>
      </Layout>
    )
  }

  if (!notice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Notice not found</h2>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Notices
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{notice.title}</h1>
          
          {notice.summary && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">TL;DR</h3>
              <p className="text-blue-800">{notice.summary}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {notice.tags && notice.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <FiTag className="mr-1 h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {notice.deadlines && notice.deadlines.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Deadlines:</h3>
              <div className="space-y-2">
                {notice.deadlines.map((deadline: any, idx: number) => (
                  <div key={idx} className="flex items-center bg-gray-50 p-3 rounded">
                    <FiCalendar className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="font-medium">{deadline.title}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      - {format(new Date(deadline.date), 'PPp')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${notice.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiDownload className="mr-1 h-4 w-4" />
              Download PDF
            </a>
            <span className="text-sm text-gray-500">
              {notice.createdAt ? format(new Date(notice.createdAt), 'PPp') : 'Unknown date'}
            </span>
          </div>
        </div>

        {/* Ask AI about this notice */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiMessageCircle className="mr-2 h-5 w-5" />
            Ask AI about this notice
          </h2>
          
          {chatHistory.length > 0 && (
            <div className="mb-4 space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-900">Q: {chat.question}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800">A: {chat.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this notice..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={asking}
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {asking ? 'Asking...' : 'Ask'}
            </button>
          </form>

          {answer && chatHistory.length === 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

