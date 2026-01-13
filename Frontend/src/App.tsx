import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomepageRefactored from './imports/HomepageRefactored';
import CourseDetails from './imports/CourseDetails';
import CourseLearning from './imports/CourseLearning';
import CourseSearch from './imports/CourseSearch';

import MainLayout from './components/layout/MainLayout';
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
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomepageRefactored />} />
          <Route path="/courses/:id?" element={<CourseDetails />} />
          <Route path="/search" element={<CourseSearch />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/become-instructor" element={<BecomeInstructorView />} />
          <Route path="/notifications" element={<NotificationsView />} />

          <Route path="/learning/:id?" element={<CourseLearning />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
