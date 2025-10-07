import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Eye, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { CVRenderer } from '@/components/cvRenderer/CVRenderer'
import { useCVDataStore } from '@/stores/cvData.store'
import { useTemplateStore } from '@/stores/template.store'

export function LivePreview() {
  const { currentCV } = useCVDataStore()
  const { getSelectedTemplate } = useTemplateStore()
  const [zoom, setZoom] = useState(0.6)

  const template = getSelectedTemplate()

  if (!currentCV || !template) {
    return (
      <Card className="p-12 text-center">
        <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
        <p className="text-gray-600">
          Fill in your information to see a live preview of your CV
        </p>
      </Card>
    )
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 1.5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3))
  }

  const handleFitToWidth = () => {
    setZoom(0.6)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Live Preview</h3>
            <span className="text-sm text-gray-500">• {template.name}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.3}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <div className="w-32">
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={0.3}
                  max={1.5}
                  step={0.1}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 1.5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <span className="text-sm text-gray-600 w-12">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleFitToWidth}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fit
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 bg-gray-100">
            <CVRenderer
              data={currentCV}
              template={template}
              scale={zoom}
            />
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
