import React from 'react'
import type { IconType } from 'react-icons'
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss3,
  SiSass,
  SiRedux,
  SiNextdotjs,
  SiNodedotjs,
  SiGit,
  SiGithub,
  SiMui,
  SiTailwindcss,
  SiJira,
  SiFigma,
  SiPostman,
  SiSwagger,
  SiAmazon,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiVercel,
  SiNetlify,
  SiFirebase,
  SiGraphql,
  SiRust,
  SiPython,
  SiGo,
  SiPhp,
  SiRubyonrails,
  SiDjango,
  SiFlask,
  SiExpress,
  SiNestjs,
  SiAngular,
  SiVuedotjs,
  SiNuxtdotjs,
  SiSvelte,
  SiJest,
  SiTestinglibrary,
  SiCypress,
  SiWebpack,
  SiVite,
  SiPnpm,
  SiYarn,
  SiNpm,
  SiEslint,
  SiPrettier,
  SiJquery,
  SiBootstrap,
  SiMaterialdesign,
} from 'react-icons/si'

// Map technology names to their corresponding icons
export const techIconsMap: Record<string, IconType> = {
  // Frontend Frameworks & Libraries
  React: SiReact,
  'React.js': SiReact,
  'React JS': SiReact,
  Nextjs: SiNextdotjs,
  'Next.js': SiNextdotjs,
  Angular: SiAngular,
  Vue: SiVuedotjs,
  'Vue.js': SiVuedotjs,
  Nuxt: SiNuxtdotjs,
  'Nuxt.js': SiNuxtdotjs,
  Svelte: SiSvelte,
  jQuery: SiJquery,

  // Languages
  JavaScript: SiJavascript,
  'JavaScript (ES6+)': SiJavascript,
  JS: SiJavascript,
  TypeScript: SiTypescript,
  TS: SiTypescript,
  HTML: SiHtml5,
  HTML5: SiHtml5,
  CSS: SiCss3,
  CSS3: SiCss3,
  SCSS: SiSass,
  Sass: SiSass,
  SASS: SiSass,
  Python: SiPython,
  Rust: SiRust,
  Go: SiGo,
  PHP: SiPhp,
  Ruby: SiRubyonrails,
  'Ruby on Rails': SiRubyonrails,

  // State Management
  Redux: SiRedux,
  'Redux Toolkit': SiRedux,

  // UI Libraries & Frameworks
  'Material-UI': SiMui,
  'Material UI': SiMui,
  MUI: SiMui,
  'Tailwind CSS': SiTailwindcss,
  Tailwind: SiTailwindcss,
  Bootstrap: SiBootstrap,
  'Material Design': SiMaterialdesign,

  // Backend
  Nodejs: SiNodedotjs,
  'Node.js': SiNodedotjs,
  Express: SiExpress,
  'Express.js': SiExpress,
  NestJS: SiNestjs,
  Django: SiDjango,
  Flask: SiFlask,

  // Databases
  MySQL: SiMysql,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,

  // Tools & Services
  Git: SiGit,
  GitHub: SiGithub,
  Jira: SiJira,
  Figma: SiFigma,
  Postman: SiPostman,
  Swagger: SiSwagger,
  AWS: SiAmazon,
  'AWS EC2': SiAmazon,
  'AWS RDS': SiAmazon,
  Amazon: SiAmazon,
  Docker: SiDocker,
  Vercel: SiVercel,
  Netlify: SiNetlify,
  Firebase: SiFirebase,

  // Testing
  Jest: SiJest,
  'React Testing Library': SiTestinglibrary,
  Cypress: SiCypress,

  // Build Tools
  Webpack: SiWebpack,
  Vite: SiVite,
  pnpm: SiPnpm,
  yarn: SiYarn,
  npm: SiNpm,

  // Linting & Formatting
  ESLint: SiEslint,
  Prettier: SiPrettier,

  // APIs
  'REST APIs': SiPostman,
  GraphQL: SiGraphql,
  'REST API': SiPostman,
}

/**
 * Get icon component for a technology name
 * @param techName - Name of the technology
 * @returns Icon component or null if not found
 */
export const getTechIcon = (techName: string): IconType | null => {
  // Try exact match first
  if (techIconsMap[techName]) {
    return techIconsMap[techName]
  }

  // Try case-insensitive match
  const normalized = techName.trim()
  const lowerCase = normalized.toLowerCase()

  for (const [key, icon] of Object.entries(techIconsMap)) {
    if (key.toLowerCase() === lowerCase) {
      return icon
    }
  }

  // Try partial match (e.g., "React" matches "React.js")
  for (const [key, icon] of Object.entries(techIconsMap)) {
    if (
      normalized.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return icon
    }
  }

  return null
}

/**
 * TechIcon component - renders icon with fallback
 */
interface TechIconProps {
  name: string
  size?: number | string
  className?: string
}

export const TechIcon: React.FC<TechIconProps> = ({
  name,
  size = 16,
  className = '',
}) => {
  const IconComponent = getTechIcon(name)

  if (!IconComponent) {
    return null
  }

  return <IconComponent size={size} className={className} />
}

