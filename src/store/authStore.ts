import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase.config'
import { User, LoginCredentials, SignupCredentials } from '@/types/auth.types'

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean

  // Actions
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: SignupCredentials) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  initializeAuth: () => void
  setError: (error: string | null) => void
}

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
  createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
  lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  provider: firebaseUser.providerData[0]?.providerId.includes('google')
    ? 'google'
    : firebaseUser.providerData[0]?.providerId.includes('github')
      ? 'github'
      : 'email',
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      initialized: false,

      initializeAuth: () => {
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            set({
              user: mapFirebaseUser(firebaseUser),
              loading: false,
              initialized: true,
            })
          } else {
            set({ user: null, loading: false, initialized: true })
          }
        })
      },

      signIn: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )
          set({
            user: mapFirebaseUser(userCredential.user),
            loading: false,
          })
        } catch (error: any) {
          const errorMessage =
            error.code === 'auth/user-not-found'
              ? 'No account found with this email'
              : error.code === 'auth/wrong-password'
                ? 'Incorrect password'
                : error.code === 'auth/invalid-email'
                  ? 'Invalid email address'
                  : 'Failed to sign in. Please try again.'

          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      signUp: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )

          await updateProfile(userCredential.user, {
            displayName: credentials.displayName,
          })

          set({
            user: mapFirebaseUser(userCredential.user),
            loading: false,
          })
        } catch (error: any) {
          const errorMessage =
            error.code === 'auth/email-already-in-use'
              ? 'An account with this email already exists'
              : error.code === 'auth/weak-password'
                ? 'Password should be at least 6 characters'
                : error.code === 'auth/invalid-email'
                  ? 'Invalid email address'
                  : 'Failed to create account. Please try again.'

          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true, error: null })
        try {
          const provider = new GoogleAuthProvider()
          const userCredential = await signInWithPopup(auth, provider)
          set({
            user: mapFirebaseUser(userCredential.user),
            loading: false,
          })
        } catch (error: any) {
          const errorMessage =
            error.code === 'auth/popup-closed-by-user'
              ? 'Sign in cancelled'
              : error.code === 'auth/account-exists-with-different-credential'
                ? 'An account already exists with this email'
                : 'Failed to sign in with Google'

          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      signInWithGithub: async () => {
        set({ loading: true, error: null })
        try {
          const provider = new GithubAuthProvider()
          const userCredential = await signInWithPopup(auth, provider)
          set({
            user: mapFirebaseUser(userCredential.user),
            loading: false,
          })
        } catch (error: any) {
          const errorMessage =
            error.code === 'auth/popup-closed-by-user'
              ? 'Sign in cancelled'
              : error.code === 'auth/account-exists-with-different-credential'
                ? 'An account already exists with this email'
                : 'Failed to sign in with GitHub'

          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      signOut: async () => {
        set({ loading: true, error: null })
        try {
          await firebaseSignOut(auth)
          set({ user: null, loading: false })
        } catch (error) {
          set({ error: 'Failed to sign out', loading: false })
          throw error
        }
      },

      resetPassword: async (email) => {
        set({ loading: true, error: null })
        try {
          await sendPasswordResetEmail(auth, email)
          set({ loading: false })
        } catch (error: any) {
          const errorMessage =
            error.code === 'auth/user-not-found'
              ? 'No account found with this email'
              : 'Failed to send reset email'

          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      updateUserProfile: async (displayName, photoURL) => {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error('No user logged in')

        set({ loading: true, error: null })
        try {
          await updateProfile(currentUser, { displayName, photoURL })
          set({
            user: mapFirebaseUser(currentUser),
            loading: false,
          })
        } catch (error) {
          set({ error: 'Failed to update profile', loading: false })
          throw error
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
