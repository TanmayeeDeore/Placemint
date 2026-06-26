const express      = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect }  = require('../middleware/auth');
const Notification = require('../models/Notifications');

const router = express.Router();

// GET /api/notifications — own notifications
router.get('/', protect, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

  res.json({ success: true, notifications, unreadCount });
}));

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );
  res.json({ success: true });
}));

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
}));

module.exports = router;