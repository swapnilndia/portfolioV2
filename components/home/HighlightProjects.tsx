"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";
import "./HighlightProjects.scss";

export const HighlightProjects = () => {
  const { t } = useTranslation("home");
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="highlight-projects">
      <div className="highlight-projects__container">
        <div className="highlight-projects__header">
          <h2 className="highlight-projects__title">{t("sections.highlightProjects")}</h2>
          <Link href="/projects" className="highlight-projects__link">
            View All Projects →
          </Link>
        </div>
        <div className="highlight-projects__grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};
