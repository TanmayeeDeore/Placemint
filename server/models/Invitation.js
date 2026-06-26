const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  jobId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  token:     { type: String, required: true, unique: true },
  status:    { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  expiresAt: { type: Date, required: true },
  sentAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invitation', InvitationSchema);