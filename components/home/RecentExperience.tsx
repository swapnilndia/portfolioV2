"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { experiences } from "@/data/experience";
import "./RecentExperience.scss";

export const RecentExperience = () => {
  const { t } = useTranslation("home");
  const recentRoles = experiences.filter((exp) => exp.category === "software").slice(0, 2);

  return (
    <section className="recent-experience">
      <div className="recent-experience__container">
        <div className="recent-experience__header">
          <h2 className="recent-experience__title">{t("sections.recentExperience")}</h2>
          <Link href="/experience" className="recent-experience__link">
            View Full Experience →
          </Link>
        </div>
        <div className="recent-experience__list">
          {recentRoles.map((exp) => (
            <Card key={exp.id} className="recent-experience__card">
              <h3 className="recent-experience__company">{exp.company}</h3>
              <p className="recent-experience__title">{exp.title}</p>
              <p className="recent-experience__timeframe">{exp.timeframe}</p>
              <p className="recent-experience__location">{exp.location}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
