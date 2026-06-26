const express      = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorizeRoles } = require('../middleware/auth');
const Job          = require('../models/Job');
const { createNotification } = require('../services/notificationServices');
const User         = require('../models/User');

const router = express.Router();

// GET /api/jobs — all open jobs (all authenticated users)
router.get('/', protect, asyncHandler(async (req, res) => {
  const { branch, minCgpa, jobType, search } = req.query;
  const filter = { status: 'open' };

  if (jobType)  filter.jobType = jobType;
  if (search)   filter.title = { $regex: search, $options: 'i' };

  // For students: auto-filter by eligibility
  if (req.user.role === 'student') {
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ userId: req.user._id });
    if (profile) {
      filter['eligibility.minCgpa'] = { $lte: profile.cgpa || 0 };
      if (profile.branch) {
        filter.$or = [
          { 'eligibility.branches': profile.branch },
          { 'eligibility.branches': { $size: 0 } },
        ];
      }
    }
  }

  // For employers: show only their own jobs
  if (req.user.role === 'employer') {
    filter.postedBy = req.user._id;
    delete filter.status; // employer sees all their jobs (open + closed)
  }

  const jobs = await Job.find(filter)
    .populate('postedBy', 'name email')
    .sort('-createdAt');

  res.json({ success: true, count: jobs.length, jobs });
}));

// GET /api/jobs/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json({ success: true, job });
}));

// POST /api/jobs — employer creates a job
router.post('/', protect, authorizeRoles('employer', 'teacher'), asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });

  // Notify all students
  const students = await User.find({ role: 'student' }).select('_id');
  await Promise.all(students.map(s =>
    createNotification({
      userId:  s._id,
      type:    'new_job',
      message: `New job posted: ${job.title} at ${job.company}`,
      jobId:   job._id,
    })
  ));

  res.status(201).json({ success: true, job });
}));

// PUT /api/jobs/:id — employer edits their own job
router.put('/:id', protect, authorizeRoles('employer', 'teacher'), asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this job');
  }

  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, job: updated });
}));

// DELETE /api/jobs/:id
router.delete('/:id', protect, authorizeRoles('employer', 'teacher'), asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted' });
}));

module.exports = router;