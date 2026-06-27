# 🚀 PlaceMint – Campus Placement Management Platform

PlaceMint is a full-stack web application that streamlines the campus recruitment process by connecting **Students**, **Placement Officers**, and **Recruiters** on a single platform. It automates job postings, student applications, profile management, resume uploads, and application tracking through secure role-based authentication.

---

## 📌 Features

### 👨‍🎓 Student Portal
- User Registration & Login (JWT Authentication)
- Create and Update Student Profile
- Upload Resume (Cloudinary)
- Browse Available Jobs
- Apply for Jobs
- Track Application Status

### 👨‍💼 Recruiter Portal
- Secure Login
- Post New Jobs
- Manage Job Listings
- View Applicants
- Shortlist / Reject / Select Candidates
- Send Email Invitations to Students

### 👨‍🏫 Placement Officer Portal
- Manage Student Profiles
- Track All Applications
- Filter Applications by Branch & Status
- Send Placement Invitations

---

## 🛠 Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js
- Express Validator

### Database
- MongoDB Atlas
- Mongoose

### Cloud & Integrations
- Cloudinary (Resume Uploads)
- Nodemailer (Email Invitations)

---

## 📂 Project Structure

```
PlaceMint
│
├── client
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── hooks
│   │   ├── context
│   │   └── api
│   └── package.json
│
├── server
│   ├── config
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── .env
│   └── index.js
│
└── README.md
```

---

## 📊 Database Models

- User
- Profile
- Job
- Application
- Invitation
- Notification

---

## 🔐 Authentication

- JWT Based Authentication
- Password Hashing using bcrypt
- Role-Based Authorization
- Protected Routes

## 📧 Email Features

- Student Invitation Emails
- Job Notification Emails
- Secure Invitation Links

---

## ☁ Cloud Features

- Resume Upload using Cloudinary
- Secure Resume Storage
- Resume URL stored in MongoDB

---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/placemint.git
```

### Install Backend

```bash
cd server
npm install
```

### Install Frontend

```bash
cd ../client
npm install
```

---

## Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5000

MONGODB_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

GMAIL_USER=

GMAIL_APP_PASSWORD=

CLIENT_URL=http://localhost:3000
```

---

## ▶ Running the Project

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm start
```

---

## 📈 Future Enhancements

- Real-Time Notifications using Socket.io
- Company Verification
- Interview Scheduling
- AI Resume Screening
- Skill Recommendation System
- Analytics Dashboard
- Email Templates
- Dark Mode
- Multi-College Support

---



---
