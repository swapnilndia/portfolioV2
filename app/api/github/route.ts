import { NextResponse } from 'next/server'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface GitHubContributionsResponse {
  total: Record<string, number>
  contributions: ContributionDay[]
}

interface GitHubProfileResponse {
  public_repos: number
  followers: number
  following: number
}

interface GitHubRepo {
  stargazers_count: number
  fork: boolean
  name: string
  description: string | null
  language: string | null
  html_url: string
}

function toRepoCard(repo: GitHubRepo) {
  return {
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    url: repo.html_url,
  }
}

function calculateCurrentStreak(contributions: ContributionDay[]): number {
  const map = new Map<string, number>()
  for (const c of contributions) {
    map.set(c.date, c.count)
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cursor = new Date(today)

  // If today has no contributions yet, start counting from yesterday
  if (!map.get(fmt(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (streak <= 365) {
    if ((map.get(fmt(cursor)) ?? 0) > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export async function GET() {
  try {
    const username = 'swapnilndia'
    const ghHeaders = { Accept: 'application/vnd.github.v3+json' }

    const [contributionsRes, profileRes, reposRes, pinnedRepoRes] = await Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${username}`, {
        headers: ghHeaders,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=pushed&direction=desc`, {
        headers: ghHeaders,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/repos/${username}/portfolioV2`, {
        headers: ghHeaders,
        next: { revalidate: 3600 },
      }),
    ])

    if (!contributionsRes.ok || !profileRes.ok) {
      throw new Error('Failed to fetch GitHub data')
    }

    const contributionsData: GitHubContributionsResponse = await contributionsRes.json()
    const profileData: GitHubProfileResponse = await profileRes.json()
    const reposData: GitHubRepo[] = reposRes.ok ? await reposRes.json() : []
    const pinnedRepo: GitHubRepo | null = pinnedRepoRes.ok ? await pinnedRepoRes.json() : null

    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0)

    const nonForkRepos = reposData.filter((r) => !r.fork)
    const latestRepo = nonForkRepos[0]
    const preferredSecondRepo = pinnedRepo && !pinnedRepo.fork
      ? pinnedRepo
      : nonForkRepos.find((r) => r.name.toLowerCase() === 'portfoliov2')

    const selectedRepos: GitHubRepo[] = []
    if (latestRepo) {
      selectedRepos.push(latestRepo)
    }
    if (preferredSecondRepo && preferredSecondRepo.name !== latestRepo?.name) {
      selectedRepos.push(preferredSecondRepo)
    }
    if (selectedRepos.length < 2) {
      const fallbackRepo = nonForkRepos.find((repo) => !selectedRepos.some((selected) => selected.name === repo.name))
      if (fallbackRepo) {
        selectedRepos.push(fallbackRepo)
      }
    }

    const recentRepos = selectedRepos.slice(0, 2).map(toRepoCard)

    // `?y=last` returns total as { lastYear: N } — calculate this year's count from the array
    const currentYear = new Date().getFullYear().toString()
    const totalThisYear = contributionsData.contributions
      .filter((c) => c.date.startsWith(currentYear))
      .reduce((sum, c) => sum + c.count, 0)

    const currentStreak = calculateCurrentStreak(contributionsData.contributions)

    return NextResponse.json({
      contributions: contributionsData.contributions,
      totalThisYear,
      currentStreak,
      publicRepos: profileData.public_repos,
      totalStars,
      followers: profileData.followers,
      recentRepos,
    })
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
