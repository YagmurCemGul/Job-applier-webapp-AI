import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Award, Plus, X, Edit2 } from 'lucide-react'
import { useCVDataStore } from '@/store/cvDataStore'
import { SKILL_CATEGORIES, SKILL_LEVELS, Skill } from '@/types/cvData.types'

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(SKILL_CATEGORIES),
  level: z.enum(SKILL_LEVELS),
  yearsOfExperience: z.number().optional(),
})

type SkillFormData = z.infer<typeof skillSchema>

export function SkillsForm() {
  const { currentCV, addSkill, updateSkill, deleteSkill } = useCVDataStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      category: 'Technical',
      level: 'Intermediate',
    },
  })

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setValue('name', skill.name)
    setValue('category', skill.category)
    setValue('level', skill.level)
    setValue('yearsOfExperience', skill.yearsOfExperience)
    setIsOpen(true)
  }

  const onSubmit = (data: SkillFormData) => {
    const skillData = {
      name: data.name,
      category: data.category,
      level: data.level,
      yearsOfExperience: data.yearsOfExperience,
    }

    if (editingId) {
      updateSkill(editingId, skillData)
    } else {
      addSkill(skillData)
    }

    reset()
    setEditingId(null)
    setIsOpen(false)
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
    setIsOpen(false)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-green-100 text-green-800'
      case 'Advanced':
        return 'bg-blue-100 text-blue-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Beginner':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSkills =
    filterCategory === 'all'
      ? currentCV?.skills || []
      : currentCV?.skills.filter((s) => s.category === filterCategory) || []

  const groupedSkills = filteredSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>
  )

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Skills</h3>
        </div>

        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {SKILL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
                <DialogDescription>Add a skill to your CV</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Skill Name */}
                <div>
                  <Label htmlFor="name">Skill Name*</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="React, Python, Leadership..."
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={watch('category')}
                    onValueChange={(value: any) => setValue('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level */}
                <div>
                  <Label htmlFor="level">Proficiency Level*</Label>
                  <Select
                    value={watch('level')}
                    onValueChange={(value: any) => setValue('level', value)}
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Years of Experience */}
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    max="50"
                    {...register('yearsOfExperience', { valueAsNumber: true })}
                    placeholder="5"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingId ? 'Update' : 'Add'} Skill</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-6">
        {filteredSkills.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No skills added yet. Click "Add Skill" to get started.
          </p>
        ) : (
          Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category}>
              <h4 className="mb-3 text-sm font-medium">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="group relative px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <span
                      className={`ml-2 rounded px-2 py-0.5 text-xs ${getLevelColor(skill.level)}`}
                    >
                      {skill.level}
                    </span>
                    {skill.yearsOfExperience && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({skill.yearsOfExperience}y)
                      </span>
                    )}

                    <div className="absolute -right-1 -top-1 hidden gap-1 group-hover:flex">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="rounded-full border bg-white p-1 shadow-sm hover:bg-gray-50"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="rounded-full border bg-white p-1 shadow-sm hover:bg-red-50"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Popular Skills */}
      <div className="mt-6 border-t pt-6">
        <Label className="mb-3 block text-sm">Quick Add Popular Skills</Label>
        <div className="flex flex-wrap gap-2">
          {['JavaScript', 'Python', 'React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'AWS'].map(
            (skillName) => (
              <Button
                key={skillName}
                variant="outline"
                size="sm"
                onClick={() => {
                  addSkill({
                    name: skillName,
                    category: 'Technical',
                    level: 'Intermediate',
                  })
                }}
                disabled={currentCV?.skills.some((s) => s.name === skillName)}
              >
                <Plus className="mr-1 h-3 w-3" />
                {skillName}
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  )
}
