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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FolderKanban, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react'
import { useCVDataStore } from '@/stores/cvData.store'
import { Project } from '@/types/cvData.types'
import { format } from 'date-fns'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  role: z.string().optional(),
  technologies: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean(),
  highlights: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

export function ProjectsForm() {
  const { currentCV, addProject, updateProject, deleteProject } = useCVDataStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      currentlyWorking: false,
    },
  })

  const currentlyWorking = watch('currentlyWorking')

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setValue('name', project.name)
    setValue('description', project.description)
    setValue('role', project.role || '')
    setValue('technologies', project.technologies?.join(', ') || '')
    setValue('url', project.url || '')
    setValue('github', project.github || '')
    setValue('startDate', project.startDate ? format(project.startDate, 'yyyy-MM') : '')
    setValue('endDate', project.endDate ? format(project.endDate, 'yyyy-MM') : '')
    setValue('currentlyWorking', project.currentlyWorking)
    setValue('highlights', project.highlights?.join('\n') || '')
    setIsOpen(true)
  }

  const onSubmit = (data: ProjectFormData) => {
    const projectData = {
      name: data.name,
      description: data.description,
      role: data.role,
      technologies: data.technologies ? data.technologies.split(',').map(t => t.trim()) : [],
      url: data.url || undefined,
      github: data.github || undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate && !data.currentlyWorking ? new Date(data.endDate) : undefined,
      currentlyWorking: data.currentlyWorking,
      highlights: data.highlights ? data.highlights.split('\n').filter(h => h.trim()) : [],
    }

    if (editingId) {
      updateProject(editingId, projectData)
    } else {
      addProject(projectData)
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Projects</h3>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Project' : 'Add Project'}
              </DialogTitle>
              <DialogDescription>
                Showcase your projects and accomplishments
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name*</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="E-commerce Platform"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  {...register('role')}
                  placeholder="Lead Developer"
                />
              </div>

              <div>
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of the project..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="technologies">Technologies Used</Label>
                <Input
                  id="technologies"
                  {...register('technologies')}
                  placeholder="React, Node.js, MongoDB (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url">Project URL</Label>
                  <Input
                    id="url"
                    type="url"
                    {...register('url')}
                    placeholder="https://project.com"
                  />
                  {errors.url && (
                    <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    id="github"
                    type="url"
                    {...register('github')}
                    placeholder="https://github.com/user/project"
                  />
                  {errors.github && (
                    <p className="text-sm text-red-600 mt-1">{errors.github.message}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="month"
                    {...register('startDate')}
                  />
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
                  onCheckedChange={(checked) =>
                    setValue('currentlyWorking', checked as boolean)
                  }
                />
                <Label htmlFor="currentlyWorking" className="text-sm font-normal cursor-pointer">
                  I'm currently working on this project
                </Label>
              </div>

              {/* Highlights */}
              <div>
                <Label htmlFor="highlights">Key Highlights (one per line)</Label>
                <Textarea
                  id="highlights"
                  {...register('highlights')}
                  placeholder="Improved performance by 40%&#10;Implemented real-time features&#10;Led a team of 5 developers"
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Update' : 'Add'} Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {!currentCV?.projects || currentCV.projects.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No projects added yet. Click "Add Project" to showcase your work.
          </p>
        ) : (
          currentCV.projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{project.name}</h4>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {project.role && (
                    <p className="text-sm text-gray-600">{project.role}</p>
                  )}
                  <p className="text-sm mt-2">{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {project.startDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      {format(project.startDate, 'MMM yyyy')} -{' '}
                      {project.currentlyWorking ? 'Present' : project.endDate ? format(project.endDate, 'MMM yyyy') : 'N/A'}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                  >
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
