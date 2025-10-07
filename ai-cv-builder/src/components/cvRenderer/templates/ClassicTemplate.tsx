import { CVData } from '@/types/cvData.types'
import { CVTemplate } from '@/types/template.types'
import { format } from 'date-fns'

interface TemplateProps {
  data: CVData
  template: CVTemplate
}

export function ClassicTemplate({ data, template }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills } = data
  const { styling } = template

  const fullName = `${personalInfo.firstName} ${personalInfo.middleName || ''} ${personalInfo.lastName}`.trim()

  return (
    <div
      className="w-[210mm] min-h-[297mm] mx-auto p-16 bg-white"
      style={{
        fontFamily: styling.fontFamily,
        fontSize: `${styling.fontSize.body}pt`,
        color: styling.colors.text,
      }}
    >
      {/* Centered Header */}
      <header className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: styling.colors.primary }}>
        <h1
          className="font-bold mb-3"
          style={{
            fontSize: `${styling.fontSize.heading}pt`,
          }}
        >
          {fullName}
        </h1>

        <div className="text-sm space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && (
            <div>{personalInfo.phoneCountryCode} {personalInfo.phone}</div>
          )}
          {(personalInfo.location.city || personalInfo.location.country) && (
            <div>
              {[personalInfo.location.city, personalInfo.location.state, personalInfo.location.country]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="font-bold text-center mb-3" style={{ fontSize: `${styling.fontSize.subheading}pt` }}>
            OBJECTIVE
          </h2>
          <p className="text-center leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: `${styling.fontSize.subheading}pt` }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between mb-1">
                  <div className="font-semibold">{exp.title}</div>
                  <div className="text-sm">
                    {format(exp.startDate, 'MM/yyyy')} - {exp.currentlyWorking ? 'Present' : exp.endDate ? format(exp.endDate, 'MM/yyyy') : 'N/A'}
                  </div>
                </div>
                <div className="italic mb-2">{exp.company}</div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: `${styling.fontSize.subheading}pt` }}>
            EDUCATION
          </h2>
          
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between mb-1">
                  <div className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div className="text-sm">
                    {format(edu.startDate, 'MM/yyyy')} - {edu.currentlyStudying ? 'Present' : edu.endDate ? format(edu.endDate, 'MM/yyyy') : 'N/A'}
                  </div>
                </div>
                <div className="italic">{edu.school}</div>
                {edu.grade && <div className="text-sm">Grade: {edu.grade}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-center mb-4" style={{ fontSize: `${styling.fontSize.subheading}pt` }}>
            CORE COMPETENCIES
          </h2>
          
          <div className="text-center">
            {skills.map((skill, idx) => (
              <span key={skill.id}>
                {skill.name}
                {idx < skills.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
