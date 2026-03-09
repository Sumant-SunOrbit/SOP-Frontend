import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout'; 
import ErrorBoundary from './components/shared/ErrorBoundary'; 
import { NotificationProvider } from './context/NotificationContext';

// --- AUTH PAGES ---
// 🟢 FIXED: Changed '../pages' to './pages'
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword'; 
import ResetPassword from './pages/auth/ResetPassword';

// --- ADMIN PAGES ---
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageHODs from './pages/admin/ManageHODs';

// --- HOD PAGES ---
import HodDashboard from './pages/hod/HodDashboard';
import ManageCourses from './pages/hod/ManageCourses'; 
import CreateExamWizard from './pages/hod/CreateExamWizard'; 
import ManageExams from './pages/hod/ManageExams'; 
import AssignPage from './pages/hod/AssignPage'; 
import CertificateDesigner from './pages/hod/CertificateDesigner';
import BulkUserUpload from './pages/hod/BulkUserUpload';

// --- USER PAGES ---
import UserDashboard from './pages/user/UserDashboard';
import MyCourses from './pages/user/MyCourses'; 
import CourseViewer from './pages/user/CourseViewer';
import TestEngine from './pages/user/TestEngine';
import ExamResult from './pages/user/ExamResult';
import MyExams from './pages/user/MyExams';

function App() {
  return (
    <NotificationProvider>
    <AuthProvider>
      <ThemeProvider>
        <Router basename="/sop">
          <Routes>
            
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/departments" element={<ManageDepartments />} />
                <Route path="/admin/hods" element={<ManageHODs />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
                <Route path="/hod/dashboard" element={<HodDashboard />} />
                <Route path="/hod/courses" element={<ManageCourses />} />
                <Route path="/hod/create-exam" element={<CreateExamWizard />} />
                <Route path="/hod/exams" element={<ManageExams />} />
                <Route path="/hod/assign/exam" element={<AssignPage type="exam" />} />
                <Route path="/hod/assign/course" element={<AssignPage type="course" />} />
                <Route path="/hod/exam/:examId/certificate" element={<CertificateDesigner />} />
                <Route path="/hod/bulk-users" element={<BulkUserUpload />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['User']} />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/my-exams" element={<MyExams />} />
                <Route path="/my-courses" element={<MyCourses />} />
              </Route>
            </Route>

            {/* FULL-SCREEN ROUTES (NO SIDEBAR / NO HEADER) */}
            <Route element={<ProtectedRoute allowedRoles={['User']} />}>
                <Route path="/course/:courseId" element={<CourseViewer />} />
                
                {/* WRAP TEST ENGINE IN ERROR BOUNDARY */}
                <Route path="/exam/:examId" element={
                    <ErrorBoundary>
                        <TestEngine />
                    </ErrorBoundary>
                } />
                
                <Route path="/result/:attemptId" element={<ExamResult />} />
            </Route>

          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;