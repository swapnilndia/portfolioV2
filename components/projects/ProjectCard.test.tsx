import React from 'react'
import { render } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'
import { projects } from '@/data/projects'

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ProjectCard', () => {
  const project = projects[0]

  it('renders project title', () => {
    const { getByText } = render(<ProjectCard project={project} />)
    expect(getByText(project.title)).toBeInTheDocument()
  })

  it('renders tech stack tags', () => {
    const { getAllByText, getByText } = render(<ProjectCard project={project} />)
    project.techStack.forEach((tech) => {
      expect(getByText(tech)).toBeInTheDocument()
    })
  })

  it('contains link to project detail route', () => {
    const { getByRole } = render(<ProjectCard project={project} />)
    const link = getByRole('link', { name: /view details/i })
    expect(link).toHaveAttribute('href', `/projects/${project.slug}`)
  })

  it('renders company if provided', () => {
    const { getByText } = render(<ProjectCard project={project} />)
    if (project.company) {
      expect(getByText(project.company)).toBeInTheDocument()
    }
  })

  it('renders timeframe', () => {
    const { getByText } = render(<ProjectCard project={project} />)
    expect(getByText(project.timeframe)).toBeInTheDocument()
  })
})
