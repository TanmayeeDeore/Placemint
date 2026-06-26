const express      = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorizeRoles } = require('../middleware/auth');
const Profile      = require('../models/Profile');
const User         = require('../models/User');
const { upload }   = require('../services/CloudinaryServices');

const router = express.Router();

// GET /api/profile/:userId  — get any profile
router.get('/:userId', protect, asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.params.userId });
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }
  res.json({ success: true, profile });
}));

// PUT /api/profile  — update own profile (students only)
router.put('/', protect, authorizeRoles('student'), asyncHandler(async (req, res) => {
  const { branch, cgpa, skills, bio, linkedIn, github, phone } = req.body;

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { branch, cgpa, skills, bio, linkedIn, github, phone },
    { new: true, runValidators: true }
  );

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found');
  }

  res.json({ success: true, profile });
}));

// POST /api/profile/upload-resume
router.post('/upload-resume', protect, authorizeRoles('student'),
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const resumeUrl = req.file.path;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { resumeUrl },
      { new: true }
    );

    res.json({ success: true, resumeUrl, profile });
  })
);

// GET /api/profile  — teacher/employer: get all student profiles
router.get('/', protect, authorizeRoles('teacher', 'employer'), asyncHandler(async (req, res) => {
  const { branch, minCgpa } = req.query;
  const filter = {};
  if (branch)   filter.branch = branch;
  if (minCgpa)  filter.cgpa = { $gte: Number(minCgpa) };

  const profiles = await Profile.find(filter).populate('userId', 'name email');
  res.json({ success: true, profiles });
}));

module.exports = router;