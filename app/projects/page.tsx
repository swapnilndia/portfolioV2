"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Section } from "@/components/ui/Section";
import { projects } from "@/data/projects";
import "./Projects.scss";

export default function ProjectsPage() {
  const { t } = useTranslation("projects");
  const [filter, setFilter] = useState<"all" | "featured">("all");

  const filteredProjects = filter === "featured" ? projects.filter((p) => p.featured) : projects;

  return (
    <Section title={t("title")} subtitle={t("description")}>
      <div className="projects-page">
        <div className="projects-page__filters">
          <button
            className={`projects-page__filter ${
              filter === "all" ? "projects-page__filter--active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            {t("filters.all")}
          </button>
          <button
            className={`projects-page__filter ${
              filter === "featured" ? "projects-page__filter--active" : ""
            }`}
            onClick={() => setFilter("featured")}
          >
            {t("filters.featured")}
          </button>
        </div>

        <div className="projects-page__grid">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </Section>
  );
}
