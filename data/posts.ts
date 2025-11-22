export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  tags: string[]
}

export const posts: BlogPost[] = [
  {
    slug: 'from-civil-engineering-to-frontend-development',
    title: 'From Civil Engineering to Front-End Development',
    excerpt:
      'My journey from analyzing structures to building user interfaces—how analytical thinking and problem-solving skills translate across domains.',
    content: `
# From Civil Engineering to Front-End Development

My transition from civil engineering to frontend development wasn't just a career change—it was leveraging analytical thinking and problem-solving skills in a new domain.

## The Parallels

The attention to detail required in structural analysis translates directly to writing clean, performant code. Just as engineers analyze loads, forces, and materials, developers analyze user requirements, performance bottlenecks, and technical constraints.

## The Learning Curve

Making the switch required:
- Learning modern JavaScript and React
- Understanding web performance optimization
- Building responsive, accessible UIs
- Collaborating with cross-functional teams

## The Value

The analytical mindset from engineering has been invaluable in:
- Debugging complex issues
- Optimizing application performance
- Architecting scalable solutions
- Mentoring other developers

The journey continues, and I'm excited to keep building better web experiences.
    `,
    date: '2024-03-15',
    readTime: '5 min',
    tags: ['Career', 'Journey'],
  },
  {
    slug: 'improving-performance-react-apps',
    title:
      'Improving Performance in React Apps with Code-Splitting and Memoization',
    excerpt:
      'Practical strategies for optimizing React applications through code-splitting, memoization, and dynamic imports.',
    content: `
# Improving Performance in React Apps

Performance optimization is crucial for creating fast, responsive web applications. Here are some strategies I've used:

## Code-Splitting

Code-splitting allows you to load only the JavaScript needed for the current route:

\`\`\`javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'))
\`\`\`

## Memoization

Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders:

\`\`\`javascript
const MemoizedComponent = React.memo(({ data }) => {
  // Component logic
})
\`\`\`

## Dynamic Imports

Load components and modules only when needed, reducing initial bundle size.

These techniques have helped me build applications that load faster and provide better user experiences.
    `,
    date: '2024-02-20',
    readTime: '8 min',
    tags: ['React', 'Performance', 'Optimization'],
  },
  {
    slug: 'react-typescript-scalable-frontends',
    title: 'Using React and TypeScript for Scalable Frontends',
    excerpt:
      'How TypeScript enhances React development with type safety, better tooling, and improved developer experience.',
    content: `
# Using React and TypeScript for Scalable Frontends

TypeScript brings type safety and better developer experience to React development.

## Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring tools
- **Self-Documenting Code**: Types serve as documentation
- **Easier Refactoring**: Confidence when making changes

## Example

\`\`\`typescript
interface UserProps {
  name: string
  email: string
  age?: number
}

const UserCard: React.FC<UserProps> = ({ name, email, age }) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      {age && <p>Age: {age}</p>}
    </div>
  )
}
\`\`\`

TypeScript has become essential for building maintainable, scalable React applications.
    `,
    date: '2024-01-10',
    readTime: '6 min',
    tags: ['React', 'TypeScript', 'Frontend'],
  },
]

