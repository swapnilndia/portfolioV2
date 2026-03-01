'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import './CodingStats.scss'

interface GitHubData {
  totalThisYear: number
  currentStreak: number
}

interface LeetCodeData {
  totalSolved: number
}

export const CodingStats = () => {
  const [github, setGithub] = useState<GitHubData | null>(null)
  const [leetcode, setLeetcode] = useState<LeetCodeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/github').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/leetcode').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([gh, lc]) => {
      setGithub(gh)
      setLeetcode(lc)
      setLoading(false)
    })
  }, [])

  const statValue = (value: number | undefined) => {
    if (loading) return <span className="coding-stats__skeleton" aria-hidden="true" />
    if (value == null) return '—'
    return value.toLocaleString()
  }

  return (
    <section className="coding-stats">
      <div className="coding-stats__container">
        <div className="coding-stats__header">
          <h2 className="coding-stats__title">Coding Activity</h2>
          <Link href="/about#coding-activity" className="coding-stats__link">
            See full activity →
          </Link>
        </div>

        <div className="coding-stats__grid">
          {/* GitHub contributions */}
          <Card className="coding-stats__card">
            <div className="coding-stats__card-icon coding-stats__card-icon--github">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div className="coding-stats__stat">
              <span className="coding-stats__number">{statValue(github?.totalThisYear)}</span>
              <span className="coding-stats__label">contributions this year</span>
            </div>
          </Card>

          {/* LeetCode solved */}
          <Card className="coding-stats__card">
            <div className="coding-stats__card-icon coding-stats__card-icon--leetcode">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
              </svg>
            </div>
            <div className="coding-stats__stat">
              <span className="coding-stats__number">{statValue(leetcode?.totalSolved)}</span>
              <span className="coding-stats__label">problems solved</span>
            </div>
          </Card>

          {/* Current streak */}
          <Card className="coding-stats__card">
            <div className="coding-stats__card-icon coding-stats__card-icon--streak">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
              </svg>
            </div>
            <div className="coding-stats__stat">
              <span className="coding-stats__number">{statValue(github?.currentStreak)}</span>
              <span className="coding-stats__label">day streak</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
