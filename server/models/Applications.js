const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     { type: String, enum: ['applied', 'shortlisted', 'rejected', 'selected'], default: 'applied' },
  resumeUrl:  { type: String, required: true },
  coverNote:  { type: String, default: '' },
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);