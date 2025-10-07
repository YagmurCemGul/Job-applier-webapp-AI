import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/config/firebase'
import { updateProfile } from 'firebase/auth'
import { User, UserProfileForm } from '@/types/user.types'

export const userService = {
  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return null
      }

      const data = userDoc.data()
      return {
        id: userDoc.id,
        email: data.email || '',
        firstName: data.firstName || '',
        middleName: data.middleName,
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber,
        phoneCountryCode: data.phoneCountryCode,
        profilePhoto: data.profilePhoto,
        bio: data.bio,
        location: data.location,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        whatsappUrl: data.whatsappUrl,
        language: data.language || 'en',
        theme: data.theme || 'system',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        emailVerified: data.emailVerified || false,
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString(),
        loginCount: data.loginCount || 0,
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, data: Partial<UserProfileForm>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      
      // Update Firestore
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      // Update Firebase Auth display name if first/last name changed
      const currentUser = auth.currentUser
      if (currentUser && (data.firstName || data.lastName)) {
        const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
        await updateProfile(currentUser, { displayName })
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Format LinkedIn URL
  formatLinkedInURL(input: string): string {
    if (!input) return ''
    const prefix = 'https://www.linkedin.com/in/'
    
    // If already a full URL, return as is
    if (input.startsWith('http')) return input
    
    // If starts with linkedin.com, add https://
    if (input.startsWith('linkedin.com')) return 'https://' + input
    
    // Otherwise, assume it's just the username
    return prefix + input.replace(/^\//, '')
  },

  // Format GitHub URL
  formatGitHubURL(input: string): string {
    if (!input) return ''
    const prefix = 'https://github.com/'
    
    // If already a full URL, return as is
    if (input.startsWith('http')) return input
    
    // If starts with github.com, add https://
    if (input.startsWith('github.com')) return 'https://' + input
    
    // Otherwise, assume it's just the username
    return prefix + input.replace(/^\//, '')
  },

  // Format WhatsApp URL
  formatWhatsAppURL(phoneNumber: string): string {
    if (!phoneNumber) return ''
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    return `https://wa.me/${cleaned}`
  },

  // Validate email (basic check - real validation would use an API)
  async validateEmail(email: string): Promise<boolean> {
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
}