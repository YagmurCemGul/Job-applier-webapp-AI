import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Briefcase, Plus, Trash2, Edit2 } from 'lucide-react'
import { useCVDataStore } from '@/store/cvDataStore'
import { EMPLOYMENT_TYPES, LOCATION_TYPES, Experience } from '@/types/cvData.types'
import { format } from 'date-fns'

const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  locationType: z.enum(LOCATION_TYPES).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean(),
  description: z.string().min(1, 'Description is required'),
  skills: z.string().optional(),
})

type ExperienceFormData = z.infer<typeof experienceSchema>

export function ExperienceForm() {
  const { currentCV, addExperience, updateExperience, deleteExperience } = useCVDataStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      currentlyWorking: false,
      employmentType: 'Full-time',
    },
  })

  const currentlyWorking = watch('currentlyWorking')

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id)
    setValue('title', exp.title)
    setValue('employmentType', exp.employmentType)
    setValue('company', exp.company)
    setValue('location', exp.location || '')
    setValue('locationType', exp.locationType)
    setValue('startDate', format(exp.startDate, 'yyyy-MM'))
    setValue('endDate', exp.endDate ? format(exp.endDate, 'yyyy-MM') : '')
    setValue('currentlyWorking', exp.currentlyWorking)
    setValue('description', exp.description)
    setValue('skills', exp.skills.join(', '))
    setIsOpen(true)
  }

  const onSubmit = (data: ExperienceFormData) => {
    const experienceData = {
      title: data.title,
      employmentType: data.employmentType,
      company: data.company,
      location: data.location,
      locationType: data.locationType,
      startDate: new Date(data.startDate),
      endDate: data.endDate && !data.currentlyWorking ? new Date(data.endDate) : undefined,
      currentlyWorking: data.currentlyWorking,
      description: data.description,
      skills: data.skills ? data.skills.split(',').map((s) => s.trim()) : [],
    }

    if (editingId) {
      updateExperience(editingId, experienceData)
    } else {
      addExperience(experienceData)
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

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Work Experience</h3>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
              <DialogDescription>
                Add your professional experience and achievements
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Job Title */}
              <div>
                <Label htmlFor="title">Job Title*</Label>
                <Input id="title" {...register('title')} placeholder="Senior Software Engineer" />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Employment Type & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType">Employment Type*</Label>
                  <Select
                    value={watch('employmentType')}
                    onValueChange={(value: any) => setValue('employmentType', value)}
                  >
                    <SelectTrigger id="employmentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="company">Company*</Label>
                  <Input id="company" {...register('company')} placeholder="Tech Corp" />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register('location')} placeholder="San Francisco, CA" />
                </div>

                <div>
                  <Label htmlFor="locationType">Location Type</Label>
                  <Select
                    value={watch('locationType')}
                    onValueChange={(value: any) => setValue('locationType', value)}
                  >
                    <SelectTrigger id="locationType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input id="startDate" type="month" {...register('startDate')} />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="month"
                    {...register('endDate')}
                    disabled={currentlyWorking}
                  />
                </div>
              </div>

              {/* Currently Working */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currentlyWorking"
                  checked={currentlyWorking}
                  onCheckedChange={(checked) => setValue('currentlyWorking', checked as boolean)}
                />
                <Label htmlFor="currentlyWorking" className="cursor-pointer text-sm font-normal">
                  I currently work here
                </Label>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your responsibilities and achievements..."
                  className="min-h-[150px]"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <Label htmlFor="skills">Skills Used (comma-separated)</Label>
                <Input
                  id="skills"
                  {...register('skills')}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">{editingId ? 'Update' : 'Add'} Experience</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {currentCV?.experience.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No experience added yet. Click "Add Experience" to get started.
          </p>
        ) : (
          currentCV?.experience.map((exp) => (
            <Card key={exp.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{exp.title}</h4>
                  <p className="text-sm text-gray-600">
                    {exp.company} • {exp.employmentType}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {format(exp.startDate, 'MMM yyyy')} -{' '}
                    {exp.currentlyWorking
                      ? 'Present'
                      : exp.endDate
                        ? format(exp.endDate, 'MMM yyyy')
                        : 'N/A'}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-500">
                      {exp.location} {exp.locationType && `• ${exp.locationType}`}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm">{exp.description}</p>
                </div>

                <div className="ml-4 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(exp)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteExperience(exp.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}
