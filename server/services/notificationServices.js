const Notification = require('../models/Notifications');

exports.createNotification = async ({ userId, type, message, jobId }) => {
  try {
    await Notification.create({ userId, type, message, jobId });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};