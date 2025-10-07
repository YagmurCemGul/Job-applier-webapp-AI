import { CV } from '@/types/cv.types'
import { generateId } from '@/lib/helpers/cv.helpers'

export const SAMPLE_CV: CV = {
  id: generateId(),
  userId: 'sample-user',
  firstName: 'John',
  middleName: 'Michael',
  lastName: 'Doe',
  profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',

  contactInfo: {
    email: 'john.doe@example.com',
    phone: '+1234567890',
    phoneCountryCode: '+1',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://www.linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    portfolioUrl: 'https://johndoe.com',
  },

  summary:
    'Experienced Full-Stack Developer with 5+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code and user experience.',

  experience: [
    {
      id: generateId(),
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      employmentType: 'fullTime',
      location: 'San Francisco, CA',
      locationType: 'hybrid',
      startDate: '2022-01-01',
      currentlyWorking: true,
      description:
        'Leading development of microservices architecture. Mentoring junior developers and conducting code reviews. Implemented CI/CD pipelines reducing deployment time by 50%.',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      achievements: [
        'Reduced page load time by 40%',
        'Mentored 5 junior developers',
        'Led migration to microservices',
      ],
    },
    {
      id: generateId(),
      title: 'Full-Stack Developer',
      company: 'StartupXYZ',
      employmentType: 'fullTime',
      location: 'Remote',
      locationType: 'remote',
      startDate: '2019-06-01',
      endDate: '2021-12-31',
      currentlyWorking: false,
      description:
        'Developed and maintained multiple client-facing web applications. Collaborated with design team to implement pixel-perfect UI.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express.js'],
    },
  ],

  education: [
    {
      id: generateId(),
      school: 'University of Technology',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2015-09-01',
      endDate: '2019-06-01',
      grade: '3.8 GPA',
      activities: 'Computer Science Club, Hackathon Winner 2018',
      skills: ['Algorithms', 'Data Structures', 'Software Engineering'],
    },
  ],

  skills: [
    { id: generateId(), name: 'JavaScript', level: 'expert', category: 'Technical Skills' },
    { id: generateId(), name: 'TypeScript', level: 'expert', category: 'Technical Skills' },
    { id: generateId(), name: 'React', level: 'expert', category: 'Frameworks & Libraries' },
    { id: generateId(), name: 'Node.js', level: 'advanced', category: 'Frameworks & Libraries' },
    { id: generateId(), name: 'AWS', level: 'intermediate', category: 'Cloud & DevOps' },
    { id: generateId(), name: 'Docker', level: 'intermediate', category: 'Cloud & DevOps' },
    { id: generateId(), name: 'PostgreSQL', level: 'advanced', category: 'Databases' },
    { id: generateId(), name: 'MongoDB', level: 'intermediate', category: 'Databases' },
  ],

  certifications: [
    {
      id: generateId(),
      name: 'AWS Certified Solutions Architect',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2022-06-01',
      expirationDate: '2025-06-01',
      credentialId: 'AWS-123456',
      credentialUrl: 'https://aws.amazon.com/verification',
      skills: ['AWS', 'Cloud Architecture'],
    },
  ],

  projects: [
    {
      id: generateId(),
      name: 'E-Commerce Platform',
      description:
        'Built a full-featured e-commerce platform with React and Node.js. Implemented payment processing, inventory management, and admin dashboard.',
      url: 'https://github.com/johndoe/ecommerce',
      startDate: '2023-01-01',
      endDate: '2023-06-01',
      skills: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    },
    {
      id: generateId(),
      name: 'Task Management App',
      description:
        'Developed a collaborative task management application with real-time updates using WebSockets.',
      url: 'https://tasks.johndoe.com',
      currentlyWorking: true,
      skills: ['React', 'Socket.io', 'MongoDB'],
    },
  ],

  languages: [
    { id: generateId(), name: 'English', proficiency: 'native' },
    { id: generateId(), name: 'Spanish', proficiency: 'B2' },
  ],

  references: [],

  metadata: {
    template: 'modern',
    language: 'en',
    showProfilePhoto: true,
    showSkillLevels: true,
    showDates: true,
  },

  title: 'Senior Full-Stack Developer CV',
  targetJobTitle: 'Senior Software Engineer',
  targetIndustry: 'Technology',

  isPublic: false,
  isPrimary: true,

  atsScore: 85,
  atsKeywords: ['React', 'Node.js', 'AWS', 'TypeScript', 'Leadership'],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}