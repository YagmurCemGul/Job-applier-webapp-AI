import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import mammoth from 'mammoth'

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`

export interface FileValidationResult {
  valid: boolean
  error?: string
  file?: File
}

export interface ParsedCVData {
  text: string
  metadata?: {
    fileName: string
    fileSize: number
    fileType: string
    pageCount?: number
  }
}

class FileService {
  // Supported file types
  private readonly SUPPORTED_TYPES = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
    TXT: 'text/plain',
  }

  // Max file size (5MB)
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024

  // Validate CV file
  validateCVFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File is too large. Maximum size is ${this.formatFileSize(this.MAX_FILE_SIZE)}.`,
      }
    }

    // Check file type
    const validTypes = Object.values(this.SUPPORTED_TYPES)
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.',
      }
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['pdf', 'docx', 'doc', 'txt']
    if (!extension || !validExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Invalid file extension.',
      }
    }

    return { valid: true, file }
  }

  // Parse PDF file
  async parsePDF(file: File): Promise<ParsedCVData> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise
      
      let fullText = ''
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }

      return {
        text: fullText.trim(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          pageCount: pdf.numPages,
        },
      }
    } catch (error) {
      console.error('PDF parsing error:', error)
      throw new Error('Failed to parse PDF file. The file may be corrupted or password-protected.')
    }
  }

  // Parse DOCX file
  async parseDOCX(file: File): Promise<ParsedCVData> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      
      return {
        text: result.value.trim(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      }
    } catch (error) {
      console.error('DOCX parsing error:', error)
      throw new Error('Failed to parse DOCX file. The file may be corrupted.')
    }
  }

  // Parse TXT file
  async parseTXT(file: File): Promise<ParsedCVData> {
    try {
      const text = await file.text()
      
      return {
        text: text.trim(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      }
    } catch (error) {
      console.error('TXT parsing error:', error)
      throw new Error('Failed to parse TXT file.')
    }
  }

  // Parse CV file (auto-detect type)
  async parseCV(file: File): Promise<ParsedCVData> {
    const validation = this.validateCVFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    switch (file.type) {
      case this.SUPPORTED_TYPES.PDF:
        return this.parsePDF(file)
      
      case this.SUPPORTED_TYPES.DOCX:
      case this.SUPPORTED_TYPES.DOC:
        return this.parseDOCX(file)
      
      case this.SUPPORTED_TYPES.TXT:
        return this.parseTXT(file)
      
      default:
        throw new Error('Unsupported file type')
    }
  }

  // Format file size
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  // Get file extension
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || ''
  }

  // Check if file is PDF
  isPDF(file: File): boolean {
    return file.type === this.SUPPORTED_TYPES.PDF
  }

  // Check if file is DOCX
  isDOCX(file: File): boolean {
    return (
      file.type === this.SUPPORTED_TYPES.DOCX || file.type === this.SUPPORTED_TYPES.DOC
    )
  }

  // Check if file is TXT
  isTXT(file: File): boolean {
    return file.type === this.SUPPORTED_TYPES.TXT
  }
}

export const fileService = new FileService()