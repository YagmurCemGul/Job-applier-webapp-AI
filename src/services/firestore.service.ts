import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase.config'
import { SavedCV } from '@/types/savedCV.types'

class FirestoreService {
  private readonly COLLECTION_NAME = 'cvs'

  // Helper to convert Firestore timestamp to Date
  private timestampToDate(timestamp: any): Date {
    if (timestamp?.toDate) {
      return timestamp.toDate()
    }
    if (timestamp instanceof Date) {
      return timestamp
    }
    return new Date(timestamp)
  }

  // Helper to convert SavedCV to Firestore format
  private toFirestore(cv: SavedCV, userId: string): any {
    return {
      ...cv,
      userId,
      createdAt: Timestamp.fromDate(cv.createdAt),
      lastModified: Timestamp.fromDate(cv.lastModified),
      cvData: {
        ...cv.cvData,
        createdAt: Timestamp.fromDate(cv.cvData.createdAt),
        updatedAt: Timestamp.fromDate(cv.cvData.updatedAt),
        experience: (cv.cvData.experience || []).map((exp) => ({
          ...exp,
          startDate: Timestamp.fromDate(exp.startDate),
          endDate: exp.endDate ? Timestamp.fromDate(exp.endDate) : null,
        })),
        education: (cv.cvData.education || []).map((edu) => ({
          ...edu,
          startDate: Timestamp.fromDate(edu.startDate),
          endDate: edu.endDate ? Timestamp.fromDate(edu.endDate) : null,
        })),
      },
    }
  }

  // Helper to convert from Firestore format
  private fromFirestore(data: any): SavedCV {
    return {
      ...data,
      createdAt: this.timestampToDate(data.createdAt),
      lastModified: this.timestampToDate(data.lastModified),
      cvData: {
        ...data.cvData,
        createdAt: this.timestampToDate(data.cvData.createdAt),
        updatedAt: this.timestampToDate(data.cvData.updatedAt),
        experience: (data.cvData.experience || []).map((exp: any) => ({
          ...exp,
          startDate: this.timestampToDate(exp.startDate),
          endDate: exp.endDate ? this.timestampToDate(exp.endDate) : undefined,
        })),
        education: (data.cvData.education || []).map((edu: any) => ({
          ...edu,
          startDate: this.timestampToDate(edu.startDate),
          endDate: edu.endDate ? this.timestampToDate(edu.endDate) : undefined,
        })),
      },
    }
  }

  // Save CV to Firestore
  async saveCV(userId: string, cv: SavedCV): Promise<string> {
    try {
      const cvRef = doc(db, this.COLLECTION_NAME, cv.id)
      const cvData = this.toFirestore(cv, userId)
      await setDoc(cvRef, cvData, { merge: true })
      return cv.id
    } catch (error) {
      console.error('Error saving CV:', error)
      throw new Error('Failed to save CV to cloud')
    }
  }

  // Get all CVs for a user
  async getUserCVs(userId: string): Promise<SavedCV[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('lastModified', 'desc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return this.fromFirestore({ ...data, id: doc.id })
      })
    } catch (error) {
      console.error('Error fetching CVs:', error)
      throw new Error('Failed to fetch CVs from cloud')
    }
  }

  // Get single CV by ID
  async getCVById(cvId: string): Promise<SavedCV | null> {
    try {
      const cvRef = doc(db, this.COLLECTION_NAME, cvId)
      const cvDoc = await getDoc(cvRef)

      if (!cvDoc.exists()) {
        return null
      }

      return this.fromFirestore({ ...cvDoc.data(), id: cvDoc.id })
    } catch (error) {
      console.error('Error fetching CV:', error)
      throw new Error('Failed to fetch CV from cloud')
    }
  }

  // Update CV
  async updateCV(cvId: string, updates: Partial<SavedCV>): Promise<void> {
    try {
      const cvRef = doc(db, this.COLLECTION_NAME, cvId)
      const updateData = {
        ...updates,
        lastModified: Timestamp.now(),
      }
      await updateDoc(cvRef, updateData)
    } catch (error) {
      console.error('Error updating CV:', error)
      throw new Error('Failed to update CV in cloud')
    }
  }

  // Delete CV
  async deleteCV(cvId: string): Promise<void> {
    try {
      const cvRef = doc(db, this.COLLECTION_NAME, cvId)
      await deleteDoc(cvRef)
    } catch (error) {
      console.error('Error deleting CV:', error)
      throw new Error('Failed to delete CV from cloud')
    }
  }

  // Batch sync CVs (for initial sync or bulk operations)
  async syncCVs(userId: string, cvs: SavedCV[]): Promise<void> {
    try {
      const batch = writeBatch(db)

      cvs.forEach((cv) => {
        const cvRef = doc(db, this.COLLECTION_NAME, cv.id)
        batch.set(cvRef, this.toFirestore(cv, userId))
      })

      await batch.commit()
    } catch (error) {
      console.error('Error syncing CVs:', error)
      throw new Error('Failed to sync CVs to cloud')
    }
  }

  // Check if user has any CVs in cloud
  async hasCloudCVs(userId: string): Promise<boolean> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking cloud CVs:', error)
      return false
    }
  }
}

export const firestoreService = new FirestoreService()
