import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ROUTES } from '@/lib/constants'

// Pages
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import RegisterPage from '@/pages/Register'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import DashboardPage from '@/pages/Dashboard'
import CVBuilderPage from '@/pages/CVBuilder'
import CoverLetterPage from '@/pages/CoverLetter'
import JobListingsPage from '@/pages/JobListings'
import JobsPage from '@/pages/Jobs'
import ApplicationsPage from '@/pages/Applications'
import OutboxPage from '@/pages/Outbox'
import InterviewsPage from '@/pages/Interviews'
import InterviewDetailPage from '@/components/interview/InterviewDetail'
import OffersPage from '@/pages/Offers'
import OfferDetailPage from '@/components/offer/OfferDetail'
import OnboardingPage from '@/pages/Onboarding'
import ReviewsPage from '@/pages/Reviews'
import ProfilePage from '@/pages/Profile'
import SettingsPage from '@/pages/Settings'
import NotFoundPage from '@/pages/NotFound'

export const router = createBrowserRouter([
  // Public auth routes (no layout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // Protected routes with layout
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CV_BUILDER,
        element: (
          <ProtectedRoute>
            <CVBuilderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.COVER_LETTER,
        element: (
          <ProtectedRoute>
            <CoverLetterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.JOBS,
        element: (
          <ProtectedRoute>
            <JobListingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/jobs-finder',
        element: (
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/applications',
        element: (
          <ProtectedRoute>
            <ApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/outreach',
        element: (
          <ProtectedRoute>
            <OutboxPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/interviews',
        element: (
          <ProtectedRoute>
            <InterviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/interviews/:id',
        element: (
          <ProtectedRoute>
            <InterviewDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/offers',
        element: (
          <ProtectedRoute>
            <OffersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/offers/:id',
        element: (
          <ProtectedRoute>
            <OfferDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/onboarding/:id',
        element: (
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/reviews/:id',
        element: (
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
])
