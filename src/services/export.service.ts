import { jsPDF } from 'jspdf'
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx'
import { saveAs } from 'file-saver'

export type ExportFormat = 'pdf' | 'docx' | 'txt'

interface ExportOptions {
  format: ExportFormat
  fileName?: string
  content: string
  metadata?: {
    title?: string
    author?: string
    subject?: string
  }
}

class ExportService {
  // Export as PDF
  async exportAsPDF(content: string, fileName: string = 'cv.pdf'): Promise<void> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Set font
      doc.setFont('helvetica')
      doc.setFontSize(11)

      // Page settings
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const lineHeight = 7
      const maxWidth = pageWidth - 2 * margin

      let yPosition = margin

      // Split content into lines
      const lines = content.split('\n')

      lines.forEach((line) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        // Handle different text styles
        if (line.startsWith('# ')) {
          // Main header
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          const text = line.replace(/^#\s*/, '')
          doc.text(text, margin, yPosition, { maxWidth })
          yPosition += lineHeight * 1.5
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
        } else if (line.startsWith('## ')) {
          // Sub header
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          const text = line.replace(/^##\s*/, '')
          doc.text(text, margin, yPosition, { maxWidth })
          yPosition += lineHeight * 1.3
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
        } else if (line.startsWith('### ')) {
          // Small header
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          const text = line.replace(/^###\s*/, '')
          doc.text(text, margin, yPosition, { maxWidth })
          yPosition += lineHeight * 1.2
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
        } else if (line.match(/^\*\*.*\*\*$/)) {
          // Bold text (between **)
          doc.setFont('helvetica', 'bold')
          const text = line.replace(/\*\*/g, '')
          const splitText = doc.splitTextToSize(text, maxWidth)
          doc.text(splitText, margin, yPosition)
          yPosition += lineHeight * splitText.length
          doc.setFont('helvetica', 'normal')
        } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          // Bullet point
          const text = line.replace(/^[\s]*[•-]\s*/, '')
          const splitText = doc.splitTextToSize(text, maxWidth - 5)
          doc.text('• ', margin + 2, yPosition)
          doc.text(splitText, margin + 7, yPosition)
          yPosition += lineHeight * splitText.length
        } else if (line.trim() === '') {
          // Empty line
          yPosition += lineHeight * 0.5
        } else {
          // Regular text
          const splitText = doc.splitTextToSize(line, maxWidth)
          doc.text(splitText, margin, yPosition)
          yPosition += lineHeight * splitText.length
        }
      })

      // Save the PDF
      doc.save(fileName)
    } catch (error) {
      console.error('PDF export error:', error)
      throw new Error('Failed to export as PDF')
    }
  }

  // Export as DOCX
  async exportAsDOCX(content: string, fileName: string = 'cv.docx'): Promise<void> {
    try {
      const paragraphs: Paragraph[] = []

      // Split content into lines
      const lines = content.split('\n')

      lines.forEach((line) => {
        if (line.startsWith('# ')) {
          // Main heading
          paragraphs.push(
            new Paragraph({
              text: line.replace(/^#\s*/, ''),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            })
          )
        } else if (line.startsWith('## ')) {
          // Sub heading
          paragraphs.push(
            new Paragraph({
              text: line.replace(/^##\s*/, ''),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          )
        } else if (line.startsWith('### ')) {
          // Small heading
          paragraphs.push(
            new Paragraph({
              text: line.replace(/^###\s*/, ''),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 160, after: 80 },
            })
          )
        } else if (line.match(/^\*\*.*\*\*$/)) {
          // Bold text
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.replace(/\*\*/g, ''),
                  bold: true,
                }),
              ],
              spacing: { before: 120, after: 60 },
            })
          )
        } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          // Bullet point
          paragraphs.push(
            new Paragraph({
              text: line.replace(/^[\s]*[•-]\s*/, ''),
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
            })
          )
        } else if (line.trim() === '') {
          // Empty line
          paragraphs.push(new Paragraph({ text: '' }))
        } else {
          // Regular text
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: { before: 60, after: 60 },
            })
          )
        }
      })

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      })

      // Generate and save the document
      const blob = await Packer.toBlob(doc)
      saveAs(blob, fileName)
    } catch (error) {
      console.error('DOCX export error:', error)
      throw new Error('Failed to export as DOCX')
    }
  }

  // Export as TXT
  async exportAsTXT(content: string, fileName: string = 'cv.txt'): Promise<void> {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, fileName)
    } catch (error) {
      console.error('TXT export error:', error)
      throw new Error('Failed to export as TXT')
    }
  }

  // Export to Google Docs (opens in new tab)
  exportToGoogleDocs(content: string): void {
    try {
      const encodedContent = encodeURIComponent(content)
      const googleDocsUrl = `https://docs.google.com/document/create?title=My%20CV&body=${encodedContent}`
      window.open(googleDocsUrl, '_blank')
    } catch (error) {
      console.error('Google Docs export error:', error)
      throw new Error('Failed to export to Google Docs')
    }
  }

  // Generate professional file name
  generateFileName(
    format: ExportFormat,
    metadata?: { firstName?: string; lastName?: string; jobTitle?: string }
  ): string {
    const timestamp = new Date().toISOString().split('T')[0]

    if (metadata?.firstName && metadata?.lastName) {
      const name = `${metadata.firstName}_${metadata.lastName}`
      const title = metadata.jobTitle ? `_${metadata.jobTitle.replace(/\s+/g, '_')}` : ''
      return `${name}${title}_CV_${timestamp}.${format}`
    }

    return `CV_${timestamp}.${format}`
  }

  // Main export method
  async export(options: ExportOptions): Promise<void> {
    const fileName = options.fileName || this.generateFileName(options.format)

    switch (options.format) {
      case 'pdf':
        await this.exportAsPDF(options.content, fileName)
        break
      case 'docx':
        await this.exportAsDOCX(options.content, fileName)
        break
      case 'txt':
        await this.exportAsTXT(options.content, fileName)
        break
      default:
        throw new Error(`Unsupported format: ${options.format}`)
    }
  }
}

export const exportService = new ExportService()
