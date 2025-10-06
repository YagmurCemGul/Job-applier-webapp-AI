import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import mammoth from 'mammoth'

// PDF.js worker setup
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`

export interface FileValidationResult {
  valid: boolean
  error?: string
  file?: File
}

export interface ParsedCVData {
  text: string
  metadata: {
    fileName: string
    fileSize: number
    fileType: string
    pageCount?: number
  }
}

class FileService {
  private readonly SUPPORTED_TYPES = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
    TXT: 'text/plain',
  }

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  // Validate file
  validateCVFile(file: File): FileValidationResult {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }

    const validTypes = Object.values(this.SUPPORTED_TYPES)
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload PDF, DOCX, DOC, or TXT',
      }
    }

    return { valid: true, file }
  }

  // Parse PDF
  async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n\n'
      }

      return fullText.trim()
    } catch (error) {
      console.error('PDF parsing error:', error)
      throw new Error('Failed to parse PDF file')
    }
  }

  // Parse DOCX
  async parseDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value.trim()
    } catch (error) {
      console.error('DOCX parsing error:', error)
      throw new Error('Failed to parse DOCX file')
    }
  }

  // Parse TXT
  async parseTXT(file: File): Promise<string> {
    try {
      return await file.text()
    } catch (error) {
      console.error('TXT parsing error:', error)
      throw new Error('Failed to parse TXT file')
    }
  }

  // Main parse method
  async parseCV(file: File): Promise<ParsedCVData> {
    const validation = this.validateCVFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    let text = ''

    switch (file.type) {
      case this.SUPPORTED_TYPES.PDF:
        text = await this.parsePDF(file)
        break
      case this.SUPPORTED_TYPES.DOCX:
      case this.SUPPORTED_TYPES.DOC:
        text = await this.parseDOCX(file)
        break
      case this.SUPPORTED_TYPES.TXT:
        text = await this.parseTXT(file)
        break
      default:
        throw new Error('Unsupported file type')
    }

    return {
      text,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    }
  }
}

export const fileService = new FileService()
