/**
 * Cover Letter Templates Service - Step 30
 * Registry of 15 CL templates with placeholders
 */

/**
 * Cover Letter Template Definition
 * Placeholders: {{Company}}, {{Role}}, {{RecruiterName}}, {{YourName}}, 
 * {{Skills}}, {{WhyUs}}, {{Closing}}
 */
export interface CLTemplate {
  id: string
  name: string
  body: string // with placeholders; language-agnostic
}

/**
 * 15 Cover Letter Templates
 */
export const CL_TEMPLATES: CLTemplate[] = [
  {
    id: 'cl-01',
    name: 'Classic Professional',
    body: `Dear {{RecruiterName}},

I am writing to express my interest in the {{Role}} role at {{Company}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Best regards,
{{YourName}}`,
  },
  {
    id: 'cl-02',
    name: 'Concise Impact',
    body: `Hello {{RecruiterName}},

For the {{Role}} at {{Company}}, I offer: {{Skills}}

{{WhyUs}}

{{Closing}}

{{YourName}}`,
  },
  {
    id: 'cl-03',
    name: 'Story-Driven',
    body: `Dear {{RecruiterName}},

Throughout my career, I have consistently delivered results that align with what {{Company}} seeks in a {{Role}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Sincerely,
{{YourName}}`,
  },
  {
    id: 'cl-04',
    name: 'Data-Focused',
    body: `Dear {{RecruiterName}},

I am excited to apply for the {{Role}} position at {{Company}}. My background includes {{Skills}}, with measurable outcomes that demonstrate my capability.

{{WhyUs}}

{{Closing}}

Best regards,
{{YourName}}`,
  },
  {
    id: 'cl-05',
    name: 'Bullet-Style Modern',
    body: `Dear {{RecruiterName}},

I am eager to contribute to {{Company}} as a {{Role}}. Here's what I bring:

• {{Skills}}
• {{WhyUs}}

{{Closing}}

{{YourName}}`,
  },
  {
    id: 'cl-06',
    name: 'Achievement-Led',
    body: `Dear {{RecruiterName}},

My recent accomplishments directly align with the {{Role}} role at {{Company}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Respectfully,
{{YourName}}`,
  },
  {
    id: 'cl-07',
    name: 'Warm & Friendly',
    body: `Hi {{RecruiterName}},

I'm thrilled to apply for the {{Role}} position at {{Company}}! {{Skills}}

{{WhyUs}}

{{Closing}}

Warm regards,
{{YourName}}`,
  },
  {
    id: 'cl-08',
    name: 'Executive Brief',
    body: `Dear {{RecruiterName}},

I am writing to explore the {{Role}} opportunity at {{Company}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Yours sincerely,
{{YourName}}`,
  },
  {
    id: 'cl-09',
    name: 'Technical Specialist',
    body: `Dear {{RecruiterName}},

As a technical professional, I am keen to join {{Company}} as {{Role}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Best,
{{YourName}}`,
  },
  {
    id: 'cl-10',
    name: 'Creative Narrative',
    body: `Dear {{RecruiterName}},

Imagine a {{Role}} who brings {{Skills}} to {{Company}} — that's exactly what I offer.

{{WhyUs}}

{{Closing}}

Creatively yours,
{{YourName}}`,
  },
  {
    id: 'cl-11',
    name: 'Problem-Solution',
    body: `Dear {{RecruiterName}},

{{Company}} seeks a {{Role}} to address key challenges. My approach: {{Skills}}

{{WhyUs}}

{{Closing}}

Regards,
{{YourName}}`,
  },
  {
    id: 'cl-12',
    name: 'Value Proposition',
    body: `Dear {{RecruiterName}},

For {{Company}}, hiring me as {{Role}} means gaining: {{Skills}}

{{WhyUs}}

{{Closing}}

{{YourName}}`,
  },
  {
    id: 'cl-13',
    name: 'Startup Enthusiast',
    body: `Hey {{RecruiterName}},

I'm excited about the {{Role}} role at {{Company}}! {{Skills}}

{{WhyUs}}

{{Closing}}

Cheers,
{{YourName}}`,
  },
  {
    id: 'cl-14',
    name: 'Academic Formal',
    body: `Dear {{RecruiterName}},

I wish to submit my application for the {{Role}} position at {{Company}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Yours faithfully,
{{YourName}}`,
  },
  {
    id: 'cl-15',
    name: 'Industry Expert',
    body: `Dear {{RecruiterName}},

With deep industry expertise, I am well-positioned for the {{Role}} at {{Company}}. {{Skills}}

{{WhyUs}}

{{Closing}}

Professional regards,
{{YourName}}`,
  },
]

/**
 * Get template by ID
 */
export function getTemplateById(id: string): CLTemplate {
  return CL_TEMPLATES.find((t) => t.id === id) ?? CL_TEMPLATES[0]
}
