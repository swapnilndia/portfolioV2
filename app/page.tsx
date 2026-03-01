import { Hero } from '@/components/home/Hero'
import { HighlightProjects } from '@/components/home/HighlightProjects'
import { RecentExperience } from '@/components/home/RecentExperience'
import { TechStrip } from '@/components/home/TechStrip'
import { CodingStats } from '@/components/home/CodingStats'

export default function Home() {
  return (
    <>
      <Hero />
      <HighlightProjects />
      <RecentExperience />
      <TechStrip />
      <CodingStats />
    </>
  )
}
