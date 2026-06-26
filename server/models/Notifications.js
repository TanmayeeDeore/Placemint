const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['application_update', 'new_job', 'invitation', 'status_change', 'general'], default: 'general' },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
  jobId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);