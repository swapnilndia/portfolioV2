"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/data/projects";

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const { t } = useTranslation("projects");

  return (
    <Section title={project.title} subtitle={project.summary}>
      <div className="project-detail">
        <div className="project-detail__header">
          <Link href="/projects" className="project-detail__back">
            ← Back to Projects
          </Link>
        </div>

        <Card className="project-detail__card">
          <div className="project-detail__meta">
            {project.role && (
              <div className="project-detail__meta-item">
                <span className="project-detail__meta-label">{t("detail.role")}:</span>
                <span className="project-detail__meta-value">{project.role}</span>
              </div>
            )}
            {project.company && (
              <div className="project-detail__meta-item">
                <span className="project-detail__meta-label">{t("detail.company")}:</span>
                <span className="project-detail__meta-value">{project.company}</span>
              </div>
            )}
            <div className="project-detail__meta-item">
              <span className="project-detail__meta-label">{t("detail.timeframe")}:</span>
              <span className="project-detail__meta-value">{project.timeframe}</span>
            </div>
          </div>

          <div className="project-detail__tech">
            <h3 className="project-detail__tech-title">{t("detail.techStack")}</h3>
            <div className="project-detail__tech-tags">
              {project.techStack.map((tech) => (
                <Tag key={tech} variant="primary" size="md" showIcon techName={tech}>
                  {tech}
                </Tag>
              ))}
            </div>
          </div>

          <div className="project-detail__content">
            <div className="project-detail__section">
              <h3 className="project-detail__section-title">{t("detail.problem")}</h3>
              <p className="project-detail__section-text">{project.problem}</p>
            </div>

            <div className="project-detail__section">
              <h3 className="project-detail__section-title">{t("detail.solution")}</h3>
              <p className="project-detail__section-text">{project.solution}</p>
            </div>

            <div className="project-detail__section">
              <h3 className="project-detail__section-title">{t("detail.impact")}</h3>
              <p className="project-detail__section-text">{project.impact}</p>
            </div>
          </div>

          {project.links && project.links.length > 0 && (
            <div className="project-detail__links">
              {project.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.type === "live" ? "primary" : "secondary"}
                  as="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.type === "live" ? "Visit Site" : "View Code"}
                </Button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}
