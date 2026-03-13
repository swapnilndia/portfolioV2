import rawWorkLog from "@/worklog/swapnil-master-worklog.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkLogEntry {
  date: string;
  month: string;
  day: string;
  client: string;
  description: string;
  technologies: string[];
  taskType: string;
}

type RawMonthData = Record<
  string,
  {
    day: string;
    client: string;
    description: string;
    technologies: string[];
    taskType: string;
  }
>;

// ─── Flatten JSON → WorkLogEntry[] ───────────────────────────────────────────

export const workLogEntries: WorkLogEntry[] = Object.entries(
  rawWorkLog as Record<string, RawMonthData>
).flatMap(([month, days]) =>
  Object.entries(days).map(([date, entry]) => ({
    date,
    month,
    day: entry.day,
    client: entry.client,
    description: entry.description,
    technologies: entry.technologies,
    taskType: entry.taskType,
  }))
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Returns the month key (e.g. "November-2025") matching a plain month name */
function resolveMonthKey(name: string): string | null {
  const lower = name.toLowerCase();
  const match = Object.keys(rawWorkLog as Record<string, unknown>).find((k) =>
    k.toLowerCase().startsWith(lower)
  );
  return match ?? null;
}

/** Tier 1 — one-liner summary per month, always injected */
function buildTier1Summary(): string {
  const lines: string[] = ["SWAPNIL'S WORK HISTORY (OVERVIEW):"];

  for (const [month, days] of Object.entries(rawWorkLog as Record<string, RawMonthData>)) {
    const entries = Object.entries(days).filter(([, e]) => e.taskType !== "Leave / Holiday");
    if (entries.length === 0) continue;

    const client = entries[0][1].client;
    const techs = [...new Set(entries.flatMap(([, e]) => e.technologies))].slice(0, 6);

    const taskTypes = entries.reduce<Record<string, number>>((acc, [, e]) => {
      acc[e.taskType] = (acc[e.taskType] ?? 0) + 1;
      return acc;
    }, {});
    const topTask = Object.entries(taskTypes).sort((a, b) => b[1] - a[1])[0]?.[0];

    lines.push(`${month} (${client}): ${topTask ?? "Development"} — ${techs.join(", ")}`);
  }

  return lines.join("\n");
}

/** Tier 2 — full daily detail for a specific month key */
function buildTier2Detail(monthKey: string): string {
  const days = (rawWorkLog as Record<string, RawMonthData>)[monthKey];
  if (!days) return "";

  const lines: string[] = [`\nDETAILED LOG — ${monthKey}:`];
  for (const [date, entry] of Object.entries(days)) {
    if (entry.taskType === "Leave / Holiday") continue;
    const techs = entry.technologies.length ? ` | ${entry.technologies.join(", ")}` : "";
    lines.push(`${date} (${entry.day}): ${entry.description}${techs}`);
  }
  return lines.join("\n");
}

/** Tier 2 — last N working days across all months */
function buildRecentDetail(days = 30): string {
  const working = workLogEntries
    .filter((e) => e.taskType !== "Leave / Holiday")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days);

  if (working.length === 0) return "";

  const lines = ["\nRECENT ACTIVITY (latest working days):"];
  for (const e of working) {
    const techs = e.technologies.length ? ` | ${e.technologies.join(", ")}` : "";
    lines.push(`${e.date} (${e.day}) [${e.client}]: ${e.description}${techs}`);
  }
  return lines.join("\n");
}

/** Tier 2 — entries filtered by technology name */
function buildTechDetail(tech: string): string {
  const lower = tech.toLowerCase();
  const matches = workLogEntries.filter((e) =>
    e.technologies.some((t) => t.toLowerCase().includes(lower))
  );
  if (matches.length === 0) return "";

  const lines = [`\nENTRIES WHERE "${tech}" WAS USED:`];
  for (const e of matches.slice(0, 25)) {
    lines.push(`${e.date} [${e.month}]: ${e.description}`);
  }
  return lines.join("\n");
}

// ─── Intent ──────────────────────────────────────────────────────────────────

export type WorkLogIntent =
  | { type: "month"; monthKey: string }
  | { type: "recent" }
  | { type: "tech"; tech: string }
  | { type: "overview" }
  | { type: "none" };

/**
 * Given the user's cleaned question and detected intent from Agent 1,
 * returns the optimal context string to inject into Agent 3.
 */
export function buildWorkLogContext(cleanQuestion: string, timeContext: string | null): string {
  const tier1 = buildTier1Summary();

  // Try to resolve a specific month from timeContext
  if (timeContext) {
    const lower = timeContext.toLowerCase();

    // "last month" or "previous month" → second most recent month
    if (lower.includes("last month") || lower.includes("previous month")) {
      const months = Object.keys(rawWorkLog as Record<string, unknown>);
      const secondLast = months[months.length - 2];
      if (secondLast) {
        return tier1 + buildTier2Detail(secondLast);
      }
    }

    // "this month" or "current month" or "recently" → most recent month
    if (
      lower.includes("this month") ||
      lower.includes("current month") ||
      lower.includes("recent") ||
      lower.includes("now") ||
      lower.includes("currently") ||
      lower.includes("latest")
    ) {
      return tier1 + buildRecentDetail(20);
    }

    // Named month (e.g. "November", "november 2025")
    const namedMonth = MONTH_ORDER.find((m) => lower.includes(m.toLowerCase()));
    if (namedMonth) {
      const monthKey = resolveMonthKey(namedMonth);
      if (monthKey) {
        return tier1 + buildTier2Detail(monthKey);
      }
    }
  }

  // Tech-based question in the question itself
  const techKeywords = [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "CSS",
    "SCSS",
    "Strapi",
    "SEO",
    "Git",
    "API",
    "Redux",
    "ESLint",
    "Husky",
    "JIRA",
    "Postman",
    "Figma",
  ];
  const mentionedTech = techKeywords.find((t) =>
    cleanQuestion.toLowerCase().includes(t.toLowerCase())
  );
  if (mentionedTech) {
    return tier1 + buildTechDetail(mentionedTech);
  }

  // Default → tier 1 + recent 20 working days
  return tier1 + buildRecentDetail(20);
}
