import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { autoApply } from '@/services/apply/apply.engine'

export default function ApplyDialog({
  open,
  onOpenChange,
  initialJobUrl,
  initialCompany,
  initialRole,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialJobUrl?: string
  initialCompany?: string
  initialRole?: string
}) {
  const [platform, setPlatform] = useState<
    'greenhouse' | 'lever' | 'workday' | 'indeed' | 'linkedin'
  >('greenhouse')
  const [jobUrl, setJobUrl] = useState(initialJobUrl ?? '')
  const [company, setCompany] = useState(initialCompany ?? '')
  const [role, setRole] = useState(initialRole ?? '')
  const [optIn, setOptIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await autoApply({
        platform,
        jobUrl,
        company,
        role,
        mapperArgs: { jobUrl },
        optIn,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Auto-apply failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-3">
        <DialogHeader>
          <DialogTitle>Auto-Apply</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className="rounded-md border p-2"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as any)}
          >
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
            <option value="workday">Workday</option>
            <option value="indeed">Indeed</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <Input placeholder="Job URL" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
          <Input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />I
          confirm I have the rights to submit on this site (Legal Mode).
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !optIn}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
