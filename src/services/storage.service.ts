import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage'
import { storage } from '@/config/firebase'

export interface UploadProgress {
  progress: number
  bytesTransferred: number
  totalBytes: number
}

export const storageService = {
  // Upload file with progress
  uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    if (!storage) throw new Error('Firebase Storage not initialized')

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path)
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
            })
          }
        },
        (error) => {
          console.error('Upload error:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            reject(error)
          }
        }
      )
    })
  },

  // Upload image (simpler version without progress)
  async uploadImage(file: File, path: string): Promise<string> {
    if (!storage) throw new Error('Firebase Storage not initialized')

    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  },

  // Delete file
  async deleteFile(path: string): Promise<void> {
    if (!storage) throw new Error('Firebase Storage not initialized')

    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  },

  // Get download URL
  async getDownloadURL(path: string): Promise<string> {
    if (!storage) throw new Error('Firebase Storage not initialized')

    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('Get URL error:', error)
      throw error
    }
  },

  // Generate storage path for user avatar
  getUserAvatarPath(userId: string, fileName: string): string {
    const timestamp = Date.now()
    const extension = fileName.split('.').pop()
    return `users/${userId}/avatar/${timestamp}.${extension}`
  },

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.',
      }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File is too large. Maximum size is 5MB.',
      }
    }

    return { valid: true }
  },

  // Convert base64 to blob
  base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    const byteString = atob(base64.split(',')[1])
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeType })
  },

  // Convert blob to file
  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type })
  },
}
