import { saveAs } from 'file-saver'

// Download file
export function downloadFile(blob: Blob, fileName: string): void {
  saveAs(blob, fileName)
}

// Download text as file
export function downloadTextAsFile(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadFile(blob, fileName)
}

// Create file from text
export function createFileFromText(text: string, fileName: string, mimeType: string): File {
  const blob = new Blob([text], { type: mimeType })
  return new File([blob], fileName, { type: mimeType })
}

// Read file as text
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

// Read file as data URL
export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

// Get file icon based on type
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    case 'txt':
      return '📃'
    default:
      return '📁'
  }
}