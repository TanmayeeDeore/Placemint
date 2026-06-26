const express      = require('express');
const crypto       = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorizeRoles } = require('../middleware/auth');
const Invitation   = require('../models/Invitation');
const Job          = require('../models/Job');
const { sendInvitationEmail } = require('../services/emailServices');
const { createNotification }  = require('../services/notificationServices');
const User = require('../models/User');

const router = express.Router();

// POST /api/invitations/send  — teacher/employer invites a student email
router.post('/send', protect, authorizeRoles('teacher', 'employer'), asyncHandler(async (req, res) => {
  const { emails, jobId } = req.body; // emails: string[]

  const job = await Job.findById(jobId);
  if (!job) { res.status(404); throw new Error('Job not found'); }

  const results = [];

  for (const email of emails) {
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    await Invitation.findOneAndDelete({ email, jobId }); // replace old invite if exists

    await Invitation.create({ email, jobId, token, expiresAt });

    await sendInvitationEmail({ to: email, jobTitle: job.title, company: job.company, token })
      .catch(err => console.error(`Email to ${email} failed:`, err.message));

    // Notify user if they exist in the system
    const user = await User.findOne({ email });
    if (user) {
      await createNotification({
        userId:  user._id,
        type:    'invitation',
        message: `You've been invited to apply for ${job.title} at ${job.company}`,
        jobId:   job._id,
      });
    }

    results.push({ email, status: 'sent' });

    await new Promise(r => setTimeout(r, 100)); // throttle
  }

  res.status(201).json({ success: true, results });
}));

// GET /api/invitations/accept/:token  — student clicks email link
router.get('/accept/:token', asyncHandler(async (req, res) => {
  const invitation = await Invitation.findOne({ token: req.params.token });

  if (!invitation) {
    return res.redirect(`${process.env.CLIENT_URL}/invite-invalid`);
  }

  if (invitation.expiresAt < Date.now()) {
    invitation.status = 'expired';
    await invitation.save();
    return res.redirect(`${process.env.CLIENT_URL}/invite-expired`);
  }

  invitation.status = 'accepted';
  await invitation.save();

  res.redirect(`${process.env.CLIENT_URL}/jobs/${invitation.jobId}?invited=true`);
}));

// GET /api/invitations/job/:jobId — list invitations for a job
router.get('/job/:jobId', protect, authorizeRoles('teacher', 'employer'), asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({ jobId: req.params.jobId }).sort('-sentAt');
  res.json({ success: true, invitations });
}));

module.exports = router;