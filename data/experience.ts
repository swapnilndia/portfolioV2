export type Experience = {
  id: string
  company: string
  title: string
  location: string
  timeframe: string
  bullets: string[]
  techStack: string[]
  category: 'software' | 'civil'
}

export const experiences: Experience[] = [
  {
    id: 'tekonika-2025',
    company: 'Tekonika Technologies',
    title: 'Software Developer',
    location: 'Noida, India',
    timeframe: 'May 2025 – Present',
    bullets: [
      'Built frontend for eCommerce platform using React, Redux, SCSS, and modern JavaScript',
      'Implemented SEO improvements, code-splitting, and bundle optimization',
      'Improved page load times and overall application performance',
      'Collaborated with cross-functional teams to deliver product features',
    ],
    techStack: ['React', 'Redux', 'SCSS', 'JavaScript', 'REST APIs'],
    category: 'software',
  },
  {
    id: 'wagergeeks-2025',
    company: 'WagerGeeks Private Limited',
    title: 'Software Developer',
    location: 'Noida, India',
    timeframe: 'Feb 2025 – May 2025',
    bullets: [
      'Maintained and enhanced legacy React application',
      'Built Next.js eGaming platform frontend with gaming lobby UI and auth flows',
      'Developed Admin Portal with React + REST APIs for real-time data and content management',
      'Implemented responsive designs and optimized user interactions',
    ],
    techStack: ['React', 'Next.js', 'JavaScript', 'REST APIs', 'CSS'],
    category: 'software',
  },
  {
    id: 'treeroot-2023',
    company: 'Treeroot Informatics',
    title: 'React Developer',
    location: 'Remote',
    timeframe: 'Jan 2023 – Apr 2024',
    bullets: [
      'Developed Credit Management System for Dutch clients using React + Redux',
      'Implemented performance optimizations: memoization, dynamic imports, code-splitting',
      'Built data-heavy UI with complex state management requirements',
      'Ensured secure data handling and user authentication flows',
    ],
    techStack: ['React', 'Redux', 'JavaScript', 'CSS'],
    category: 'software',
  },
  {
    id: 'sharpener-2022',
    company: 'Sharpener Tech',
    title: 'Front-End Intern',
    location: 'Remote',
    timeframe: 'Jan 2022 – Dec 2022',
    bullets: [
      'Built responsive UIs with React, Material-UI, HTML, and CSS',
      'Used Redux and Context API for state management',
      'Mentored junior developers and contributed to team knowledge sharing',
      'Collaborated on multiple projects and improved development workflows',
    ],
    techStack: ['React', 'Material-UI', 'Redux', 'Context API', 'HTML', 'CSS'],
    category: 'software',
  },
  {
    id: 'econstruct-2019',
    company: 'Econstruct',
    title: 'Structural Design Engineer',
    location: 'India',
    timeframe: 'Jun 2019 – Jan 2022',
    bullets: [
      'Performed structural analysis and design for various projects',
      'Mentored 200+ students in structural engineering concepts',
      'Developed analytical thinking and problem-solving skills',
      'Applied engineering principles to real-world challenges',
    ],
    techStack: [],
    category: 'civil',
  },
]

