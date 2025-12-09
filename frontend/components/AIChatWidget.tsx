'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { queryAPI } from '@/lib/api'
import { FiSend, FiX, FiLoader, FiMessageCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AIChatWidget() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    if (!isAuthenticated) {
      toast.error('Please login to use the AI Assistant')
      router.push('/login')
      return
    }

    const userMessage = { role: 'user' as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await queryAPI.ask(input)
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.data.answer,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to get answer')
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "What are today's notices?",
    "Show my deadlines",
    "What are the exam dates?",
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-electric-blue text-white rounded-full shadow-lg hover:shadow-glow-blue flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 animate-bounce-slow group"
        aria-label="Open AI Assistant"
      >
        <FiMessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-alert-orange rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border-2 border-electric-blue animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-electric-blue via-blue-600 to-electric-blue text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <FiMessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">AI Assistant</h3>
                <p className="text-xs opacity-90 font-body">Powered by AI — College Information System</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-2 transition-all duration-300 hover:rotate-90"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-soft-silver">
            {messages.length === 0 && (
              <div className="text-center text-deep-gray mt-8">
                <div className="text-5xl mb-4 animate-bounce-slow">🤖</div>
                {!isAuthenticated ? (
                  <>
                    <p className="text-sm font-heading font-semibold mb-2 text-charcoal">Login to use AI Assistant</p>
                    <p className="text-xs text-deep-gray mb-4 font-body">Get instant answers to your college queries</p>
                    <button
                      onClick={() => router.push('/login')}
                      className="mt-4 btn-ai text-sm"
                    >
                      Login Now
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-heading font-semibold mb-2 text-charcoal">Ask me anything!</p>
                    <p className="text-xs text-deep-gray mb-4 font-body">I can help with notices, deadlines, and more</p>
                    <div className="space-y-2 mt-4">
                      {quickQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(q)}
                          className="block w-full text-left px-4 py-3 bg-white rounded-xl text-sm hover:bg-electric-blue hover:text-white transition-all duration-300 hover:shadow-soft font-body border border-soft-silver"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-soft ${
                    msg.role === 'user'
                      ? 'bg-electric-blue text-white'
                      : 'bg-white text-charcoal border border-soft-silver'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap font-body leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-4 border border-soft-silver shadow-soft">
                  <div className="flex items-center space-x-2">
                    <FiLoader className="animate-spin text-electric-blue w-5 h-5" />
                    <span className="text-sm text-deep-gray font-body">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-soft-silver bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 border border-soft-silver rounded-xl focus:ring-2 focus:ring-electric-blue focus:border-transparent text-sm font-body transition-all duration-300"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-electric-blue text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:shadow-glow-blue hover:scale-105"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

