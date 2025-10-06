import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Crown, LayoutTemplate } from 'lucide-react'
import { useTemplateStore } from '@/store/templateStore'
import { cn } from '@/lib/utils'

export function TemplateSelector() {
  const { templates, selectedTemplateId, selectTemplate } = useTemplateStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'creative', label: 'Creative' },
    { value: 'executive', label: 'Executive' },
    { value: 'custom', label: 'My Templates' },
  ]

  const filteredTemplates = templates.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  )

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <LayoutTemplate className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Choose Template</h3>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-4 grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Template Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                'relative cursor-pointer rounded-lg border-2 p-4 transition-all',
                selectedTemplateId === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              )}
              onClick={() => selectTemplate(template.id)}
            >
              {/* Template Preview Placeholder */}
              <div className="relative mb-3 flex aspect-[8.5/11] items-center justify-center overflow-hidden rounded bg-gray-100">
                <div className="text-6xl text-gray-300">
                  {template.category === 'modern' && '📄'}
                  {template.category === 'classic' && '📋'}
                  {template.category === 'minimal' && '📃'}
                  {template.category === 'creative' && '🎨'}
                  {template.category === 'executive' && '💼'}
                  {template.category === 'custom' && '⚙️'}
                </div>

                {/* Selected Indicator */}
                {selectedTemplateId === template.id && (
                  <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute left-2 top-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Crown className="mr-1 h-3 w-3" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div>
                <h4 className="mb-1 font-semibold">{template.name}</h4>
                <p className="mb-2 text-xs text-gray-600">{template.description}</p>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {template.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.structure.layout}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Info Box */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> Choose a template that matches your industry and experience level.
          Modern templates work well for tech roles, while Classic is best for ATS systems.
        </p>
      </div>
    </Card>
  )
}
