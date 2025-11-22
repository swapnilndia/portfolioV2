'use client'

import { Hero } from '@/components/home/Hero'
import { HighlightProjects } from '@/components/home/HighlightProjects'
import { RecentExperience } from '@/components/home/RecentExperience'
import { TechStrip } from '@/components/home/TechStrip'

export default function Home() {
  return (
    <>
      <Hero />
      <HighlightProjects />
      <RecentExperience />
      <TechStrip />
    </>
  )
}
