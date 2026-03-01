import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/data/projects";
import "./ProjectCard.scss";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card as="article" className="project-card">
      <div className="project-card__header">
        <h3 className="project-card__title">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        {project.company && <p className="project-card__company">{project.company}</p>}
        <p className="project-card__timeframe">{project.timeframe}</p>
      </div>
      <div className="project-card__body">
        <p className="project-card__summary">{project.summary}</p>
        <div className="project-card__tech">
          {project.techStack.map((tech) => (
            <Tag key={tech} variant="primary" size="sm" showIcon techName={tech}>
              {tech}
            </Tag>
          ))}
        </div>
      </div>
      <div className="project-card__footer">
        <Link href={`/projects/${project.slug}`} className="project-card__link">
          View Details →
        </Link>
      </div>
    </Card>
  );
};
