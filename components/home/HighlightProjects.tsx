"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";
import "./HighlightProjects.scss";

/** Home shows the 4 most recent featured projects; keep `projects` ordered newest → oldest for featured entries. */
const FEATURED_HOME_LIMIT = 4;

export const HighlightProjects = () => {
  const { t } = useTranslation("home");
  const featuredProjects = projects
    .filter((p) => p.featured)
    .slice(0, FEATURED_HOME_LIMIT)
    .map((p) => {
      if (!p.resumeBullets || p.resumeBullets.length <= 1) return p;
      // Home section: reduce bullet count by one for tighter visual rhythm.
      return { ...p, resumeBullets: p.resumeBullets.slice(0, p.resumeBullets.length - 1) };
    });

  return (
    <section className="highlight-projects">
      <div className="highlight-projects__container">
        <div className="highlight-projects__header">
          <h2 className="highlight-projects__title">{t("sections.highlightProjects")}</h2>
          <Link href="/projects" className="highlight-projects__link">
            {t("links.viewAllProjects")}
          </Link>
        </div>
        <div className="highlight-projects__grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} layout="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
};
