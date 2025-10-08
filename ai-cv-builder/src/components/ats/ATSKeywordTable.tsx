import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useATSUIStore } from '@/stores/ats.ui.store'
import { useCVDataStore } from '@/stores/cvData.store'
import type { ATSAnalysisResult, ATSKeywordMeta } from '@/types/ats.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Check, X, Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ATSKeywordTableProps {
  result: ATSAnalysisResult
}

/**
 * Keyword table with filters and insert actions
 */
export default function ATSKeywordTable({ result }: ATSKeywordTableProps) {
  const { t } = useTranslation('cv')
  const { kwSearch, setKwSearch, setSelectedKw } = useATSUIStore()
  const { currentCV, updateSummary, addSkill, updateExperience } = useCVDataStore()
  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'missing'>('all')

  const meta = result.keywordMeta || []
  const matchedSet = new Set(result.matchedKeywords)
  const missingSet = new Set(result.missingKeywords)

  // Filtered keywords
  const filtered = useMemo(() => {
    return meta.filter((m) => {
      // Status filter
      if (statusFilter === 'matched' && !matchedSet.has(m.term)) return false
      if (statusFilter === 'missing' && !missingSet.has(m.term)) return false

      // Search filter
      if (kwSearch && !m.term.toLowerCase().includes(kwSearch.toLowerCase())) {
        return false
      }

      return true
    })
  }, [meta, statusFilter, kwSearch, matchedSet, missingSet])

  const handleAddToSummary = (term: string) => {
    if (!currentCV) return
    const current = currentCV.summary || ''
    const updated = current ? `${current} ${term}` : term
    updateSummary(updated)
  }

  const handleAddToSkills = (term: string) => {
    addSkill({
      id: crypto.randomUUID(),
      name: term,
      level: 'intermediate',
    })
  }

  const handleAddToExperience = (term: string, expIndex: number) => {
    if (!currentCV?.experience?.[expIndex]) return
    const exp = currentCV.experience[expIndex]
    const updated = {
      ...exp,
      description: term + '. ' + (exp.description || ''),
    }
    updateExperience(expIndex, updated)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('ats.details.table.search', 'Search keyword…')}
          value={kwSearch}
          onChange={(e) => setKwSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-36">
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
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  {t('ats.details.table.term', 'Term')}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {t('ats.details.table.importance', 'Importance')}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {t('ats.details.table.status', 'Status')}
                </th>
                <th className="px-4 py-3 text-center font-medium text-xs">
                  {t('ats.details.table.inTitle', 'Title')}
                </th>
                <th className="px-4 py-3 text-center font-medium text-xs">
                  {t('ats.details.table.inReq', 'Req')}
                </th>
                <th className="px-4 py-3 text-center font-medium text-xs">
                  {t('ats.details.table.inQual', 'Qual')}
                </th>
                <th className="px-4 py-3 text-center font-medium text-xs">
                  {t('ats.details.table.inResp', 'Resp')}
                </th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                    No keywords match the filters
                  </td>
                </tr>
              ) : (
                filtered.map((kw) => {
                  const isMatched = matchedSet.has(kw.term)
                  const isMissing = missingSet.has(kw.term)

                  return (
                    <tr
                      key={kw.term}
                      className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedKw(kw.term)}
                    >
                      <td className="px-4 py-3 font-medium">{kw.term}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                kw.importance > 0.7
                                  ? 'bg-green-500'
                                  : kw.importance > 0.4
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-400'
                              )}
                              style={{ width: `${kw.importance * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {kw.importance.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={isMatched ? 'default' : 'secondary'}
                          className={cn(
                            isMatched && 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
                            isMissing && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                          )}
                        >
                          {isMatched
                            ? t('ats.details.table.matchedLabel', 'Matched')
                            : t('ats.details.table.missingLabel', 'Missing')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.inTitle ? (
                          <Check className="h-4 w-4 mx-auto text-green-600" />
                        ) : (
                          <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.inReq ? (
                          <Check className="h-4 w-4 mx-auto text-green-600" />
                        ) : (
                          <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.inQual ? (
                          <Check className="h-4 w-4 mx-auto text-green-600" />
                        ) : (
                          <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.inResp ? (
                          <Check className="h-4 w-4 mx-auto text-green-600" />
                        ) : (
                          <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isMissing && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Plus className="h-3 w-3" />
                                Add
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleAddToSummary(kw.term)}
                              >
                                {t('ats.details.table.addSummary', 'Add to Summary')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAddToSkills(kw.term)}
                              >
                                {t('ats.details.table.addSkills', 'Add to Skills')}
                              </DropdownMenuItem>
                              {currentCV?.experience && currentCV.experience.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="justify-between"
                                    >
                                      {t('ats.details.table.addExperience', 'Add to Experience…')}
                                      <ChevronDown className="h-3 w-3 ml-2" />
                                    </DropdownMenuItem>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent side="right">
                                    {currentCV.experience.map((exp, idx) => (
                                      <DropdownMenuItem
                                        key={idx}
                                        onClick={() => handleAddToExperience(kw.term, idx)}
                                      >
                                        {exp.title || `Experience ${idx + 1}`}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {meta.length} keywords
      </div>
    </div>
  )
}
