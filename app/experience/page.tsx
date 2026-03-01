"use client";

import { useTranslation } from "react-i18next";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { experiences } from "@/data/experience";
import "./Experience.scss";

export default function ExperiencePage() {
  const { t } = useTranslation("experience");

  const softwareExperiences = experiences.filter((exp) => exp.category === "software");
  const civilExperiences = experiences.filter((exp) => exp.category === "civil");

  return (
    <Section title={t("title")} subtitle={t("subtitle")}>
      <div className="experience-page">
        {softwareExperiences.length > 0 && (
          <div className="experience-page__section">
            <h2 className="experience-page__section-title">{t("sections.softwareEngineering")}</h2>
            <div className="experience-page__list">
              {softwareExperiences.map((exp) => (
                <Card key={exp.id} className="experience-page__card">
                  <div className="experience-page__header">
                    <h3 className="experience-page__company">{exp.company}</h3>
                    <p className="experience-page__title">{exp.title}</p>
                    <p className="experience-page__location">{exp.location}</p>
                    <p className="experience-page__timeframe">{exp.timeframe}</p>
                  </div>
                  <ul className="experience-page__bullets">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} className="experience-page__bullet">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="experience-page__tech">
                    {exp.techStack.map((tech) => (
                      <Tag key={tech} variant="primary" size="sm" showIcon techName={tech}>
                        {tech}
                      </Tag>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {civilExperiences.length > 0 && (
          <div className="experience-page__section">
            <h2 className="experience-page__section-title">{t("sections.civilEngineering")}</h2>
            <div className="experience-page__list">
              {civilExperiences.map((exp) => (
                <Card key={exp.id} className="experience-page__card">
                  <div className="experience-page__header">
                    <h3 className="experience-page__company">{exp.company}</h3>
                    <p className="experience-page__title">{exp.title}</p>
                    <p className="experience-page__location">{exp.location}</p>
                    <p className="experience-page__timeframe">{exp.timeframe}</p>
                  </div>
                  <ul className="experience-page__bullets">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} className="experience-page__bullet">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
