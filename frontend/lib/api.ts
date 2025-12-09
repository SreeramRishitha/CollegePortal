import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000, // 100 second timeout (for AI processing and large file uploads)
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running or not accessible')
      error.message = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5000'
      error.isNetworkError = true
    }
    return Promise.reject(error)
  }
)

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string; studentId?: string }) =>
    api.post('/auth/register', data),
}

// Query API
export const queryAPI = {
  ask: (question: string, noticeId?: string) =>
    api.post('/query/ask', { question, noticeId }),
}

// Complaint API
export const complaintAPI = {
  create: (data: FormData) =>
    api.post('/complaints', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/complaints'),
  getById: (id: string) => api.get(`/complaints/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/complaints/${id}/status`, { status }),
  reply: (id: string, reply: string) =>
    api.post(`/complaints/${id}/reply`, { reply }),
}

// Document API
export const documentAPI = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAll: () => api.get('/documents'),
  delete: (id: string) => api.delete(`/documents/${id}`),
}

// Notice API
export const noticeAPI = {
  getAll: (params?: { department?: string }) =>
    api.get('/notices', { params }),
  getById: (id: string) => api.get(`/notices/${id}`),
  upload: (file: File, data: { title: string; department?: string; targetAudience?: string }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', data.title)
    if (data.department) formData.append('department', data.department)
    if (data.targetAudience) formData.append('targetAudience', data.targetAudience)
    return api.post('/notices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadText: (formData: FormData) => {
    return api.post('/notices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  publish: (id: string) => api.post(`/notices/${id}/publish`),
  update: (id: string, data: any) => api.patch(`/notices/${id}`, data),
  delete: (id: string) => api.delete(`/notices/${id}`),
}

// Deadline API
export const deadlineAPI = {
  getAll: (params?: { department?: string; type?: string }) =>
    api.get('/deadlines', { params }),
  getById: (id: string) => api.get(`/deadlines/${id}`),
  create: (data: any) => api.post('/deadlines', data),
  update: (id: string, data: any) => api.patch(`/deadlines/${id}`, data),
  delete: (id: string) => api.delete(`/deadlines/${id}`),
  getICS: (id: string) => api.get(`/deadlines/${id}/ics`, { responseType: 'blob' }),
  getCalendarLink: (id: string) => api.get(`/deadlines/${id}/calendar-link`),
}

// Notification API
export const notificationAPI = {
  getAll: (params?: { read?: boolean; limit?: number }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

export default api

