import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useUserStore } from '@/store'
import { authService } from '@/services/auth.service'
import { useToast } from './useToast'

export function useAuth() {
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const isLoading = useUserStore((state) => state.isLoading)
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)
  const updateUser = useUserStore((state) => state.updateUser)
  const setLoading = useUserStore((state) => state.setLoading)
  const setError = useUserStore((state) => state.setError)
  const toast = useToast()

  // Listen to auth state changes
  useEffect(() => {
    setLoading(true)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Convert Firebase user to app user
          const userDoc = await authService.getCurrentUser()
          if (userDoc) {
            const appUser = await fetch(
              `https://firestore.googleapis.com/v1/projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${firebaseUser.uid}`
            )
              .then((res) => res.json())
              .then((data) => ({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                firstName: data.fields?.firstName?.stringValue || '',
                lastName: data.fields?.lastName?.stringValue || '',
                middleName: data.fields?.middleName?.stringValue,
                phoneNumber: data.fields?.phoneNumber?.stringValue,
                phoneCountryCode: data.fields?.phoneCountryCode?.stringValue,
                profilePhoto: data.fields?.profilePhoto?.stringValue || firebaseUser.photoURL,
                linkedinUrl: data.fields?.linkedinUrl?.stringValue,
                githubUrl: data.fields?.githubUrl?.stringValue,
                portfolioUrl: data.fields?.portfolioUrl?.stringValue,
                whatsappUrl: data.fields?.whatsappUrl?.stringValue,
                language: (data.fields?.language?.stringValue || 'en') as 'en' | 'tr',
                theme: (data.fields?.theme?.stringValue || 'system') as
                  | 'light'
                  | 'dark'
                  | 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }))
              .catch(() => ({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                firstName: firebaseUser.displayName?.split(' ')[0] || '',
                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                language: 'en' as const,
                theme: 'system' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }))

            setUser(appUser)
          }
        } else {
          clearUser()
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [setUser, clearUser, setLoading, setError])

  // Register
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      const user = await authService.register(email, password, firstName, lastName)
      setUser(user)
      toast.success('Account created!', 'Please verify your email address.')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to register'
      setError(errorMessage)
      toast.error('Registration failed', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const user = await authService.login(email, password)
      setUser(user)
      toast.success('Welcome back!', `Logged in as ${user.email}`)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to login'
      setError(errorMessage)
      toast.error('Login failed', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      const user = await authService.loginWithGoogle()
      setUser(user)
      toast.success('Welcome!', `Logged in with Google`)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to login with Google'
      setError(errorMessage)
      toast.error('Google login failed', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await authService.logout()
      clearUser()
      toast.info('Logged out', 'See you next time!')
    } catch (error: any) {
      toast.error('Logout failed', error.message)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      await authService.resetPassword(email)
      toast.success('Email sent!', 'Check your inbox for password reset link.')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email'
      toast.error('Password reset failed', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Send verification email
  const sendVerificationEmail = async () => {
    try {
      await authService.sendVerificationEmail()
      toast.success('Email sent!', 'Check your inbox for verification link.')
      return { success: true }
    } catch (error: any) {
      toast.error('Failed to send email', error.message)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    sendVerificationEmail,
    updateUser,
    isEmailVerified: authService.isEmailVerified(),
  }
}