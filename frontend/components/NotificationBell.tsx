'use client'

import { useState, useEffect } from 'react'
import { notificationAPI } from '@/lib/api'
import { FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
    if (showDropdown) {
      fetchNotifications()
    }
  }, [showDropdown])

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      setUnreadCount(response.data.count)
    } catch (error) {
      // Silently fail
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({ limit: 10 })
      setNotifications(response.data)
    } catch (error) {
      toast.error('Failed to load notifications')
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id)
      fetchUnreadCount()
      fetchNotifications()
    } catch (error) {
      // Silently fail
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      fetchUnreadCount()
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  href={notification.link || '#'}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkRead(notification._id)
                    }
                    setShowDropdown(false)
                  }}
                  className={`block p-4 border-b hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {format(new Date(notification.createdAt), 'PPp')}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

