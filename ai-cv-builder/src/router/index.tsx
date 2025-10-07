import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ROUTES } from '@/lib/constants'

// Pages
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import DashboardPage from '@/pages/Dashboard'
import CVBuilderPage from '@/pages/CVBuilder'
import CoverLetterPage from '@/pages/CoverLetter'
import JobListingsPage from '@/pages/JobListings'
import ProfilePage from '@/pages/Profile'
import SettingsPage from '@/pages/Settings'
import NotFoundPage from '@/pages/NotFound'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
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
