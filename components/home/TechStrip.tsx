'use client'

import { useTranslation } from 'react-i18next'
import { Tag } from '@/components/ui/Tag'
import { skills } from '@/data/skills'
import './TechStrip.scss'

export const TechStrip = () => {
  const { t } = useTranslation('home')
  const allSkills = skills.flatMap((category) => category.skills)

  return (
    <section className="tech-strip">
      <div className="tech-strip__container">
        <h2 className="tech-strip__title">{t('sections.techStack')}</h2>
        <div className="tech-strip__tags">
          {allSkills.map((skill) => (
            <Tag key={skill} variant="default" size="md" showIcon techName={skill}>
              {skill}
            </Tag>
          ))}
        </div>
      </div>
    </section>
  )
}

