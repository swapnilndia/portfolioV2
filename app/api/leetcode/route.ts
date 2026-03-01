import { NextResponse } from 'next/server'

export const revalidate = 3600

const LEETCODE_QUERY = `
  query userStats($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submissionCalendar
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
      }
    }
  }
`

interface DifficultyCount {
  difficulty: string
  count: number
}

interface AcSubmission {
  difficulty: string
  count: number
  submissions: number
}

interface LeetCodeGraphQLResponse {
  data: {
    allQuestionsCount: DifficultyCount[]
    matchedUser: {
      submissionCalendar: string
      submitStats: {
        acSubmissionNum: AcSubmission[]
      }
      profile: {
        ranking: number
      }
    } | null
  }
}

interface SubmissionDay {
  date: string
  count: number
  level: number
}

function findByDifficulty<T extends { difficulty: string }>(arr: T[], difficulty: string): T | undefined {
  return arr.find((x) => x.difficulty === difficulty)
}

function parseSubmissionCalendar(calendarStr: string): SubmissionDay[] {
  try {
    const calendar: Record<string, number> = JSON.parse(calendarStr || '{}')
    return Object.entries(calendar)
      .map(([ts, count]) => {
        const d = new Date(parseInt(ts) * 1000)
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4
        return { date: `${y}-${m}-${day}`, count, level }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (compatible; portfolio-stats-bot/1.0)',
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username: 'Swapnilndia' },
      }),
    })

    if (!res.ok) {
      throw new Error(`LeetCode GraphQL responded with ${res.status}`)
    }

    const json: LeetCodeGraphQLResponse = await res.json()

    if (!json.data?.matchedUser) {
      throw new Error('LeetCode user not found or profile is private')
    }

    const allQuestions = json.data.allQuestionsCount
    const acSubmissions = json.data.matchedUser.submitStats.acSubmissionNum
    const ranking = json.data.matchedUser.profile.ranking
    const submissions = parseSubmissionCalendar(json.data.matchedUser.submissionCalendar)

    const allSolved = findByDifficulty(acSubmissions, 'All')
    const easySolved = findByDifficulty(acSubmissions, 'Easy')
    const mediumSolved = findByDifficulty(acSubmissions, 'Medium')
    const hardSolved = findByDifficulty(acSubmissions, 'Hard')

    const totalQ = findByDifficulty(allQuestions, 'All')
    const easyQ = findByDifficulty(allQuestions, 'Easy')
    const mediumQ = findByDifficulty(allQuestions, 'Medium')
    const hardQ = findByDifficulty(allQuestions, 'Hard')

    const acceptanceRate =
      allSolved && allSolved.submissions > 0
        ? Math.round((allSolved.count / allSolved.submissions) * 1000) / 10
        : 0

    return NextResponse.json({
      totalSolved: allSolved?.count ?? 0,
      totalQuestions: totalQ?.count ?? 0,
      easySolved: easySolved?.count ?? 0,
      totalEasy: easyQ?.count ?? 0,
      mediumSolved: mediumSolved?.count ?? 0,
      totalMedium: mediumQ?.count ?? 0,
      hardSolved: hardSolved?.count ?? 0,
      totalHard: hardQ?.count ?? 0,
      acceptanceRate,
      ranking,
      submissions,
    })
  } catch (error) {
    console.error('LeetCode API error:', error)
    return NextResponse.json({ error: 'Failed to fetch LeetCode data' }, { status: 500 })
  }
}
