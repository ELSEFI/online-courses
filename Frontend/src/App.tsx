import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomepageRefactored from './imports/HomepageRefactored';
import CourseDetails from './imports/CourseDetails';
import CourseLearning from './imports/CourseLearning';
import CourseSearch from './imports/CourseSearch';
import QuizPreview from './pages/quiz/QuizPreview';
import QuizTake from './pages/quiz/QuizTake';
import QuizResults from './pages/quiz/QuizResults';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { BecomeInstructorView, NotificationsView } from './imports/PlaceholderViews';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useGetMeQuery } from './store/api/userApi';
import { setCheckingAuth } from './store/slices/authSlice';
import { useEffect } from 'react';

// Dashboard Pages
import Profile from './pages/dashboard/Profile';
import MyCourses from './pages/dashboard/MyCourses';
import Wishlist from './pages/dashboard/Wishlist';
import Settings from './pages/dashboard/Settings';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResendVerification from './pages/auth/ResendVerification';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInstructors from './pages/admin/AdminInstructors';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests';
import AdminMessages from './pages/admin/AdminMessages';
import CourseContent from './pages/admin/CourseContent';

function App() {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Run the getMe query on mount if token exists to verify session
  const { isFetching } = useGetMeQuery(undefined, {
    skip: !token,
    // Ensure it refetches on mount if we're not sure
    refetchOnMountOrArgChange: true
  });

  useEffect(() => {
    // Once fetch is done (either success or error), we stop the global auth check
    if (!isFetching) {
      dispatch(setCheckingAuth(false));
    }
  }, [isFetching, dispatch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Standalone Auth Route - No Layout/Navbar */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomepageRefactored />} />
          <Route path="/courses/:id?" element={<CourseDetails />} />
          <Route path="/search" element={<CourseSearch />} />

          {/* Protected Routes */}
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/become-instructor" element={<ProtectedRoute><BecomeInstructorView /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsView /></ProtectedRoute>} />
          <Route path="/learn/:courseSlug" element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
          <Route path="/learn/:courseSlug/quiz/:quizId" element={<ProtectedRoute><QuizPreview /></ProtectedRoute>} />
          <Route path="/learn/:courseSlug/quiz/:quizId/take" element={<ProtectedRoute><QuizTake /></ProtectedRoute>} />
          <Route path="/learn/:courseSlug/quiz/:quizId/results/:attemptId" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
        </Route>

        {/* Admin Routes - Separate Layout */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseSlug/content" element={<CourseContent />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
