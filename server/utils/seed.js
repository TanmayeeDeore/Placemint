// require('dotenv').config({ path: '../.env' });
require("dotenv").config();
const mongoose = require('mongoose');
const User        = require('../models/User');
const Profile     = require('../models/Profile');
const Job         = require('../models/Job');
const Application = require('../models/Applications');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Clear existing
  await Promise.all([User, Profile, Job, Application].map(m => m.deleteMany({})));
  console.log('Cleared collections');

  // Teacher
  const teacher = await User.create({ name: 'Prof. Sharma', email: 'teacher@demo.com', password: 'password123', role: 'teacher' });

  // Employer
  const employer = await User.create({ name: 'Rahul (TechCorp HR)', email: 'employer@demo.com', password: 'password123', role: 'employer' });

  // Students
  const branches = ['CSE', 'ECE', 'ME', 'EE'];
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await User.create({
      name: `Student ${i}`,
      email: `student${i}@demo.com`,
      password: 'password123',
      role: 'student',
    });
    const profile = await Profile.create({
      userId: student._id,
      branch: branches[i % branches.length],
      cgpa: (6 + Math.random() * 4).toFixed(1),
      skills: ['JavaScript', 'React', 'Node.js'].slice(0, i % 3 + 1),
      bio: `Final year ${branches[i % branches.length]} student.`,
      resumeUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
    });
    student.profileId = profile._id;
    await student.save();
    students.push(student);
  }

  // Jobs
  const job1 = await Job.create({
    postedBy: employer._id,
    title: 'Software Engineer',
    company: 'TechCorp',
    description: 'Build scalable backend services using Node.js and MongoDB.',
    location: 'Bangalore',
    ctc: '12 LPA',
    jobType: 'full-time',
    eligibility: { minCgpa: 7, branches: ['CSE', 'ECE'] },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'open',
  });

  const job2 = await Job.create({
    postedBy: employer._id,
    title: 'React Developer Intern',
    company: 'StartupXYZ',
    description: 'Work on our consumer-facing React application.',
    location: 'Remote',
    ctc: '25k/month',
    jobType: 'internship',
    eligibility: { minCgpa: 6.5, branches: [] },
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: 'open',
  });

  // Applications
  await Application.create({
    jobId: job1._id,
    studentId: students[0]._id,
    resumeUrl: students[0].profileId?.resumeUrl || 'https://example.com/resume.pdf',
    status: 'shortlisted',
  });

  await Application.create({
    jobId: job2._id,
    studentId: students[1]._id,
    resumeUrl: 'https://example.com/resume.pdf',
    status: 'applied',
  });

  console.log('\nSeed complete! Demo accounts:');
  console.log('  Teacher:  teacher@demo.com  / password123');
  console.log('  Employer: employer@demo.com / password123');
  console.log('  Students: student1@demo.com ... student5@demo.com / password123');

  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });