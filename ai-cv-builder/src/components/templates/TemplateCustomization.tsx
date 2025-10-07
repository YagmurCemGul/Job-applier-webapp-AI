import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  GripVertical,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react'
import { useTemplateStore } from '@/stores/template.store'
import { SECTION_DEFINITIONS, TemplateSection } from '@/types/template.types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function TemplateCustomization() {
  const { getSelectedTemplate, toggleSection, reorderSections, duplicateTemplate } =
    useTemplateStore()
  
  const template = getSelectedTemplate()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!template) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Select a template to customize</p>
      </Card>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = template.structure.order.indexOf(active.id as string)
      const newIndex = template.structure.order.indexOf(over.id as string)
      const newOrder = arrayMove(template.structure.order, oldIndex, newIndex)
      reorderSections(template.id, newOrder)
    }
  }

  const orderedSections = template.structure.order
    .map((id) => template.structure.sections.find((s) => s.id === id))
    .filter(Boolean)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Customize Sections</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => duplicateTemplate(template.id)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
      </div>

      {/* Template Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{template.name}</span>
          <Badge variant="secondary" className="capitalize">
            {template.structure.layout}
          </Badge>
        </div>
        <p className="text-xs text-gray-600">{template.description}</p>
      </div>

      <Separator className="my-4" />

      {/* Sections List */}
      <div className="mb-4">
        <Label className="text-sm font-semibold mb-3 block">
          Sections (Drag to reorder)
        </Label>

        <ScrollArea className="h-[400px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={template.structure.order}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {orderedSections.map((section) => {
                  if (!section) return null
                  const definition = SECTION_DEFINITIONS[section.type]
                  
                  return (
                    <SortableSection
                      key={section.id}
                      section={section}
                      definition={definition}
                      onToggle={() => toggleSection(template.id, section.id)}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </div>

      {/* Style Info */}
      <Separator className="my-4" />
      
      <div>
        <Label className="text-sm font-semibold mb-3 block">Style Preview</Label>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-600 mb-1">Font</div>
            <div className="font-medium">{template.styling.fontFamily}</div>
          </div>
          
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-600 mb-1">Layout</div>
            <div className="font-medium capitalize">{template.structure.layout}</div>
          </div>
          
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-600 mb-1">Primary Color</div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: template.styling.colors.primary }}
              />
              <span className="font-medium">{template.styling.colors.primary}</span>
            </div>
          </div>
          
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-600 mb-1">Features</div>
            <div className="font-medium">
              {template.styling.icons && 'Icons • '}
              {template.styling.borders && 'Borders'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Sortable Section Item Component
function SortableSection({
  section,
  definition,
  onToggle,
}: {
  section: TemplateSection
  definition: { label: string; description: string; icon: string }
  onToggle: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-white"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1">
        <div className="font-medium text-sm">{definition.label}</div>
        <div className="text-xs text-gray-500">{definition.description}</div>
      </div>

      {section.required && (
        <Badge variant="secondary" className="text-xs">
          Required
        </Badge>
      )}

      <Switch
        checked={section.enabled}
        onCheckedChange={onToggle}
        disabled={section.required}
      />

      {section.enabled ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-gray-400" />
      )}
    </div>
  )
}