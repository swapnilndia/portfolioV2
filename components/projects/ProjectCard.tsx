import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { Project } from "@/data/projects";
import "./ProjectCard.scss";

interface ProjectCardProps {
  project: Project;
  layout?: "vertical" | "horizontal";
}

export const ProjectCard = ({ project, layout = "vertical" }: ProjectCardProps) => {
  const layoutClass = layout === "horizontal" ? "project-card--horizontal" : "";
  const showFooter = layout !== "horizontal";

  return (
    <Card as="article" className={`project-card ${layoutClass}`.trim()}>
      <div className="project-card__header">
        <h3 className="project-card__title">
          <Link href={`/projects/${project.slug}`} className="project-card__title-link">
            <span className="project-card__title-text">{project.title}</span>
            <span className="project-card__title-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </h3>
        {project.company && <p className="project-card__company">{project.company}</p>}
        <p className="project-card__timeframe">{project.timeframe}</p>
        <div
          className="project-card__divider project-card__divider--timeframe"
          aria-hidden="true"
        />
      </div>
      <div className="project-card__body">
        {project.resumeBullets && project.resumeBullets.length > 0 ? (
          <>
            <ul className="project-card__bullets">
              {project.resumeBullets.map((line, i) => (
                <li key={i} className="project-card__bullet">
                  {line}
                </li>
              ))}
            </ul>
            <div
              className="project-card__divider project-card__divider--bullets"
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <p className="project-card__summary">{project.summary}</p>
            <div
              className="project-card__divider project-card__divider--bullets"
              aria-hidden="true"
            />
          </>
        )}
        <div className="project-card__tech">
          {project.techStack.map((tech) => (
            <Tag key={tech} variant="primary" size="sm" showIcon techName={tech}>
              {tech}
            </Tag>
          ))}
        </div>
      </div>
      {showFooter && (
        <div className="project-card__footer">
          <Link href={`/projects/${project.slug}`} className="project-card__link">
            View Details →
          </Link>
        </div>
      )}
    </Card>
  );
};
