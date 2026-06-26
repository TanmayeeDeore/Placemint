const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  branch:    { type: String, default: '' },
  cgpa:      { type: Number, min: 0, max: 10, default: 0 },
  skills:    [{ type: String }],
  bio:       { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  linkedIn:  { type: String, default: '' },
  github:    { type: String, default: '' },
  phone:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);