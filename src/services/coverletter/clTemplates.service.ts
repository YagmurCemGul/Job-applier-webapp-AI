/**
 * Registry of 15 CL templates with placeholders
 * Placeholders: {{Company}}, {{Role}}, {{RecruiterName}}, {{YourName}}, {{Skills}}, {{WhyUs}}, {{Closing}}
 */
export interface CLTemplate {
  id: string
  name: string
  body: string
}

export const CL_TEMPLATES: CLTemplate[] = [
  {
    id: 'cl-01',
    name: 'Classic Professional',
    body: `Dear {{RecruiterName}},\n\nI am writing to express my interest in the {{Role}} position at {{Company}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nBest regards,\n{{YourName}}`,
  },
  {
    id: 'cl-02',
    name: 'Concise Impact',
    body: `Hello {{RecruiterName}},\n\nFor the {{Role}} position at {{Company}}, I offer: {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nSincerely,\n{{YourName}}`,
  },
  {
    id: 'cl-03',
    name: 'Narrative Style',
    body: `Dear {{RecruiterName}},\n\nThroughout my career, I have developed expertise that aligns perfectly with the {{Role}} role at {{Company}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nWarm regards,\n{{YourName}}`,
  },
  {
    id: 'cl-04',
    name: 'Bullet Format',
    body: `Dear {{RecruiterName}},\n\nI am excited to apply for the {{Role}} position at {{Company}}.\n\nKey qualifications:\n• {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nBest,\n{{YourName}}`,
  },
  {
    id: 'cl-05',
    name: 'Story Opening',
    body: `Dear {{RecruiterName}},\n\nWhen I saw the {{Role}} opening at {{Company}}, I knew it was the perfect opportunity to contribute my expertise. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nRespectfully,\n{{YourName}}`,
  },
  {
    id: 'cl-06',
    name: 'Data-Driven',
    body: `Dear {{RecruiterName}},\n\nI am applying for the {{Role}} position at {{Company}} with proven results: {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nKind regards,\n{{YourName}}`,
  },
  {
    id: 'cl-07',
    name: 'Problem-Solution',
    body: `Dear {{RecruiterName}},\n\nI understand {{Company}} is seeking a {{Role}} to address key challenges. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nYours sincerely,\n{{YourName}}`,
  },
  {
    id: 'cl-08',
    name: 'Enthusiastic Opener',
    body: `Dear {{RecruiterName}},\n\nI'm thrilled to apply for the {{Role}} position at {{Company}}! {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nBest wishes,\n{{YourName}}`,
  },
  {
    id: 'cl-09',
    name: 'Direct & Bold',
    body: `{{RecruiterName}},\n\nI'm your ideal candidate for {{Role}} at {{Company}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\n{{YourName}}`,
  },
  {
    id: 'cl-10',
    name: 'Value Proposition',
    body: `Dear {{RecruiterName}},\n\nI will bring immediate value to {{Company}} as your next {{Role}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nSincerely yours,\n{{YourName}}`,
  },
  {
    id: 'cl-11',
    name: 'Research-Based',
    body: `Dear {{RecruiterName}},\n\nAfter researching {{Company}}, I'm convinced the {{Role}} position is an excellent match. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nWith appreciation,\n{{YourName}}`,
  },
  {
    id: 'cl-12',
    name: 'Achievement Focus',
    body: `Dear {{RecruiterName}},\n\nMy track record makes me a strong candidate for {{Role}} at {{Company}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nProfessionally yours,\n{{YourName}}`,
  },
  {
    id: 'cl-13',
    name: 'Collaborative Tone',
    body: `Dear {{RecruiterName}},\n\nI look forward to collaborating with the team at {{Company}} as a {{Role}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nBest regards,\n{{YourName}}`,
  },
  {
    id: 'cl-14',
    name: 'Mission-Aligned',
    body: `Dear {{RecruiterName}},\n\nYour mission at {{Company}} resonates deeply with my values, making the {{Role}} position ideal. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nRespectfully yours,\n{{YourName}}`,
  },
  {
    id: 'cl-15',
    name: 'Modern & Brief',
    body: `Hi {{RecruiterName}},\n\nLet's connect about the {{Role}} role at {{Company}}. {{Skills}}\n\n{{WhyUs}}\n\n{{Closing}}\n\nCheers,\n{{YourName}}`,
  },
]

export function getTemplateById(id: string): CLTemplate {
  return CL_TEMPLATES.find((t) => t.id === id) ?? CL_TEMPLATES[0]
}
