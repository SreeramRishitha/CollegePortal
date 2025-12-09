const express = require('express')
const Notification = require('../models/Notification')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const { read, limit = 50 } = req.query

    const query = { userId: req.user._id }
    if (read !== undefined) {
      query.read = read === 'true'
    }

    const notifications = await Notification.find(query)
      .populate('noticeId', 'title summary')
      .populate('deadlineId', 'title date')
      .populate('complaintId', 'title status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    res.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    })

    res.json({ count })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ message: 'Failed to get unread count' })
  }
})

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    notification.read = true
    notification.readAt = new Date()
    await notification.save()

    res.json(notification)
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ message: 'Failed to mark as read' })
  }
})

// Mark all as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({ message: 'Failed to mark all as read' })
  }
})

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    await Notification.findByIdAndDelete(req.params.id)

    res.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ message: 'Failed to delete notification' })
  }
})

module.exports = router

