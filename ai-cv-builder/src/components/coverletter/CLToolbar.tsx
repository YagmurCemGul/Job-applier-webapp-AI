/**
 * Cover Letter Toolbar - Step 30
 * Controls for tone, length, language, template, and generation
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useCLUIStore } from '@/stores/cl.ui.store'
import { useCoverLetterStore } from '@/stores/coverLetter.store'
import { useJobsStore } from '@/stores/jobs.store'
import { useVariantsStore } from '@/stores/variants.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { useATSStore } from '@/stores/ats.store'
import CLPromptLibraryDialog from './CLPromptLibraryDialog'
import CLExportDialog from './CLExportDialog'
import { generateCoverLetter } from '@/services/coverletter/clGenerator.service'
import { Sparkles, Loader2 } from 'lucide-react'
import { CL_TEMPLATES } from '@/services/coverletter/clTemplates.service'

export default function CLToolbar() {
  const ui = useCLUIStore()
  const { items: jobs } = useJobsStore()
  const { activeId: activeVariantId } = useVariantsStore()
  const { items: cls, activeId, updateContent, create, setMeta } =
    useCoverLetterStore()
  const { currentCV } = useCVDataStore()
  const { result: atsResult } = useATSStore()
  const [promptOpen, setPromptOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const cl = cls.find((x) => x.meta.id === activeId)

  const handleGenerate = async () => {
    if (!currentCV) return

    setGenerating(true)
    try {
      // Get first job or use defaults
      const job = jobs[0]
        ? {
            title: jobs[0].title,
            company: jobs[0].company,
            recruiterName: jobs[0].recruiter?.name,
            keywords: atsResult?.missingKeywords ?? [],
          }
        : undefined

      const { html } = await generateCoverLetter({
        tone: ui.tone,
        length: ui.length,
        lang: ui.lang,
        templateId: ui.templateId,
        cv: currentCV,
        job,
        extraPrompt: undefined,
        prompts: undefined,
      })

      if (!cl) {
        const id = create({
          name: `CL — ${job?.company ?? 'General'}`,
          lang: ui.lang,
          tone: ui.tone,
          length: ui.length,
          templateId: ui.templateId,
          content: html,
          meta: {
            linkedVariantId: activeVariantId,
            linkedJobId: job ? jobs[0]?.id : undefined,
          },
        })
        setMeta(id, { notes: 'generated' })
      } else {
        updateContent(cl.meta.id, html, 'regenerate')
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select value={ui.lang} onValueChange={(v) => ui.setLang(v as any)}>
        <SelectTrigger className="w-28" aria-label="Language">
          <SelectValue placeholder="Lang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="tr">TR</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ui.tone} onValueChange={(v) => ui.setTone(v as any)}>
        <SelectTrigger className="w-36" aria-label="Tone">
          <SelectValue placeholder="Tone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="formal">Formal</SelectItem>
          <SelectItem value="friendly">Friendly</SelectItem>
          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ui.length} onValueChange={(v) => ui.setLength(v as any)}>
        <SelectTrigger className="w-32" aria-label="Length">
          <SelectValue placeholder="Length" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="short">Short</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="long">Long</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ui.templateId} onValueChange={(v) => ui.setTemplate(v)}>
        <SelectTrigger className="w-56" aria-label="Template">
          <SelectValue placeholder="Template" />
        </SelectTrigger>
        <SelectContent>
          {CL_TEMPLATES.map((tpl) => (
            <SelectItem key={tpl.id} value={tpl.id}>
              {tpl.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleGenerate} disabled={generating || !currentCV}>
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </>
        )}
      </Button>

      <Button variant="outline" onClick={() => setPromptOpen(true)}>
        Prompt Library
      </Button>
      <Button variant="outline" disabled={!cl} onClick={() => setExportOpen(true)}>
        Export…
      </Button>

      <CLPromptLibraryDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <CLExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
