import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useCLUIStore } from '@/store/clUIStore'
import { useCoverLetterStore } from '@/store/coverLetterStore'
import { useJobsStore } from '@/store/jobsStore'
import { useVariantsStore } from '@/store/variantsStore'
import { useCVDataStore } from '@/store/cvDataStore'
import { useATSStore } from '@/store/atsStore'
import CLPromptLibraryDialog from './CLPromptLibraryDialog'
import CLExportDialog from './CLExportDialog'
import { useState } from 'react'
import { generateCoverLetter } from '@/services/coverletter/clGenerator.service'
import { Sparkles, Library, Download } from 'lucide-react'

export default function CLToolbar() {
  const ui = useCLUIStore()
  const { items: jobs } = useJobsStore()
  const { activeId: activeVariantId } = useVariantsStore()
  const { items: cls, activeId, updateContent, create, setMeta } = useCoverLetterStore()
  const { currentCV } = useCVDataStore()
  const { result } = useATSStore()
  const [promptOpen, setPromptOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const cl = cls.find((x) => x.meta.id === activeId)

  const handleGenerate = async () => {
    if (!currentCV) return
    setGenerating(true)
    try {
      const job = jobs[0]
        ? {
            title: jobs[0].title,
            company: jobs[0].company,
            recruiterName: jobs[0].recruiter?.name,
            keywords: result?.missingKeywords ?? [],
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
          linkedVariantId: activeVariantId,
          linkedJobId: job ? jobs[0].id : undefined,
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
    <div className="flex flex-wrap items-center gap-2">
      <Select value={ui.lang} onValueChange={(v) => ui.setLang(v as any)}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Lang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="tr">TR</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ui.tone} onValueChange={(v) => ui.setTone(v as any)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Tone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="formal">Formal</SelectItem>
          <SelectItem value="friendly">Friendly</SelectItem>
          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ui.length} onValueChange={(v) => ui.setLength(v as any)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Length" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="short">Short</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="long">Long</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ui.templateId} onValueChange={(v) => ui.setTemplate(v)}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cl-01">Classic Professional</SelectItem>
          <SelectItem value="cl-02">Concise Impact</SelectItem>
          <SelectItem value="cl-03">Narrative Style</SelectItem>
          <SelectItem value="cl-04">Bullet Format</SelectItem>
          <SelectItem value="cl-05">Story Opening</SelectItem>
          <SelectItem value="cl-06">Data-Driven</SelectItem>
          <SelectItem value="cl-07">Problem-Solution</SelectItem>
          <SelectItem value="cl-08">Enthusiastic Opener</SelectItem>
          <SelectItem value="cl-09">Direct &amp; Bold</SelectItem>
          <SelectItem value="cl-10">Value Proposition</SelectItem>
          <SelectItem value="cl-11">Research-Based</SelectItem>
          <SelectItem value="cl-12">Achievement Focus</SelectItem>
          <SelectItem value="cl-13">Collaborative Tone</SelectItem>
          <SelectItem value="cl-14">Mission-Aligned</SelectItem>
          <SelectItem value="cl-15">Modern &amp; Brief</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleGenerate} disabled={generating || !currentCV}>
        <Sparkles className="mr-2 h-4 w-4" />
        {generating ? 'Generating...' : 'Generate'}
      </Button>

      <Button variant="outline" onClick={() => setPromptOpen(true)}>
        <Library className="mr-2 h-4 w-4" />
        Prompt Library
      </Button>

      <Button variant="outline" disabled={!cl} onClick={() => setExportOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        Export…
      </Button>

      <CLPromptLibraryDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <CLExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
