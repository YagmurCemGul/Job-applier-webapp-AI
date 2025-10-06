import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, FileText } from 'lucide-react'
import { CVCard } from './CVCard'
import { useCVDataStore } from '@/store/cvDataStore'
import { useNavigate } from 'react-router-dom'

type SortOption = 'recent' | 'name' | 'atsScore'

export function CVList() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  const { savedCVs, deleteSavedCV, duplicateSavedCV, setPrimaryCv, loadSavedCV } = useCVDataStore()

  const navigate = useNavigate()

  const handleEdit = (id: string) => {
    loadSavedCV(id)
    navigate('/cv-builder?tab=edit')
  }

  const handleDuplicate = (id: string) => {
    duplicateSavedCV(id)
  }

  const handleDelete = (id: string) => {
    deleteSavedCV(id)
  }

  const handleSetPrimary = (id: string) => {
    setPrimaryCv(id)
  }

  const handleDownload = (id: string) => {
    loadSavedCV(id)
    navigate('/cv-builder?tab=optimize')
  }

  const handleCreateNew = () => {
    navigate('/cv-builder')
  }

  // Filter and sort CVs
  const filteredCVs = savedCVs
    .filter((cv) => {
      const searchLower = search.toLowerCase()
      return (
        cv.name.toLowerCase().includes(searchLower) ||
        cv.description?.toLowerCase().includes(searchLower) ||
        cv.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'atsScore':
          return (b.atsScore || 0) - (a.atsScore || 0)
        case 'recent':
        default:
          return b.lastModified.getTime() - a.lastModified.getTime()
      }
    })

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search CVs..."
              className="pl-9"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="atsScore">ATS Score</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New CV
        </Button>
      </div>

      {/* CV Grid */}
      {filteredCVs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold">
              {search ? 'No CVs Found' : 'No Saved CVs'}
            </h3>
            <p className="mb-6 text-gray-600">
              {search ? 'Try adjusting your search terms' : 'Create your first CV to get started'}
            </p>
            {!search && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First CV
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCVs.map((cv) => (
            <CVCard
              key={cv.id}
              cv={cv}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onSetPrimary={handleSetPrimary}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {filteredCVs.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredCVs.length} of {savedCVs.length} CVs
        </div>
      )}
    </div>
  )
}
