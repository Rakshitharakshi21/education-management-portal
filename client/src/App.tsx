import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import AdminLayout from './layouts/AdminLayout';

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAFAF7' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, border: '3px solid #E2E8F0',
        borderTop: '3px solid #2563EB', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B', fontSize: '0.9rem' }}>Loading...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Public pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const CoursesPage = lazy(() => import('./pages/public/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/public/CourseDetailPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentCourses = lazy(() => import('./pages/student/StudentCourses'));
const StudentAssignments = lazy(() => import('./pages/student/StudentAssignments'));
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'));
const StudentExams = lazy(() => import('./pages/student/StudentExams'));
const StudentGrades = lazy(() => import('./pages/student/StudentGrades'));
const StudentProgress = lazy(() => import('./pages/student/StudentProgress'));

// Teacher pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'));
const TeacherClasses = lazy(() => import('./pages/teacher/TeacherClasses'));
const TeacherStudents = lazy(() => import('./pages/teacher/TeacherStudents'));
const TeacherAttendance = lazy(() => import('./pages/teacher/TeacherAttendance'));
const TeacherAssignments = lazy(() => import('./pages/teacher/TeacherAssignments'));
const TeacherExams = lazy(() => import('./pages/teacher/TeacherExams'));
const TeacherAnalytics = lazy(() => import('./pages/teacher/TeacherAnalytics'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminClasses = lazy(() => import('./pages/admin/AdminClasses'));
const AdminAssignments = lazy(() => import('./pages/admin/AdminAssignments'));
const AdminExams = lazy(() => import('./pages/admin/AdminExams'));
const AdminGrades = lazy(() => import('./pages/admin/AdminGrades'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminAIInsights = lazy(() => import('./pages/admin/AdminAIInsights'));

// Protected route wrappers
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <>{children}</>;
};

const RedirectToDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated && user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return null;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="progress" element={<StudentProgress />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="exams" element={<TeacherExams />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="assignments" element={<AdminAssignments />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="grades" element={<AdminGrades />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="ai-insights" element={<AdminAIInsights />} />
        </Route>

        {/* Redirect based on auth state */}
        <Route path="/dashboard" element={<ProtectedRoute><RedirectToDashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#E2E8F0', margin: 0 }}>404</h1>
              <p style={{ color: '#64748B', margin: '8px 0 24px' }}>Page not found.</p>
              <a href="/" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>← Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
