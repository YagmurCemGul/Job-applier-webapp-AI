import { useATSStore } from '@/store/atsStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

/**
 * ATS suggestions filters - category, severity, and search
 */
export default function ATSFilters() {
  const { filter, setFilter } = useATSStore()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filter.category ?? ''}
        onValueChange={(v) => setFilter({ category: v || undefined })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="Keywords">Keywords</SelectItem>
          <SelectItem value="Formatting">Formatting</SelectItem>
          <SelectItem value="Sections">Sections</SelectItem>
          <SelectItem value="Length">Length</SelectItem>
          <SelectItem value="Experience">Experience</SelectItem>
          <SelectItem value="Education">Education</SelectItem>
          <SelectItem value="Skills">Skills</SelectItem>
          <SelectItem value="Contact">Contact</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filter.severity ?? ''}
        onValueChange={(v) => setFilter({ severity: v || undefined })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Input
        className="w-60"
        placeholder="Search..."
        value={filter.search ?? ''}
        onChange={(e) => setFilter({ search: e.target.value })}
        aria-label="Search suggestions"
      />
    </div>
  )
}
