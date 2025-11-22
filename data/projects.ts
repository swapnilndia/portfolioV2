export type Project = {
  slug: string
  title: string
  role: string
  company?: string
  timeframe: string
  techStack: string[]
  summary: string
  problem: string
  solution: string
  impact: string
  links?: { type: 'live' | 'github'; url: string }[]
  featured?: boolean
}

export const projects: Project[] = [
  {
    slug: 'ecommerce-platform-frontend',
    title: 'eCommerce Platform Frontend',
    role: 'Software Developer',
    company: 'Tekonika Technologies',
    timeframe: 'May 2025 – Present',
    techStack: ['React', 'Redux', 'SCSS', 'REST APIs', 'JavaScript'],
    summary:
      'Built and maintained the frontend for an eCommerce platform with a focus on responsive design, SEO optimization, and performance.',
    problem:
      'The existing eCommerce platform needed improved SEO rankings, faster page loads, and better code organization to support growing feature requirements.',
    solution:
      'Implemented code-splitting and bundle optimization strategies, improved semantic HTML structure for SEO, and refactored components using React and Redux for better state management. Used SCSS for maintainable styling.',
    impact:
      'Improved page load times by ~40%, enhanced SEO rankings, and established a scalable codebase structure that supports continuous feature development.',
    links: [
      { type: 'live', url: '#' },
      { type: 'github', url: '#' },
    ],
    featured: true,
  },
  {
    slug: 'nextjs-egaming-platform',
    title: 'Next.js eGaming Platform',
    role: 'Software Developer',
    company: 'WagerGeeks Private Limited',
    timeframe: 'Feb 2025 – May 2025',
    techStack: ['React', 'Next.js', 'JavaScript', 'REST APIs'],
    summary:
      'Built a Next.js eGaming platform frontend with gaming lobby UI, authentication flows, and dynamic pages.',
    problem:
      'Needed a modern, scalable frontend for an eGaming platform that could handle real-time updates, complex authentication flows, and dynamic content loading.',
    solution:
      'Developed the frontend using Next.js for SSR capabilities and optimized routing. Built reusable components for gaming lobby UI, implemented secure authentication flows, and created dynamic pages for game content.',
    impact:
      'Delivered a performant eGaming platform with improved user experience, faster navigation, and better SEO through Next.js SSR capabilities.',
    links: [{ type: 'live', url: '#' }],
    featured: true,
  },
  {
    slug: 'egaming-admin-portal',
    title: 'eGaming Admin Portal',
    role: 'Software Developer',
    company: 'WagerGeeks Private Limited',
    timeframe: 'Feb 2025 – May 2025',
    techStack: ['React', 'REST APIs', 'JavaScript', 'CSS'],
    summary:
      'Built an Admin Portal with React and REST APIs for real-time data visualization, content management, and administrative operations.',
    problem:
      'Administrators needed a comprehensive dashboard to manage content, view real-time statistics, and perform administrative tasks efficiently.',
    solution:
      'Created a React-based admin portal with REST API integration. Implemented dashboards with real-time data updates, content management interfaces, and intuitive navigation. Focused on responsive design and user-friendly interactions.',
    impact:
      'Streamlined administrative workflows, improved content management efficiency, and provided administrators with actionable insights through data visualization.',
    links: [{ type: 'live', url: '#' }],
    featured: true,
  },
  {
    slug: 'credit-management-system',
    title: 'Credit Management System (B2B)',
    role: 'React Developer',
    company: 'Treeroot Informatics',
    timeframe: 'Jan 2023 – Apr 2024',
    techStack: ['React', 'Redux', 'JavaScript', 'CSS'],
    summary:
      'Developed a B2B Credit Management System for Dutch clients using React and Redux, with a focus on performance optimization and data-heavy UI.',
    problem:
      'The credit management system needed to handle large datasets efficiently, provide smooth user interactions, and ensure fast rendering of complex data tables and forms.',
    solution:
      'Built the frontend using React and Redux for state management. Implemented performance optimizations including memoization, dynamic imports, and code-splitting. Created reusable components for data-heavy UI elements.',
    impact:
      'Significantly improved application performance, reduced load times, and provided a smooth user experience even with large datasets. Enabled efficient credit management workflows for the B2B client.',
    links: [{ type: 'github', url: '#' }],
    featured: true,
  },
  {
    slug: 'legacy-react-app-maintenance',
    title: 'Legacy React App Maintenance',
    role: 'Software Developer',
    company: 'WagerGeeks Private Limited',
    timeframe: 'Feb 2025 – May 2025',
    techStack: ['React', 'JavaScript', 'CSS'],
    summary:
      'Maintained and enhanced a legacy React application, improving code quality and adding new features while preserving existing functionality.',
    problem:
      'The legacy application needed updates and new features while maintaining backward compatibility and avoiding breaking changes.',
    solution:
      'Refactored critical components, improved code organization, and added new features incrementally. Documented existing functionality and established patterns for future development.',
    impact:
      'Improved maintainability of the legacy codebase, enabled faster feature development, and ensured stable application performance.',
    featured: false,
  },
]

