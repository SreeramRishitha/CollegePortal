const Notification = require('../models/Notification')
const Deadline = require('../models/Deadline')
const User = require('../models/User')

/**
 * Create and send notifications
 */
async function createNotification(data) {
  const notification = new Notification({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link,
    noticeId: data.noticeId,
    deadlineId: data.deadlineId,
    complaintId: data.complaintId,
    channels: data.channels || ['inapp'],
  })

  await notification.save()

  // Send via specified channels
  if (data.channels) {
    for (const channel of data.channels) {
      await sendNotification(notification, channel)
    }
  }

  return notification
}

/**
 * Send notification via specific channel
 */
async function sendNotification(notification, channel) {
  const user = await User.findById(notification.userId)
  if (!user) return

  switch (channel) {
    case 'email':
      await sendEmailNotification(notification, user)
      break
    case 'whatsapp':
      await sendWhatsAppNotification(notification, user)
      break
    case 'sms':
      await sendSMSNotification(notification, user)
      break
    case 'inapp':
      // In-app notifications are stored in DB, frontend polls or uses WebSocket
      break
  }

  // Mark as sent
  notification.sent = true
  notification.sentAt = new Date()
  await notification.save()
}

/**
 * Send email notification (placeholder - integrate SendGrid/SES)
 */
async function sendEmailNotification(notification, user) {
  // TODO: Integrate SendGrid or AWS SES
  console.log(`Email notification to ${user.email}: ${notification.title}`)
  // Example: await sendGrid.send({ to: user.email, subject: notification.title, text: notification.message })
}

/**
 * Send WhatsApp notification (placeholder - integrate Twilio)
 */
async function sendWhatsAppNotification(notification, user) {
  // TODO: Integrate Twilio WhatsApp API
  console.log(`WhatsApp notification to ${user.email}: ${notification.title}`)
}

/**
 * Send SMS notification (placeholder - integrate Twilio)
 */
async function sendSMSNotification(notification, user) {
  // TODO: Integrate Twilio SMS
  console.log(`SMS notification to ${user.email}: ${notification.title}`)
}

/**
 * Notify all students about a new notice
 */
async function notifyNewNotice(notice) {
  try {
    // Get all students
    const students = await User.find({ role: 'student' })

    for (const student of students) {
      const deadlineText = notice.deadlines.length > 0
        ? ` Deadline: ${notice.deadlines[0].date.toLocaleDateString()}`
        : ''

      await createNotification({
        userId: student._id,
        type: 'notice',
        title: `New Notice: ${notice.title}`,
        message: `${notice.summary}${deadlineText}`,
        link: `/notices/${notice._id}`,
        noticeId: notice._id,
        channels: ['inapp', 'email'], // Default channels
      })
    }

    console.log(`Notified ${students.length} students about notice ${notice._id}`)
  } catch (error) {
    console.error('Error notifying students:', error)
  }
}

/**
 * Schedule deadline reminders
 */
async function scheduleDeadlineReminders(deadline) {
  if (!deadline.reminderSettings || !deadline.reminderSettings.daysBefore) {
    return
  }

  const reminderDays = deadline.reminderSettings.daysBefore || [7, 3, 1]
  const channels = deadline.reminderSettings.notifyChannels || ['inapp', 'email']

  // Get target users (students in the department or all students)
  const query = { role: 'student' }
  if (deadline.department && deadline.department !== 'All') {
    // If user model has department field, filter by it
    // query.department = deadline.department
  }

  const users = await User.find(query)

  for (const user of users) {
    for (const daysBefore of reminderDays) {
      const reminderDate = new Date(deadline.date)
      reminderDate.setDate(reminderDate.getDate() - daysBefore)

      // Only schedule if reminder date is in the future
      if (reminderDate > new Date()) {
        // Create notification scheduled for reminderDate
        // In production, use a job queue (Bull, Agenda, etc.)
        await createNotification({
          userId: user._id,
          type: 'reminder',
          title: `Reminder: ${deadline.title}`,
          message: `${deadline.title} is due in ${daysBefore} day(s) on ${deadline.date.toLocaleDateString()}`,
          link: `/deadlines/${deadline._id}`,
          deadlineId: deadline._id,
          channels,
        })
      }
    }
  }
}

module.exports = {
  createNotification,
  sendNotification,
  notifyNewNotice,
  scheduleDeadlineReminders,
}

