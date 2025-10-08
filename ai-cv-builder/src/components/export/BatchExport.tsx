import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Download, Loader2, CheckCircle, FileArchive } from 'lucide-react'
import { useCVDataStore } from '@/stores/cvData.store'
import { SavedCV } from '@/types/savedCV.types'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface BatchExportProps {
  trigger?: React.ReactNode
}

export function BatchExport({ trigger }: BatchExportProps) {
  const { savedCVs } = useCVDataStore()
  const [open, setOpen] = useState(false)
  const [selectedCVs, setSelectedCVs] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['pdf'])
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  const handleToggleCV = (cvId: string) => {
    setSelectedCVs((prev: string[]) =>
      prev.includes(cvId) ? prev.filter((id: string) => id !== cvId) : [...prev, cvId]
    )
  }

  const handleToggleFormat = (format: string) => {
    setSelectedFormats((prev: string[]) =>
      prev.includes(format) ? prev.filter((f: string) => f !== format) : [...prev, format]
    )
  }

  const handleSelectAll = () => {
    if (selectedCVs.length === savedCVs.length) {
      setSelectedCVs([])
    } else {
      setSelectedCVs(savedCVs.map((cv: SavedCV) => cv.id))
    }
  }

  const handleExport = async () => {
    if (selectedCVs.length === 0 || selectedFormats.length === 0) return

    setExporting(true)
    setProgress(0)

    try {
      const zip = new JSZip()
      const totalFiles = selectedCVs.length * selectedFormats.length
      let processedFiles = 0

      for (const cvId of selectedCVs) {
        const cv = savedCVs.find((c: SavedCV) => c.id === cvId)
        if (!cv) continue

        const folderName = cv.name.replace(/[^a-z0-9]/gi, '_')
        const folder = zip.folder(folderName)

        if (!folder) continue

        for (const format of selectedFormats) {
          // Generate CV content as text
          const cvContent = generateCVContent(cv)

          // Add to zip based on format
          if (format === 'pdf') {
            // For PDF, we'd need to generate actual PDF
            // For now, add as text
            folder.file(`${cv.name}.txt`, cvContent)
          } else if (format === 'docx') {
            folder.file(`${cv.name}.txt`, cvContent)
          } else {
            folder.file(`${cv.name}.txt`, cvContent)
          }

          processedFiles++
          setProgress((processedFiles / totalFiles) * 100)
        }
      }

      // Generate zip and download
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `CVs_Export_${new Date().toISOString().split('T')[0]}.zip`)

      setCompleted(true)
      setTimeout(() => {
        setOpen(false)
        setCompleted(false)
        setSelectedCVs([])
      }, 2000)
    } catch (error) {
      console.error('Batch export error:', error)
    } finally {
      setExporting(false)
    }
  }

  const generateCVContent = (cv: SavedCV): string => {
    // Simple text generation - this would be replaced with proper formatting
    return `
${cv.cvData.personalInfo.firstName} ${cv.cvData.personalInfo.lastName}
${cv.cvData.personalInfo.email}
${cv.cvData.personalInfo.phone}

${cv.cvData.summary || ''}

EXPERIENCE
${cv.cvData.experience.map((exp: { title: string; company: string; description: string }) => `
${exp.title} at ${exp.company}
${exp.description}
`).join('\n')}

EDUCATION
${cv.cvData.education.map((edu: { degree: string; fieldOfStudy: string; school: string }) => `
${edu.degree} in ${edu.fieldOfStudy}
${edu.school}
`).join('\n')}

SKILLS
${cv.cvData.skills.map((skill: { name: string }) => skill.name).join(', ')}
    `.trim()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileArchive className="h-4 w-4 mr-2" />
            Batch Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch Export CVs</DialogTitle>
          <DialogDescription>
            Export multiple CVs at once in various formats
          </DialogDescription>
        </DialogHeader>

        {!exporting && !completed ? (
          <div className="space-y-6">
            {/* Select CVs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Select CVs ({selectedCVs.length} selected)</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedCVs.length === savedCVs.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                {savedCVs.map((cv: SavedCV) => (
                  <div key={cv.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cv.id}
                      checked={selectedCVs.includes(cv.id)}
                      onCheckedChange={() => handleToggleCV(cv.id)}
                    />
                    <Label
                      htmlFor={cv.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {cv.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Formats */}
            <div>
              <Label className="mb-3 block">Export Formats</Label>
              <div className="space-y-2">
                {['pdf', 'docx', 'txt'].map((format) => (
                  <div key={format} className="flex items-center space-x-2">
                    <Checkbox
                      id={format}
                      checked={selectedFormats.includes(format)}
                      onCheckedChange={() => handleToggleFormat(format)}
                    />
                    <Label
                      htmlFor={format}
                      className="text-sm font-normal cursor-pointer uppercase"
                    >
                      {format}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={selectedCVs.length === 0 || selectedFormats.length === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export {selectedCVs.length} CV{selectedCVs.length !== 1 ? 's' : ''}
            </Button>
          </div>
        ) : exporting ? (
          <div className="py-8 space-y-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Exporting CVs...</p>
              <p className="text-sm text-gray-500">
                Processing {selectedCVs.length} CV{selectedCVs.length !== 1 ? 's' : ''} in{' '}
                {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Progress value={progress} className="w-full" />

            <p className="text-center text-sm text-gray-500">
              {Math.round(progress)}% complete
            </p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium">Export Complete!</p>
            <p className="text-sm text-gray-500">
              Your CVs have been downloaded as a ZIP file
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
