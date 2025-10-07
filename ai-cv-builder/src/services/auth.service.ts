import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { User } from '@/types/user.types'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

// Convert Firebase User to App User
async function convertFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
  const userData = userDoc.data()

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    firstName: userData?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
    lastName:
      userData?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
    middleName: userData?.middleName,
    phoneNumber: userData?.phoneNumber || firebaseUser.phoneNumber,
    phoneCountryCode: userData?.phoneCountryCode,
    profilePhoto: userData?.profilePhoto || firebaseUser.photoURL,
    linkedinUrl: userData?.linkedinUrl,
    githubUrl: userData?.githubUrl,
    portfolioUrl: userData?.portfolioUrl,
    whatsappUrl: userData?.whatsappUrl,
    language: userData?.language || 'en',
    theme: userData?.theme || 'system',
    createdAt: userData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: userData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }
}

// Create user document in Firestore
async function createUserDocument(firebaseUser: FirebaseUser, additionalData?: Partial<User>) {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    const userData = {
      email: firebaseUser.email,
      firstName: additionalData?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
      lastName:
        additionalData?.lastName ||
        firebaseUser.displayName?.split(' ').slice(1).join(' ') ||
        '',
      middleName: additionalData?.middleName || null,
      phoneNumber: additionalData?.phoneNumber || null,
      phoneCountryCode: additionalData?.phoneCountryCode || null,
      profilePhoto: additionalData?.profilePhoto || firebaseUser.photoURL || null,
      linkedinUrl: additionalData?.linkedinUrl || null,
      githubUrl: additionalData?.githubUrl || null,
      portfolioUrl: additionalData?.portfolioUrl || null,
      whatsappUrl: additionalData?.whatsappUrl || null,
      language: additionalData?.language || 'en',
      theme: additionalData?.theme || 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(userRef, userData)
  }
}

export const authService = {
  // Register with email and password
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      })

      // Send email verification
      await sendEmailVerification(firebaseUser)

      // Create user document
      await createUserDocument(firebaseUser, { firstName, lastName })

      // Convert to app user
      return await convertFirebaseUser(firebaseUser)
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.message || 'Failed to register')
    }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return await convertFirebaseUser(userCredential.user)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Failed to login')
    }
  },

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
      const firebaseUser = userCredential.user

      // Create user document if it doesn't exist
      await createUserDocument(firebaseUser)

      return await convertFirebaseUser(firebaseUser)
    } catch (error: any) {
      console.error('Google login error:', error)
      throw new Error(error.message || 'Failed to login with Google')
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error('Logout error:', error)
      throw new Error(error.message || 'Failed to logout')
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Password reset error:', error)
      throw new Error(error.message || 'Failed to send password reset email')
    }
  },

  // Send email verification
  async sendVerificationEmail(): Promise<void> {
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
      } else {
        throw new Error('No user logged in')
      }
    } catch (error: any) {
      console.error('Email verification error:', error)
      throw new Error(error.message || 'Failed to send verification email')
    }
  },

  // Update user profile
  async updateUserProfile(updates: Partial<User>): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')

      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      // Update Firebase Auth profile if needed
      if (updates.firstName || updates.lastName) {
        await updateProfile(user, {
          displayName: `${updates.firstName || ''} ${updates.lastName || ''}`.trim(),
        })
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw new Error(error.message || 'Failed to update profile')
    }
  },

  // Update email
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')

      await updateEmail(user, newEmail)
      await sendEmailVerification(user)

      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: serverTimestamp(),
      })
    } catch (error: any) {
      console.error('Update email error:', error)
      throw new Error(error.message || 'Failed to update email')
    }
  },

  // Update password
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')

      await updatePassword(user, newPassword)
    } catch (error: any) {
      console.error('Update password error:', error)
      throw new Error(error.message || 'Failed to update password')
    }
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  },

  // Check if email is verified
  isEmailVerified(): boolean {
    return auth.currentUser?.emailVerified || false
  },
}