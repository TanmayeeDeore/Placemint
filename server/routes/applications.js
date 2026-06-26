const express      = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorizeRoles } = require('../middleware/auth');
const Application  = require('../models/Applications');
const Job          = require('../models/Job');
const Profile      = require('../models/Profile');
const User         = require('../models/User');
const { createNotification } = require('../services/notificationServices');
const { sendStatusEmail }    = require('../services/emailServices');

const router = express.Router();

// POST /api/applications — student applies to a job
router.post('/', protect, authorizeRoles('student'), asyncHandler(async (req, res) => {
  const { jobId, coverNote } = req.body;

  const job = await Job.findById(jobId);
  if (!job || job.status !== 'open') {
    res.status(400);
    throw new Error('Job not found or closed');
  }

  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile || !profile.resumeUrl) {
    res.status(400);
    throw new Error('Please upload your resume before applying');
  }

  // Eligibility check
  if (profile.cgpa < job.eligibility.minCgpa) {
    res.status(400);
    throw new Error(`Minimum CGPA required: ${job.eligibility.minCgpa}`);
  }
  if (job.eligibility.branches.length > 0 && !job.eligibility.branches.includes(profile.branch)) {
    res.status(400);
    throw new Error('Your branch is not eligible for this job');
  }

  const existing = await Application.findOne({ jobId, studentId: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already applied to this job');
  }

  const application = await Application.create({
    jobId,
    studentId:  req.user._id,
    resumeUrl:  profile.resumeUrl,
    coverNote:  coverNote || '',
  });

  // Notify employer
  await createNotification({
    userId:  job.postedBy,
    type:    'application_update',
    message: `${req.user.name} applied to ${job.title}`,
    jobId:   job._id,
  });

  res.status(201).json({ success: true, application });
}));

// GET /api/applications/student — student's own applications
router.get('/student', protect, authorizeRoles('student'), asyncHandler(async (req, res) => {
  const applications = await Application.find({ studentId: req.user._id })
    .populate('jobId', 'title company location ctc deadline status')
    .sort('-createdAt');

  res.json({ success: true, applications });
}));

// GET /api/applications/job/:jobId — employer/teacher sees applicants
router.get('/job/:jobId', protect, authorizeRoles('employer', 'teacher'), asyncHandler(async (req, res) => {
  const applications = await Application.find({ jobId: req.params.jobId })
    .populate('studentId', 'name email')
    .populate({ path: 'studentId', populate: { path: 'profileId' } })
    .sort('-createdAt');

  res.json({ success: true, count: applications.length, applications });
}));

// GET /api/applications/all — teacher: all applications across all jobs
router.get('/all', protect, authorizeRoles('teacher'), asyncHandler(async (req, res) => {
  const { status, branch } = req.query;
  const filter = {};
  if (status) filter.status = status;

  let applications = await Application.find(filter)
    .populate('jobId', 'title company')
    .populate('studentId', 'name email profileId')
    .sort('-createdAt');

  if (branch) {
    applications = applications.filter(a =>
      a.studentId?.profileId?.branch === branch
    );
  }

  res.json({ success: true, count: applications.length, applications });
}));

// PATCH /api/applications/:id/status — employer updates application status
router.patch('/:id/status', protect, authorizeRoles('employer', 'teacher'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['applied', 'shortlisted', 'rejected', 'selected'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const application = await Application.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('jobId', 'title company');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  application.status = status;
  await application.save();

  // Notify student + send email
  await createNotification({
    userId:  application.studentId._id,
    type:    'status_change',
    message: `Your application for ${application.jobId.title} has been ${status}`,
    jobId:   application.jobId._id,
  });

  if (['shortlisted', 'selected', 'rejected'].includes(status)) {
    await sendStatusEmail({
      to:       application.studentId.email,
      name:     application.studentId.name,
      jobTitle: application.jobId.title,
      status,
    }).catch(err => console.error('Status email failed:', err.message));
  }

  res.json({ success: true, application });
}));

module.exports = router;