import { CVData } from '@/types/cvData.types'
import { CVTemplate } from '@/types/template.types'
import { ModernTemplate } from './templates/ModernTemplate'
import { ClassicTemplate } from './templates/ClassicTemplate'
import { MinimalTemplate } from './templates/MinimalTemplate'
import { CreativeTemplate } from './templates/CreativeTemplate'
import { ExecutiveTemplate } from './templates/ExecutiveTemplate'

interface CVRendererProps {
  data: CVData
  template: CVTemplate
  scale?: number
}

export function CVRenderer({ data, template, scale = 1 }: CVRendererProps) {
  const renderTemplate = () => {
    switch (template.id) {
      case 'template-modern':
        return <ModernTemplate data={data} template={template} />
      case 'template-classic':
        return <ClassicTemplate data={data} template={template} />
      case 'template-minimal':
        return <MinimalTemplate data={data} template={template} />
      case 'template-creative':
        return <CreativeTemplate data={data} template={template} />
      case 'template-executive':
        return <ExecutiveTemplate data={data} template={template} />
      default:
        return <ModernTemplate data={data} template={template} />
    }
  }

  return (
    <div
      className="cv-renderer bg-white shadow-lg"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease',
      }}
    >
      {renderTemplate()}
    </div>
  )
}
