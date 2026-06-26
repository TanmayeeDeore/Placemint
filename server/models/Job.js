const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  company:     { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location:    { type: String, default: 'Remote' },
  ctc:         { type: String, default: '' },
  jobType:     { type: String, enum: ['full-time', 'internship', 'part-time'], default: 'full-time' },
  eligibility: {
    minCgpa:   { type: Number, default: 0 },
    branches:  [{ type: String }],
  },
  deadline:    { type: Date, required: true },
  status:      { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);