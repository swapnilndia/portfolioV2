'use client'

import { useTranslation } from 'react-i18next'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { skills } from '@/data/skills'
import './About.scss'

export default function About() {
  const { t } = useTranslation('about')

  return (
    <>
      <Section title={t('title')} subtitle={t('subtitle')}>
        <div className="about-page">
          <div className="about-page__intro">
            <p className="about-page__paragraph">{t('intro.paragraph1')}</p>
            <p className="about-page__paragraph">{t('intro.paragraph2')}</p>
            <p className="about-page__paragraph">{t('intro.paragraph3')}</p>
          </div>

          <div className="about-page__career-switch">
            <Card className="about-page__career-card">
              <h3>{t('sections.careerSwitch.title')}</h3>
              <p>{t('sections.careerSwitch.content')}</p>
            </Card>
          </div>

          <div className="about-page__skills">
            <h2 className="about-page__skills-title">{t('sections.skills')}</h2>
            <div className="about-page__skills-grid">
              {skills.map((category) => (
                <Card key={category.category} className="about-page__skill-category">
                  <h3 className="about-page__skill-category-title">
                    {category.category}
                  </h3>
                  <div className="about-page__skill-tags">
                    {category.skills.map((skill) => (
                      <Tag key={skill} variant="default" size="md" showIcon techName={skill}>
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}



