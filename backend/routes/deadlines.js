const express = require('express')
const { auth, adminOnly } = require('../middleware/auth')
const Deadline = require('../models/Deadline')
const { scheduleDeadlineReminders } = require('../services/notificationService')

const router = express.Router()

// Get all deadlines (filtered by user role and department)
router.get('/', auth, async (req, res) => {
  try {
    const query = {}

    // Students see upcoming deadlines
    if (req.user.role === 'student') {
      query.date = { $gte: new Date() } // Only future deadlines
    }

    // Filter by department if specified
    if (req.query.department && req.query.department !== 'All') {
      query.department = req.query.department
    }

    // Filter by type if specified
    if (req.query.type) {
      query.type = req.query.type
    }

    const deadlines = await Deadline.find(query)
      .populate('noticeId', 'title summary')
      .populate('createdBy', 'name')
      .sort({ date: 1 })

    res.json(deadlines)
  } catch (error) {
    console.error('Get deadlines error:', error)
    res.status(500).json({ message: 'Failed to fetch deadlines' })
  }
})

// Get single deadline
router.get('/:id', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
      .populate('noticeId', 'title summary fileUrl')
      .populate('createdBy', 'name')

    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' })
    }

    res.json(deadline)
  } catch (error) {
    console.error('Get deadline error:', error)
    res.status(500).json({ message: 'Failed to fetch deadline' })
  }
})

// Create deadline (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      title,
      date,
      department = 'All',
      priority = 'medium',
      type = 'other',
      description,
      reminderSettings,
      noticeId,
    } = req.body

    const deadlineData = {
      title,
      date: new Date(date),
      department,
      priority,
      type,
      description,
      reminderSettings: reminderSettings || {
        daysBefore: [7, 3, 1],
        notifyChannels: ['inapp', 'email'],
      },
      createdBy: req.user._id,
    }

    // Only include noticeId if it's provided and not empty
    if (noticeId && noticeId.trim()) {
      deadlineData.noticeId = noticeId
    }

    const deadline = new Deadline(deadlineData)

    await deadline.save()

    // Schedule reminders (fire and forget or safe await)
    try {
      await scheduleDeadlineReminders(deadline)
    } catch (reminderError) {
      console.error('Failed to schedule reminders:', reminderError)
      // We don't fail the request if reminders fail, just log it
    }

    res.status(201).json(deadline)
  } catch (error) {
    console.error('Create deadline error:', error)
    res.status(500).json({ 
      message: 'Failed to create deadline', 
      error: error.message // Return specific error for debugging
    })
  }
})

// Update deadline (admin only)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' })
    }

    const { title, date, department, priority, type, description, reminderSettings, noticeId } = req.body

    if (title) deadline.title = title
    if (date) deadline.date = new Date(date)
    if (department) deadline.department = department
    if (priority) deadline.priority = priority
    if (type) deadline.type = type
    if (description !== undefined) deadline.description = description
    if (reminderSettings) deadline.reminderSettings = reminderSettings
    if (noticeId !== undefined) {
      if (noticeId && noticeId.trim()) {
        deadline.noticeId = noticeId
      } else {
        deadline.noticeId = undefined
      }
    }

    await deadline.save()

    // Reschedule reminders if settings changed
    if (reminderSettings) {
      await scheduleDeadlineReminders(deadline)
    }

    res.json(deadline)
  } catch (error) {
    console.error('Update deadline error:', error)
    res.status(500).json({ message: 'Failed to update deadline' })
  }
})

// Delete deadline (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' })
    }

    await Deadline.findByIdAndDelete(req.params.id)

    res.json({ message: 'Deadline deleted successfully' })
  } catch (error) {
    console.error('Delete deadline error:', error)
    res.status(500).json({ message: 'Failed to delete deadline' })
  }
})

// Generate ICS file for calendar
router.get('/:id/ics', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' })
    }

    const ics = require('ics')

    const event = {
      start: [
        deadline.date.getFullYear(),
        deadline.date.getMonth() + 1,
        deadline.date.getDate(),
      ],
      duration: { hours: 1 },
      title: deadline.title,
      description: deadline.description || '',
      location: 'College',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
    }

    ics.createEvent(event, (error, value) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to generate calendar file' })
      }

      res.setHeader('Content-Type', 'text/calendar')
      res.setHeader('Content-Disposition', `attachment; filename="deadline-${deadline._id}.ics"`)
      res.send(value)
    })
  } catch (error) {
    console.error('Generate ICS error:', error)
    res.status(500).json({ message: 'Failed to generate calendar file' })
  }
})

// Get Google Calendar link
router.get('/:id/calendar-link', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' })
    }

    const startDate = deadline.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDate = new Date(deadline.date.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z'

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      deadline.title
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      deadline.description || ''
    )}&location=College`

    res.json({ url: calendarUrl })
  } catch (error) {
    console.error('Generate calendar link error:', error)
    res.status(500).json({ message: 'Failed to generate calendar link' })
  }
})

module.exports = router

