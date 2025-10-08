import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase.config'
import { SharedCV, ShareSettings } from '@/types/share.types'

class ShareService {
  private readonly COLLECTION_NAME = 'shared_cvs'

  // Generate unique share link
  private generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15)
  }

  // Create shareable link
  async createShareLink(
    userId: string,
    cvId: string,
    settings: ShareSettings
  ): Promise<SharedCV> {
    try {
      const shareId = this.generateShareId()
      const shareLink = `${window.location.origin}/cv/${shareId}`
      
      const expiresAt = settings.expiresIn
        ? new Date(Date.now() + settings.expiresIn * 24 * 60 * 60 * 1000)
        : undefined

      const sharedCV: Omit<SharedCV, 'id'> = {
        cvId,
        userId,
        shareLink,
        password: settings.requirePassword ? settings.password : undefined,
        expiresAt,
        viewCount: 0,
        maxViews: settings.maxViews,
        createdAt: new Date(),
        isActive: true,
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...sharedCV,
        createdAt: Timestamp.now(),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
      })

      return {
        id: docRef.id,
        ...sharedCV,
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      throw new Error('Failed to create share link')
    }
  }

  // Get shared CV by link ID
  async getSharedCV(shareId: string): Promise<SharedCV | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('shareLink', '==', `${window.location.origin}/cv/${shareId}`)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      const data = doc.data()

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate(),
      } as SharedCV
    } catch (error) {
      console.error('Error fetching shared CV:', error)
      throw new Error('Failed to fetch shared CV')
    }
  }

  // Increment view count
  async incrementViewCount(shareId: string): Promise<void> {
    try {
      const sharedCV = await this.getSharedCV(shareId)
      if (!sharedCV) return

      const docRef = doc(db, this.COLLECTION_NAME, sharedCV.id)
      await updateDoc(docRef, {
        viewCount: sharedCV.viewCount + 1,
      })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  // Check if share link is valid
  async validateShareLink(shareId: string, password?: string): Promise<boolean> {
    try {
      const sharedCV = await this.getSharedCV(shareId)
      
      if (!sharedCV || !sharedCV.isActive) {
        return false
      }

      // Check expiration
      if (sharedCV.expiresAt && new Date() > sharedCV.expiresAt) {
        return false
      }

      // Check max views
      if (sharedCV.maxViews && sharedCV.viewCount >= sharedCV.maxViews) {
        return false
      }

      // Check password
      if (sharedCV.password && sharedCV.password !== password) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating share link:', error)
      return false
    }
  }

  // Revoke share link
  async revokeShareLink(shareId: string): Promise<void> {
    try {
      const sharedCV = await this.getSharedCV(shareId)
      if (!sharedCV) return

      const docRef = doc(db, this.COLLECTION_NAME, sharedCV.id)
      await updateDoc(docRef, {
        isActive: false,
      })
    } catch (error) {
      console.error('Error revoking share link:', error)
      throw new Error('Failed to revoke share link')
    }
  }

  // Get all share links for a user
  async getUserShareLinks(userId: string): Promise<SharedCV[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate(),
        } as SharedCV
      })
    } catch (error) {
      console.error('Error fetching user share links:', error)
      throw new Error('Failed to fetch share links')
    }
  }
}

export const shareService = new ShareService()
