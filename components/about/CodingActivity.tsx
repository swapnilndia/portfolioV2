"use client";

import { useState, useEffect, useRef } from "react";
import "./CodingActivity.scss";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface RecentRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
}

interface YearlyPoint {
  year: number;
  count: number;
}

interface GitHubData {
  contributions: ContributionDay[];
  totalThisYear: number;
  currentStreak: number;
  publicRepos: number;
  totalStars: number;
  followers: number;
  recentRepos: RecentRepo[];
  yearlyContributions: YearlyPoint[];
}

interface LeetCodeData {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking: number;
  submissions: ContributionDay[];
  yearlySubmissions: YearlyPoint[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL_SIZE = 12;
const CELL_GAP = 3;
const DAY_LABEL_WIDTH = 28;

const DONUT_RADIUS = 50;
const DONUT_CX = 60;
const DONUT_CY = 60;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
// Arc-length gap between the three segments (in SVG user units)
const SEGMENT_GAP = 5;

function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function buildWeeks(contributions: ContributionDay[]): (ContributionDay | null)[][] {
  if (!contributions.length) return [];
  const weeks: (ContributionDay | null)[][] = [];
  const firstDayOfWeek = parseDateLocal(contributions[0].date).getDay();
  let week: (ContributionDay | null)[] = Array(firstDayOfWeek).fill(null);

  for (const day of contributions) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function buildLeetCodeDays(submissions: ContributionDay[]): ContributionDay[] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const map = new Map(submissions.map((s) => [s.date, s]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  const days: ContributionDay[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = fmt(cursor);
    days.push(map.get(dateStr) ?? { date: dateStr, count: 0, level: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function getMonthLabels(
  weeks: (ContributionDay | null)[][]
): { label: string; colIndex: number }[] {
  const candidates: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;

  for (let wi = 0; wi < weeks.length; wi++) {
    const firstDay = weeks[wi].find((d) => d !== null);
    if (firstDay) {
      const month = parseDateLocal(firstDay.date).getMonth();
      if (month !== lastMonth) {
        candidates.push({ label: MONTH_NAMES[month], colIndex: wi });
        lastMonth = month;
      }
    }
  }

  // Avoid label overlap when two month transitions are only a few columns apart.
  // If they are too close, keep the newer month label.
  const MIN_LABEL_GAP_COLS = 3;
  const labels: { label: string; colIndex: number }[] = [];
  for (const candidate of candidates) {
    const prev = labels[labels.length - 1];
    if (!prev) {
      labels.push(candidate);
      continue;
    }

    if (candidate.colIndex - prev.colIndex < MIN_LABEL_GAP_COLS) {
      labels[labels.length - 1] = candidate;
    } else {
      labels.push(candidate);
    }
  }

  return labels;
}

const SKELETON_WEEKS: null[][] = Array.from({ length: 53 }, () => Array(7).fill(null));

// ── Annual line graph ─────────────────────────────────────────────────────────

function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  const commands: string[] = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    commands.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x} ${p2.y}`
    );
  }
  return commands.join(" ");
}

function AnnualLineGraph({
  data,
  variant,
  label,
}: {
  data: YearlyPoint[];
  variant: "github" | "leetcode";
  label: string;
}) {
  const [tooltip, setTooltip] = useState<{ year: number; count: number } | null>(null);

  const VW = 500;
  const VH = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 52 };
  const plotW = VW - PAD.left - PAD.right;
  const plotH = VH - PAD.top - PAD.bottom;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const yMax = Math.ceil((maxCount * 1.15) / 50) * 50;
  const Y_TICKS = 4;

  const toX = (i: number) =>
    PAD.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const toY = (count: number) => PAD.top + plotH - (count / yMax) * plotH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.count), ...d }));
  const linePath = catmullRomPath(pts);
  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => Math.round((yMax / Y_TICKS) * i));

  return (
    <div className="coding-activity__annual-wrap">
      <div className="coding-activity__annual-header">
        <span className="coding-activity__annual-label">{label}</span>
        {tooltip && (
          <span className="coding-activity__annual-tooltip">
            {tooltip.year}: <strong>{tooltip.count.toLocaleString()}</strong>
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className={`coding-activity__annual-svg coding-activity__annual-svg--${variant}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={label}
      >
        {/* Grid lines + Y labels */}
        {yTicks.map((tick) => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={VW - PAD.right}
                y2={y}
                className="coding-activity__annual-gridline"
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="coding-activity__annual-tick"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
              </text>
            </g>
          );
        })}

        {/* Smooth line */}
        <path
          d={linePath}
          className={`coding-activity__annual-line coding-activity__annual-line--${variant}`}
        />

        {/* X-axis labels */}
        {pts.map((pt) => (
          <text
            key={pt.year}
            x={pt.x}
            y={VH - PAD.bottom + 20}
            textAnchor="middle"
            className="coding-activity__annual-tick"
          >
            {pt.year}
          </text>
        ))}

        {/* Data dots */}
        {pts.map((pt) => (
          <circle
            key={pt.year}
            cx={pt.x}
            cy={pt.y}
            r={5}
            className={`coding-activity__annual-dot coding-activity__annual-dot--${variant}`}
            onMouseEnter={() => setTooltip({ year: pt.year, count: pt.count })}
            onMouseLeave={() => setTooltip(null)}
          >
            <title>
              {pt.year}: {pt.count.toLocaleString()}
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function Heatmap({
  weeks,
  variant = "github",
}: {
  weeks: (ContributionDay | null)[][] | null[][];
  variant?: "github" | "leetcode";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visibleWeekCount, setVisibleWeekCount] = useState(weeks.length || 53);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - DAY_LABEL_WIDTH - CELL_GAP;
      const count = Math.max(
        12,
        Math.min(Math.floor(available / (CELL_SIZE + CELL_GAP)), weeks.length || 53)
      );
      setVisibleWeekCount(count);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks.length]);

  const visibleWeeks = weeks.length > visibleWeekCount ? weeks.slice(-visibleWeekCount) : weeks;
  const monthLabels = getMonthLabels(visibleWeeks as (ContributionDay | null)[][]);
  const weekCount = visibleWeeks.length;

  return (
    <div className="coding-activity__heatmap-wrap" ref={wrapRef}>
      <div className="coding-activity__heatmap-inner">
        <div
          className="coding-activity__month-row"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE}px)`,
            gap: `${CELL_GAP}px`,
          }}
        >
          {monthLabels.map(({ label, colIndex }) => (
            <span
              key={label + colIndex}
              className="coding-activity__month-label"
              style={{ gridColumn: colIndex + 1 }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="coding-activity__heatmap-body">
          <div className="coding-activity__day-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="coding-activity__day-label">
                {label}
              </span>
            ))}
          </div>
          <div
            className={`coding-activity__grid coding-activity__grid--${variant}`}
            style={{ gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`, gap: `${CELL_GAP}px` }}
          >
            {visibleWeeks.flatMap((week, wi) =>
              week.map((day, di) => (
                <span
                  key={`${wi}-${di}`}
                  className={`coding-activity__cell coding-activity__cell--level-${(day as ContributionDay)?.level ?? 0}`}
                  title={
                    day
                      ? `${(day as ContributionDay).date}: ${(day as ContributionDay).count} submission${(day as ContributionDay).count !== 1 ? "s" : ""}`
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Difficulty row data ───────────────────────────────────────────────────────
const DIFFICULTIES = [
  { key: "easy", label: "Easy", fullLabel: "Easy", solvedKey: "easySolved", totalKey: "totalEasy" },
  {
    key: "medium",
    label: "Med.",
    fullLabel: "Medium",
    solvedKey: "mediumSolved",
    totalKey: "totalMedium",
  },
  { key: "hard", label: "Hard", fullLabel: "Hard", solvedKey: "hardSolved", totalKey: "totalHard" },
] as const;

type Difficulty = "easy" | "medium" | "hard";

export const CodingActivity = () => {
  const [github, setGithub] = useState<GitHubData | null>(null);
  const [leetcode, setLeetcode] = useState<LeetCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDiff, setHoveredDiff] = useState<Difficulty | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/github")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch("/api/leetcode")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([gh, lc]) => {
      setGithub(gh);
      setLeetcode(lc);
      setLoading(false);
    });
  }, []);

  // ── Heatmap data ──────────────────────────────────────────────────────────
  const ghWeeks = github ? buildWeeks(github.contributions) : SKELETON_WEEKS;
  const lcDays = leetcode ? buildLeetCodeDays(leetcode.submissions) : [];
  const lcWeeks = lcDays.length ? buildWeeks(lcDays) : SKELETON_WEEKS;

  // ── Multi-segment donut ───────────────────────────────────────────────────
  // Each segment represents that difficulty's share of *total solved* (pie distribution).
  const C = DONUT_CIRCUMFERENCE;
  const totalSolved = leetcode?.totalSolved ?? 0;
  const easyFrac = totalSolved > 0 ? (leetcode?.easySolved ?? 0) / totalSolved : 0;
  const medFrac = totalSolved > 0 ? (leetcode?.mediumSolved ?? 0) / totalSolved : 0;
  const hardFrac = totalSolved > 0 ? (leetcode?.hardSolved ?? 0) / totalSolved : 0;

  // Arc lengths with gap subtracted so segments don't touch
  const easyArc = Math.max(0, easyFrac * C - SEGMENT_GAP);
  const medArc = Math.max(0, medFrac * C - SEGMENT_GAP);
  const hardArc = Math.max(0, hardFrac * C - SEGMENT_GAP);

  // Start angle of each segment (degrees, 0 = top, clockwise)
  const gapDeg = (SEGMENT_GAP / C) * 360;
  const easyStartDeg = -90;
  const medStartDeg = -90 + easyFrac * 360 + gapDeg;
  const hardStartDeg = -90 + (easyFrac + medFrac) * 360 + 2 * gapDeg;

  const hoveredMeta = hoveredDiff ? DIFFICULTIES.find((d) => d.key === hoveredDiff) : undefined;
  const hoveredSolved = hoveredMeta && leetcode ? leetcode[hoveredMeta.solvedKey] : undefined;
  const hoveredTotal = hoveredMeta && leetcode ? leetcode[hoveredMeta.totalKey] : undefined;
  const hoveredProgressPct =
    hoveredSolved != null && hoveredTotal
      ? Math.min(Math.round((hoveredSolved / hoveredTotal) * 100), 100)
      : 0;

  const donutNumberText = loading
    ? "—"
    : hoveredSolved != null
      ? hoveredSolved.toLocaleString()
      : (leetcode?.totalSolved?.toLocaleString() ?? "—");
  const donutSubText = hoveredMeta ? `${hoveredMeta.fullLabel} solved` : "solved";
  const donutFooterText =
    hoveredMeta && hoveredTotal != null
      ? `${hoveredProgressPct}% of ${hoveredTotal.toLocaleString()}`
      : `${leetcode?.acceptanceRate ?? 0}% acc.`;

  return (
    <section className="coding-activity" id="coding-activity">
      <div className="coding-activity__container">
        <h2 className="coding-activity__section-title">Coding Activity</h2>

        {/* ── GitHub ─────────────────────────────────────────── */}
        <div className="coding-activity__block">
          <div className="coding-activity__block-header">
            <div className="coding-activity__block-label">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub Activity</span>
            </div>
            <div className="coding-activity__badges">
              {!loading && github && (
                <>
                  <span className="coding-activity__badge">⭐ {github.totalStars} stars</span>
                  <span className="coding-activity__badge">👥 {github.followers} followers</span>
                  <span className="coding-activity__badge">{github.publicRepos} repos</span>
                </>
              )}
            </div>
          </div>

          <Heatmap weeks={ghWeeks} variant="github" />

          <div className="coding-activity__github-stats">
            {[
              { value: github?.totalThisYear, label: "contributions this year" },
              {
                value: github?.currentStreak != null ? `${github.currentStreak}d` : undefined,
                label: "current streak",
              },
              { value: github?.publicRepos, label: "public repos" },
              { value: github?.totalStars, label: "total stars" },
              { value: github?.followers, label: "followers" },
            ].map(({ value, label }) => (
              <div key={label} className="coding-activity__github-stat">
                <span className="coding-activity__github-stat-value">
                  {loading
                    ? "—"
                    : value != null
                      ? typeof value === "number"
                        ? value.toLocaleString()
                        : value
                      : "—"}
                </span>
                <span className="coding-activity__github-stat-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Recent repos */}
          {!loading && github?.recentRepos?.length ? (
            <div className="coding-activity__repos">
              <span className="coding-activity__repos-header">Recently Active</span>
              <div className="coding-activity__repos-grid">
                {github.recentRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="coding-activity__repo-card"
                  >
                    <span className="coding-activity__repo-name">{repo.name}</span>
                    {repo.description && (
                      <span className="coding-activity__repo-desc">{repo.description}</span>
                    )}
                    <span className="coding-activity__repo-meta">
                      {repo.language && (
                        <span className="coding-activity__badge">{repo.language}</span>
                      )}
                      {repo.stars > 0 && (
                        <span className="coding-activity__badge">⭐ {repo.stars}</span>
                      )}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── LeetCode ───────────────────────────────────────── */}
        <div className="coding-activity__block">
          <div className="coding-activity__block-header">
            <div className="coding-activity__block-label">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
              </svg>
              <span>LeetCode Stats</span>
            </div>
            <div className="coding-activity__badges">
              {!loading && leetcode && (
                <span className="coding-activity__badge">
                  Rank #{leetcode.ranking.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Multi-segment donut + difficulty cards */}
          <div className="coding-activity__leetcode-chart">
            {/* Donut */}
            <div className="coding-activity__donut-wrapper">
              <svg
                viewBox="0 0 120 120"
                className="coding-activity__donut-svg"
                aria-label="LeetCode problems solved by difficulty"
              >
                {/* Background track */}
                <circle
                  cx={DONUT_CX}
                  cy={DONUT_CY}
                  r={DONUT_RADIUS}
                  fill="none"
                  strokeWidth="10"
                  className="coding-activity__donut-track"
                />

                {/* Easy segment */}
                {easyArc > 0 && (
                  <circle
                    cx={DONUT_CX}
                    cy={DONUT_CY}
                    r={DONUT_RADIUS}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="var(--color-success)"
                    strokeDasharray={`${easyArc} ${C}`}
                    transform={`rotate(${easyStartDeg} ${DONUT_CX} ${DONUT_CY})`}
                    style={{
                      opacity: hoveredDiff && hoveredDiff !== "easy" ? 0.2 : 1,
                      transition: "opacity 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredDiff("easy")}
                    onMouseLeave={() => setHoveredDiff(null)}
                  />
                )}

                {/* Medium segment */}
                {medArc > 0 && (
                  <circle
                    cx={DONUT_CX}
                    cy={DONUT_CY}
                    r={DONUT_RADIUS}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="var(--color-warning)"
                    strokeDasharray={`${medArc} ${C}`}
                    transform={`rotate(${medStartDeg} ${DONUT_CX} ${DONUT_CY})`}
                    style={{
                      opacity: hoveredDiff && hoveredDiff !== "medium" ? 0.2 : 1,
                      transition: "opacity 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredDiff("medium")}
                    onMouseLeave={() => setHoveredDiff(null)}
                  />
                )}

                {/* Hard segment */}
                {hardArc > 0 && (
                  <circle
                    cx={DONUT_CX}
                    cy={DONUT_CY}
                    r={DONUT_RADIUS}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="var(--color-danger)"
                    strokeDasharray={`${hardArc} ${C}`}
                    transform={`rotate(${hardStartDeg} ${DONUT_CX} ${DONUT_CY})`}
                    style={{
                      opacity: hoveredDiff && hoveredDiff !== "hard" ? 0.2 : 1,
                      transition: "opacity 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredDiff("hard")}
                    onMouseLeave={() => setHoveredDiff(null)}
                  />
                )}

                {/* Center labels */}
                <text
                  x={DONUT_CX}
                  y="52"
                  textAnchor="middle"
                  className="coding-activity__donut-number"
                >
                  {donutNumberText}
                </text>
                <text
                  x={DONUT_CX}
                  y="67"
                  textAnchor="middle"
                  className="coding-activity__donut-sub"
                >
                  {donutSubText}
                </text>
                {!loading && leetcode && (
                  <text
                    x={DONUT_CX}
                    y="80"
                    textAnchor="middle"
                    className="coding-activity__donut-acc"
                  >
                    {donutFooterText}
                  </text>
                )}
              </svg>
            </div>

            {/* Difficulty cards */}
            <div className="coding-activity__diff-cards">
              {DIFFICULTIES.map(({ key, label, solvedKey, totalKey }) => {
                const solved = leetcode?.[solvedKey];
                const total = leetcode?.[totalKey];
                const pct = solved && total ? Math.min(Math.round((solved / total) * 100), 100) : 0;
                return (
                  <div
                    key={key}
                    className={`coding-activity__diff-card coding-activity__diff-card--${key}${hoveredDiff === key ? " is-hovered" : ""}`}
                    onMouseEnter={() => setHoveredDiff(key)}
                    onMouseLeave={() => setHoveredDiff(null)}
                  >
                    <span
                      className={`coding-activity__diff-label coding-activity__diff-label--${key}`}
                    >
                      {label}
                    </span>
                    <span className="coding-activity__diff-counts">
                      <strong>{loading ? "—" : (solved ?? "—")}</strong>
                      {" / "}
                      <span>{loading ? "—" : (total ?? "—")}</span>
                    </span>
                    <div className="coding-activity__diff-bar-track">
                      <div
                        className={`coding-activity__diff-bar-fill coding-activity__diff-bar-fill--${key}`}
                        style={{ width: loading ? "0%" : `${pct}%` }}
                      />
                    </div>
                    {!loading && leetcode && (
                      <span className="coding-activity__diff-pct">{pct}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LeetCode submission heatmap */}
          <div className="coding-activity__heatmap-label">Submission Calendar</div>
          <Heatmap weeks={lcWeeks} variant="leetcode" />
        </div>

        {/* ── Annual activity row ─────────────────────────────── */}
        {!loading &&
        (github?.yearlyContributions?.length || leetcode?.yearlySubmissions?.length) ? (
          <div className="coding-activity__annual-row">
            {github?.yearlyContributions?.length ? (
              <div className="coding-activity__annual-card">
                <AnnualLineGraph
                  data={github.yearlyContributions}
                  variant="github"
                  label="GitHub Contributions"
                />
              </div>
            ) : null}
            {leetcode?.yearlySubmissions?.length ? (
              <div className="coding-activity__annual-card">
                <AnnualLineGraph
                  data={leetcode.yearlySubmissions}
                  variant="leetcode"
                  label="LeetCode Attempts"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};
