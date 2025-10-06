import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ATSAnalysisResult } from '@/types/ats.types'
import { useATSUIStore } from '@/store/atsUIStore'
import { useCVDataStore } from '@/store/cvDataStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, X, Plus, ChevronDown, Sparkles } from 'lucide-react'

interface ATSKeywordTableProps {
  result: ATSAnalysisResult
}

export default function ATSKeywordTable({ result }: ATSKeywordTableProps) {
  const { t } = useTranslation()
  const { kwSearch, setKwSearch, setSelectedKw } = useATSUIStore()
  const { currentCV, updateSummary, updateSkills, updateExperience } = useCVDataStore()

  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'missing'>('all')

  const matchedSet = useMemo(
    () => new Set(result.matchedKeywords.map((k) => k.toLowerCase())),
    [result.matchedKeywords]
  )

  const missingSet = useMemo(
    () => new Set(result.missingKeywords.map((k) => k.toLowerCase())),
    [result.missingKeywords]
  )

  const rows = useMemo(() => {
    if (!result.keywordMeta) return []

    let filtered = result.keywordMeta

    // Status filter
    if (statusFilter === 'matched') {
      filtered = filtered.filter((m) => matchedSet.has(m.term.toLowerCase()))
    } else if (statusFilter === 'missing') {
      filtered = filtered.filter((m) => missingSet.has(m.term.toLowerCase()))
    }

    // Search filter
    if (kwSearch) {
      const q = kwSearch.toLowerCase()
      filtered = filtered.filter((m) => m.term.toLowerCase().includes(q))
    }

    return filtered
  }, [result.keywordMeta, statusFilter, kwSearch, matchedSet, missingSet])

  const handleAddToSummary = (term: string) => {
    if (!currentCV) return
    const current = currentCV.summary || ''
    const updated = current ? `${current} ${term}` : term
    updateSummary(updated)
  }

  const handleAddToSkills = (term: string) => {
    if (!currentCV) return
    const exists = currentCV.skills.some((s) => s.name.toLowerCase() === term.toLowerCase())
    if (!exists) {
      updateSkills([...currentCV.skills, { id: crypto.randomUUID(), name: term, level: 3 }])
    }
  }

  const handleAddToExperience = (term: string, expIndex: number) => {
    if (!currentCV || expIndex < 0 || expIndex >= currentCV.experience.length) return
    const exp = currentCV.experience[expIndex]
    const updated = `${term}. ${exp.description || ''}`
    updateExperience(exp.id, { ...exp, description: updated })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder={t('ats.details.table.search')}
          value={kwSearch}
          onChange={(e) => setKwSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ats.details.table.term')}</TableHead>
              <TableHead>{t('ats.details.table.importance')}</TableHead>
              <TableHead>{t('ats.details.table.status')}</TableHead>
              <TableHead className="text-center">{t('ats.details.table.inTitle')}</TableHead>
              <TableHead className="text-center">{t('ats.details.table.inReq')}</TableHead>
              <TableHead className="text-center">{t('ats.details.table.inQual')}</TableHead>
              <TableHead className="text-center">{t('ats.details.table.inResp')}</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No keywords found
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const isMatched = matchedSet.has(row.term.toLowerCase())
              const isMissing = missingSet.has(row.term.toLowerCase())

              return (
                <TableRow
                  key={row.term}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedKw(row.term)}
                >
                  <TableCell className="font-medium">{row.term}</TableCell>
                  <TableCell>
                    <Badge variant={row.importance > 0.7 ? 'default' : 'secondary'}>
                      {row.importance.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isMatched && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="mr-1 h-3 w-3" />
                        {t('ats.details.table.matchedLabel')}
                      </Badge>
                    )}
                    {isMissing && (
                      <Badge variant="destructive">
                        <X className="mr-1 h-3 w-3" />
                        {t('ats.details.table.missingLabel')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.inTitle ? <Check className="mx-auto h-4 w-4 text-green-600" /> : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.inReq ? <Check className="mx-auto h-4 w-4 text-green-600" /> : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.inQual ? <Check className="mx-auto h-4 w-4 text-green-600" /> : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.inResp ? <Check className="mx-auto h-4 w-4 text-green-600" /> : '—'}
                  </TableCell>
                  <TableCell>
                    {isMissing && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAddToSummary(row.term)}>
                            {t('ats.details.table.addSummary')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddToSkills(row.term)}>
                            {t('ats.details.table.addSkills')}
                          </DropdownMenuItem>
                          {currentCV?.experience.map((exp, idx) => (
                            <DropdownMenuItem
                              key={exp.id}
                              onClick={() => handleAddToExperience(row.term, idx)}
                            >
                              Add to {exp.position || `Experience ${idx + 1}`}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
