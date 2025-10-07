import { CVData } from '@/types/cvData.types'
import { CVTemplate } from '@/types/template.types'
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react'
import { format } from 'date-fns'

interface TemplateProps {
  data: CVData
  template: CVTemplate
}

export function ModernTemplate({ data, template }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, projects } = data
  const { styling, structure } = template

  const fullName = `${personalInfo.firstName} ${personalInfo.middleName || ''} ${personalInfo.lastName}`.trim()

  return (
    <div
      className="w-[210mm] min-h-[297mm] mx-auto p-12 bg-white"
      style={{
        fontFamily: styling.fontFamily,
        fontSize: `${styling.fontSize.body}pt`,
        color: styling.colors.text,
      }}
    >
      {/* Header */}
      <header className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontSize: `${styling.fontSize.heading}pt`,
            color: styling.colors.primary,
          }}
        >
          {fullName}
        </h1>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{personalInfo.phoneCountryCode} {personalInfo.phone}</span>
            </div>
          )}
          {(personalInfo.location.city || personalInfo.location.country) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {[personalInfo.location.city, personalInfo.location.state, personalInfo.location.country]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-4 mt-2 text-sm">
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1" style={{ color: styling.colors.accent }}>
              <Linkedin className="h-4 w-4" />
              <span>linkedin.com/in/{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1" style={{ color: styling.colors.accent }}>
              <Github className="h-4 w-4" />
              <span>github.com/{personalInfo.github}</span>
            </div>
          )}
          {personalInfo.portfolio && (
            <div className="flex items-center gap-1" style={{ color: styling.colors.accent }}>
              <Globe className="h-4 w-4" />
              <span>{personalInfo.portfolio}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && structure.sections.find(s => s.type === 'summary')?.enabled && (
        <section className="mb-6">
          <h2
            className="font-semibold mb-3 pb-2 border-b"
            style={{
              fontSize: `${styling.fontSize.subheading}pt`,
              color: styling.colors.primary,
              borderColor: styling.colors.primary,
            }}
          >
            Professional Summary
          </h2>
          <p className="leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && structure.sections.find(s => s.type === 'experience')?.enabled && (
        <section className="mb-6">
          <h2
            className="font-semibold mb-3 pb-2 border-b"
            style={{
              fontSize: `${styling.fontSize.subheading}pt`,
              color: styling.colors.primary,
              borderColor: styling.colors.primary,
            }}
          >
            Work Experience
          </h2>
          
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm" style={{ color: styling.colors.secondary }}>
                      {exp.company} • {exp.employmentType}
                    </p>
                  </div>
                  <div className="text-sm text-right" style={{ color: styling.colors.secondary }}>
                    <div>
                      {format(exp.startDate, 'MMM yyyy')} -{' '}
                      {exp.currentlyWorking ? 'Present' : exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'N/A'}
                    </div>
                    {exp.location && (
                      <div className="text-xs">{exp.location}</div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed whitespace-pre-line mb-2">
                  {exp.description}
                </p>
                
                {exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${styling.colors.primary}15`,
                          color: styling.colors.primary,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && structure.sections.find(s => s.type === 'education')?.enabled && (
        <section className="mb-6">
          <h2
            className="font-semibold mb-3 pb-2 border-b"
            style={{
              fontSize: `${styling.fontSize.subheading}pt`,
              color: styling.colors.primary,
              borderColor: styling.colors.primary,
            }}
          >
            Education
          </h2>
          
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold">{edu.school}</h3>
                    <p className="text-sm" style={{ color: styling.colors.secondary }}>
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                  </div>
                  <div className="text-sm" style={{ color: styling.colors.secondary }}>
                    {format(edu.startDate, 'MMM yyyy')} -{' '}
                    {edu.currentlyStudying ? 'Present' : edu.endDate ? format(edu.endDate, 'MMM yyyy') : 'N/A'}
                  </div>
                </div>
                
                {edu.grade && (
                  <p className="text-sm" style={{ color: styling.colors.secondary }}>
                    Grade: {edu.grade}
                  </p>
                )}
                
                {edu.description && (
                  <p className="text-sm mt-1 leading-relaxed">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && structure.sections.find(s => s.type === 'skills')?.enabled && (
        <section className="mb-6">
          <h2
            className="font-semibold mb-3 pb-2 border-b"
            style={{
              fontSize: `${styling.fontSize.subheading}pt`,
              color: styling.colors.primary,
              borderColor: styling.colors.primary,
            }}
          >
            Skills
          </h2>
          
          {/* Group skills by category */}
          {Object.entries(
            skills.reduce((acc, skill) => {
              if (!acc[skill.category]) {
                acc[skill.category] = []
              }
              acc[skill.category].push(skill)
              return acc
            }, {} as Record<string, typeof skills>)
          ).map(([category, categorySkills]) => (
            <div key={category} className="mb-3">
              <h4 className="text-sm font-medium mb-2" style={{ color: styling.colors.secondary }}>
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-sm px-3 py-1 rounded"
                    style={{
                      backgroundColor: `${styling.colors.primary}15`,
                      color: styling.colors.text,
                    }}
                  >
                    {skill.name}
                    {skill.yearsOfExperience && (
                      <span className="text-xs ml-1" style={{ color: styling.colors.secondary }}>
                        ({skill.yearsOfExperience}y)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && structure.sections.find(s => s.type === 'projects')?.enabled && (
        <section className="mb-6">
          <h2
            className="font-semibold mb-3 pb-2 border-b"
            style={{
              fontSize: `${styling.fontSize.subheading}pt`,
              color: styling.colors.primary,
              borderColor: styling.colors.primary,
            }}
          >
            Projects
          </h2>
          
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold">{project.name}</h3>
                {project.role && (
                  <p className="text-sm" style={{ color: styling.colors.secondary }}>
                    {project.role}
                  </p>
                )}
                <p className="text-sm mt-1 leading-relaxed">{project.description}</p>
                
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${styling.colors.primary}15`,
                          color: styling.colors.primary,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
