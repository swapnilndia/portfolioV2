"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { skills } from "@/data/skills";
import "./TechStrip.scss";

const MOBILE_MQ = "(max-width: 767px)";

function chunkIntoRows<T>(items: T[], rowCount: number): T[][] {
  const rows: T[][] = Array.from({ length: rowCount }, () => []);
  items.forEach((item, i) => {
    rows[i % rowCount].push(item);
  });
  return rows.filter((r) => r.length > 0);
}

function TechMarqueeRow({ items, durationSec }: { items: string[]; durationSec: number }) {
  if (items.length === 0) return null;

  return (
    <div className="tech-strip__marquee">
      <div
        className="tech-strip__marquee-track"
        style={{ "--tech-marquee-duration": `${durationSec}s` } as CSSProperties}
      >
        <div className="tech-strip__marquee-group">
          {items.map((skill) => (
            <Tag key={`a-${skill}`} variant="default" size="md" showIcon techName={skill}>
              {skill}
            </Tag>
          ))}
        </div>
        <div className="tech-strip__marquee-group" aria-hidden="true">
          {items.map((skill) => (
            <Tag key={`b-${skill}`} variant="default" size="md" showIcon techName={skill}>
              {skill}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

export const TechStrip = () => {
  const { t } = useTranslation("home");
  const allSkills = useMemo(() => skills.flatMap((category) => category.skills), []);

  const [rowCount, setRowCount] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setRowCount(mq.matches ? 4 : 2);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const rowChunks = useMemo(() => chunkIntoRows(allSkills, rowCount), [allSkills, rowCount]);

  const durations = useMemo(() => {
    const base = rowCount === 4 ? [38, 44, 40, 46] : [42, 48];
    return rowChunks.map((_, i) => base[i % base.length]);
  }, [rowChunks, rowCount]);

  return (
    <section className="tech-strip" aria-labelledby="tech-strip-heading">
      <div className="tech-strip__container">
        <h2 id="tech-strip-heading" className="tech-strip__title">
          {t("sections.techStack")}
        </h2>
        <div className="tech-strip__rows">
          {rowChunks.map((chunk, i) => (
            <TechMarqueeRow key={`${rowCount}-${i}`} items={chunk} durationSec={durations[i]} />
          ))}
        </div>
      </div>
    </section>
  );
};
