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

function App() {

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
      </Routes>
    </>
  );
}

export default App;
