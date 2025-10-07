import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Crown, LayoutTemplate } from 'lucide-react'
import { useTemplateStore } from '@/stores/template.store'
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
      <div className="flex items-center gap-2 mb-6">
        <LayoutTemplate className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Choose Template</h3>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 mb-4">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Template Grid */}
      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                'relative border-2 rounded-lg p-4 cursor-pointer transition-all',
                selectedTemplateId === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              )}
              onClick={() => selectTemplate(template.id)}
            >
              {/* Template Preview Placeholder */}
              <div className="aspect-[8.5/11] bg-gray-100 rounded mb-3 flex items-center justify-center relative overflow-hidden">
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
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div>
                <h4 className="font-semibold mb-1">{template.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                
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
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> Choose a template that matches your industry and experience level.
          Modern templates work well for tech roles, while Classic is best for ATS systems.
        </p>
      </div>
    </Card>
  )
}