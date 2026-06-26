const express  = require('express');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const User     = require('../models/User');
const Profile  = require('../models/Profile');

const router = express.Router();

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, profileId: user.profileId },
  });
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'employer']).withMessage('Invalid role'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    throw new Error(errors.array().map(e => e.msg).join(', '));
  }

  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, role });

  // Auto-create profile for students
  if (role === 'student') {
    const profile = await Profile.create({ userId: user._id });
    user.profileId = profile._id;
    await user.save();
  }

  sendToken(user, 201, res);
}));

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    throw new Error(errors.array().map(e => e.msg).join(', '));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  sendToken(user, 200, res);
}));

router.post('/login', asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  console.log("USER:", user);

  if (user) {
    console.log("PASSWORD MATCH:", await user.matchPassword(password));
  } else {
    console.log("USER NOT FOUND");
  }

  // existing code...
}));

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
}));

module.exports = router;