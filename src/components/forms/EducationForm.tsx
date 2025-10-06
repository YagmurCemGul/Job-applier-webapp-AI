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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { GraduationCap, Plus, Trash2, Edit2 } from 'lucide-react'
import { useCVDataStore } from '@/store/cvDataStore'
import { Education } from '@/types/cvData.types'
import { format } from 'date-fns'

const educationSchema = z.object({
  school: z.string().min(1, 'School name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  currentlyStudying: z.boolean(),
  grade: z.string().optional(),
  activities: z.string().optional(),
  description: z.string().optional(),
})

type EducationFormData = z.infer<typeof educationSchema>

export function EducationForm() {
  const { currentCV, addEducation, updateEducation, deleteEducation } = useCVDataStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      currentlyStudying: false,
    },
  })

  const currentlyStudying = watch('currentlyStudying')

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id)
    setValue('school', edu.school)
    setValue('degree', edu.degree)
    setValue('fieldOfStudy', edu.fieldOfStudy)
    setValue('startDate', format(edu.startDate, 'yyyy-MM'))
    setValue('endDate', edu.endDate ? format(edu.endDate, 'yyyy-MM') : '')
    setValue('currentlyStudying', edu.currentlyStudying)
    setValue('grade', edu.grade || '')
    setValue('activities', edu.activities || '')
    setValue('description', edu.description || '')
    setIsOpen(true)
  }

  const onSubmit = (data: EducationFormData) => {
    const educationData = {
      school: data.school,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy,
      startDate: new Date(data.startDate),
      endDate: data.endDate && !data.currentlyStudying ? new Date(data.endDate) : undefined,
      currentlyStudying: data.currentlyStudying,
      grade: data.grade,
      activities: data.activities,
      description: data.description,
    }

    if (editingId) {
      updateEducation(editingId, educationData)
    } else {
      addEducation(educationData)
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
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Education</h3>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Education' : 'Add Education'}</DialogTitle>
              <DialogDescription>
                Add your educational background and achievements
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* School */}
              <div>
                <Label htmlFor="school">School*</Label>
                <Input
                  id="school"
                  {...register('school')}
                  placeholder="University of California, Berkeley"
                />
                {errors.school && (
                  <p className="mt-1 text-sm text-red-600">{errors.school.message}</p>
                )}
              </div>

              {/* Degree & Field */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree*</Label>
                  <Input id="degree" {...register('degree')} placeholder="Bachelor of Science" />
                  {errors.degree && (
                    <p className="mt-1 text-sm text-red-600">{errors.degree.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study*</Label>
                  <Input
                    id="fieldOfStudy"
                    {...register('fieldOfStudy')}
                    placeholder="Computer Science"
                  />
                  {errors.fieldOfStudy && (
                    <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy.message}</p>
                  )}
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
                  <Label htmlFor="endDate">End Date (or expected)</Label>
                  <Input
                    id="endDate"
                    type="month"
                    {...register('endDate')}
                    disabled={currentlyStudying}
                  />
                </div>
              </div>

              {/* Currently Studying */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="currentlyStudying"
                  checked={currentlyStudying}
                  onCheckedChange={(checked) => setValue('currentlyStudying', checked as boolean)}
                />
                <Label htmlFor="currentlyStudying" className="cursor-pointer text-sm font-normal">
                  I currently study here
                </Label>
              </div>

              {/* Grade */}
              <div>
                <Label htmlFor="grade">Grade (Optional)</Label>
                <Input id="grade" {...register('grade')} placeholder="3.8 GPA" />
              </div>

              {/* Activities */}
              <div>
                <Label htmlFor="activities">Activities and Societies</Label>
                <Textarea
                  id="activities"
                  {...register('activities')}
                  placeholder="Student Government, Computer Science Club..."
                  rows={3}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Relevant coursework, achievements, honors..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">{editingId ? 'Update' : 'Add'} Education</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {currentCV?.education.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No education added yet. Click "Add Education" to get started.
          </p>
        ) : (
          currentCV?.education.map((edu) => (
            <Card key={edu.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{edu.school}</h4>
                  <p className="text-sm text-gray-600">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {format(edu.startDate, 'MMM yyyy')} -{' '}
                    {edu.currentlyStudying
                      ? 'Present'
                      : edu.endDate
                        ? format(edu.endDate, 'MMM yyyy')
                        : 'N/A'}
                  </p>
                  {edu.grade && <p className="mt-1 text-sm text-gray-600">Grade: {edu.grade}</p>}
                  {edu.description && (
                    <p className="mt-2 line-clamp-2 text-sm">{edu.description}</p>
                  )}
                </div>

                <div className="ml-4 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteEducation(edu.id)}>
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
