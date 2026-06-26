import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const StudentDashboard  = lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard  = lazy(() => import('./pages/TeacherDashboard'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const Jobs              = lazy(() => import('./pages/Jobs'));
const JobDetail         = lazy(() => import('./pages/JobDetails'));
const MyApplications    = lazy(() => import('./pages/MyApplications'));
const Profile           = lazy(() => import('./pages/Profile'));
const PostJob           = lazy(() => import('./pages/PostJob'));

const Spinner = () => <div style={{ textAlign:'center', paddingTop: 80, color:'#aaa' }}>Loading…</div>;

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f7' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout><StudentDashboard/></Layout></ProtectedRoute>}/>
            <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><Layout><TeacherDashboard/></Layout></ProtectedRoute>}/>
            <Route path="/employer" element={<ProtectedRoute roles={['employer']}><Layout><EmployerDashboard/></Layout></ProtectedRoute>}/>
            <Route path="/jobs" element={<ProtectedRoute><Layout><Jobs/></Layout></ProtectedRoute>}/>
            <Route path="/jobs/new" element={<ProtectedRoute roles={['employer','teacher']}><Layout><PostJob/></Layout></ProtectedRoute>}/>
            <Route path="/jobs/:id" element={<ProtectedRoute><Layout><JobDetail/></Layout></ProtectedRoute>}/>
            <Route path="/my-applications" element={<ProtectedRoute roles={['student']}><Layout><MyApplications/></Layout></ProtectedRoute>}/>
            <Route path="/profile" element={<ProtectedRoute roles={['student']}><Layout><Profile/></Layout></ProtectedRoute>}/>

            <Route path="/accept-invite/:token" element={<Spinner/>}/>
            <Route path="/invite-invalid"  element={<div style={{textAlign:'center',paddingTop:80}}><h2>Invalid invitation link</h2></div>}/>
            <Route path="/invite-expired"  element={<div style={{textAlign:'center',paddingTop:80}}><h2>Invitation expired</h2><p style={{color:'#999',marginTop:8}}>Contact your placement officer for a new one.</p></div>}/>

            <Route path="/"  element={<Navigate to="/login" replace />} />
            <Route path="*"  element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}