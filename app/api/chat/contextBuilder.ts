import rawData from "@/worklog/swapnil-master-worklog.json";
import { portfolioContext } from "@/data/portfolioContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type DayEntry = {
  day: string;
  client: string;
  project?: string;
  description: string;
  technologies: string[];
  tools?: Record<string, string>;
  taskType: string;
};

type MonthData = { summary?: string } & Record<string, DayEntry>;

type ClientData = {
  duration?: string;
  about?: string;
  myRole?: string;
  defaultTechStack?: string[];
  defaultTools?: Record<string, string>;
  aiTools?: { ide?: string[]; browser?: string[] };
  keyAchievements?: string[];
};

type ProjectData = {
  client?: string;
  endClient?: string;
  about?: string;
  myContribution?: string;
  complexity?: string;
  importance?: string;
  technologiesUsed?: string[];
  toolsUsed?: string[];
  keyAchievements?: string[];
  subProjects?: Record<string, { description?: string; myContribution?: string; impact?: string }>;
};

type StatsData = {
  totalPersonalLeaves: number;
  primaryTechnologies: string[];
  secondaryTechnologies: string[];
  aiToolsUsed: string[];
  approximateComponentsBuilt: string;
  approximateBugsFixed: string;
  loanProductFlowsMigratedToCDD: number;
  totalProjects: number;
  totalClients: number;
  totalMonthsCovered: number;
  cddProjectStatus: string;
  projectNames: string[];
};

type PersonalLeave = {
  date: string;
  day: string;
  reason: string;
};

// ─── Raw data slices ──────────────────────────────────────────────────────────

const workLog = rawData.workLog as unknown as Record<string, MonthData>;
const glossary = rawData.glossary as Record<string, string>;
const clients = rawData.clients as unknown as Record<string, ClientData>;
const projects = rawData.projects as unknown as Record<string, ProjectData>;
const personalLeaves = rawData.personalLeaves as PersonalLeave[];
const stats = rawData.stats as unknown as StatsData;

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

function resolveMonthKey(name: string): string | null {
  const lower = name.toLowerCase();
  return Object.keys(workLog).find((k) => k.toLowerCase().startsWith(lower)) ?? null;
}

function getWorkingDays(monthKey: string): Array<[string, DayEntry]> {
  const month = workLog[monthKey];
  if (!month) return [];
  return Object.entries(month)
    .filter(([key, val]) => key !== "summary" && typeof val === "object" && val !== null)
    .map(([date, entry]): [string, DayEntry] => [date, entry as DayEntry])
    .filter(([, entry]) => entry.taskType !== "Leave / Holiday");
}

function getAllWorkingDays(): Array<[string, DayEntry]> {
  return Object.keys(workLog).flatMap((monthKey) => getWorkingDays(monthKey));
}

function formatDay(date: string, entry: DayEntry): string {
  const techs = entry.technologies?.length ? ` | Tech: ${entry.technologies.join(", ")}` : "";
  const project = entry.project ? ` [${entry.project}]` : "";
  return `${date} (${entry.day}) — ${entry.client}${project}: ${entry.description}${techs}`;
}

function resolveClientForDate(date: string): string | null {
  const allDays = getAllWorkingDays().sort((a, b) => a[0].localeCompare(b[0]));
  let previousClient: string | null = null;
  let nextClient: string | null = null;

  for (const [entryDate, entry] of allDays) {
    if (entryDate <= date) {
      previousClient = entry.client;
    }
    if (entryDate >= date) {
      nextClient = entry.client;
      break;
    }
  }

  if (previousClient && nextClient && previousClient === nextClient) {
    return previousClient;
  }

  return previousClient ?? nextClient;
}

function buildLeaveContext(): string {
  const lines = ["PERSONAL LEAVES:"];
  const leaveCountByClient = new Map<string, number>();

  lines.push(`\nTotal personal leaves recorded: ${stats.totalPersonalLeaves}`);

  for (const leave of personalLeaves) {
    const client = resolveClientForDate(leave.date) ?? "Unknown";
    const increment = leave.reason.toLowerCase().includes("half day") ? 0.5 : 1;
    leaveCountByClient.set(client, (leaveCountByClient.get(client) ?? 0) + increment);
    lines.push(`${leave.date} (${leave.day}) — ${leave.reason} | Active client: ${client}`);
  }

  lines.push("\nLEAVES BY CLIENT:");
  for (const [client, count] of leaveCountByClient.entries()) {
    lines.push(`${client}: ${count}`);
  }

  return lines.join("\n");
}

// ─── Worklog context ──────────────────────────────────────────────────────────

function buildMonthDetail(monthKey: string): string {
  const month = workLog[monthKey];
  const lines: string[] = [`MONTH: ${monthKey}`];
  if (month?.summary) lines.push(`Summary: ${month.summary}`);
  lines.push("Daily log:");
  for (const [date, entry] of getWorkingDays(monthKey)) {
    lines.push(formatDay(date, entry));
  }
  return lines.join("\n");
}

function buildRecentDays(n = 20): string {
  const recent = getAllWorkingDays()
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, n);
  const lines = ["RECENT ACTIVITY (latest working days):"];
  for (const [date, entry] of recent) {
    lines.push(formatDay(date, entry));
  }
  return lines.join("\n");
}

function buildWorklogContext(timeContext: string | null): string {
  const months = Object.keys(workLog);

  if (timeContext) {
    const lower = timeContext.toLowerCase();

    if (lower.includes("last month") || lower.includes("previous month")) {
      const key = months[months.length - 2];
      if (key) return buildMonthDetail(key);
    }

    if (
      lower.includes("this month") ||
      lower.includes("current") ||
      lower.includes("recent") ||
      lower.includes("latest") ||
      lower.includes("now")
    ) {
      return buildRecentDays(20);
    }

    const namedMonth = MONTH_ORDER.find((m) => lower.includes(m.toLowerCase()));
    if (namedMonth) {
      const key = resolveMonthKey(namedMonth);
      if (key) return buildMonthDetail(key);
    }
  }

  return buildRecentDays(20);
}

// ─── Project context ──────────────────────────────────────────────────────────

function buildProjectContext(question: string): string {
  const q = question.toLowerCase();
  const lines: string[] = ["SWAPNIL'S PROJECTS:"];

  for (const [name, proj] of Object.entries(projects)) {
    lines.push(
      `\n${name} (Client: ${proj.client ?? "—"}${proj.endClient ? `, End Client: ${proj.endClient}` : ""})`
    );
    if (proj.complexity)
      lines.push(`Complexity: ${proj.complexity} | Importance: ${proj.importance ?? "—"}`);
    lines.push(`About: ${proj.about ?? "—"}`);
    lines.push(`Contribution: ${proj.myContribution ?? "—"}`);
    if (proj.technologiesUsed?.length) lines.push(`Tech: ${proj.technologiesUsed.join(", ")}`);
    if (proj.toolsUsed?.length) lines.push(`Tools: ${proj.toolsUsed.join(", ")}`);
    if (proj.keyAchievements?.length)
      lines.push(`Achievements: ${proj.keyAchievements.join(" | ")}`);
    if (proj.subProjects) {
      for (const [subName, sub] of Object.entries(proj.subProjects)) {
        const detail = sub.myContribution ?? sub.impact ?? "";
        lines.push(
          `  Sub-project "${subName}": ${sub.description ?? ""}${detail ? ` — ${detail}` : ""}`
        );
      }
    }
  }

  // Also attach relevant month summaries for this project
  const projectKeywords = ["bajaj", "easypay", "protean", "piramal", "fnb", "grocery", "cdd"];
  const mentionedProject = projectKeywords.find((k) => q.includes(k));
  if (mentionedProject) {
    const relevantSummaries: string[] = [];
    for (const [monthKey, month] of Object.entries(workLog)) {
      if (month.summary?.toLowerCase().includes(mentionedProject)) {
        relevantSummaries.push(`${monthKey}: ${month.summary}`);
      }
    }
    if (relevantSummaries.length) {
      lines.push("\nRelated month summaries:");
      lines.push(...relevantSummaries);
    }
  }

  return lines.join("\n");
}

// ─── Glossary context ─────────────────────────────────────────────────────────

function buildGlossaryContext(): string {
  const lines = ["GLOSSARY — TERMS AND ACRONYMS:"];
  for (const [term, def] of Object.entries(glossary)) {
    lines.push(`${term}: ${def}`);
  }
  return lines.join("\n");
}

// ─── Achievement context ──────────────────────────────────────────────────────

function buildAchievementContext(): string {
  const lines = ["SWAPNIL'S KEY ACHIEVEMENTS:"];

  for (const [clientName, client] of Object.entries(clients)) {
    lines.push(`\nClient: ${clientName}${client.duration ? ` (${client.duration})` : ""}`);
    if (client.myRole) lines.push(`Role: ${client.myRole}`);
    if (client.keyAchievements?.length) {
      for (const ach of client.keyAchievements) {
        lines.push(`- ${ach}`);
      }
    }
  }

  // Include project-level achievements and complexity for comparison questions
  lines.push("\nPROJECT COMPLEXITY & IMPORTANCE:");
  for (const [name, proj] of Object.entries(projects)) {
    lines.push(
      `${name}: complexity=${proj.complexity ?? "—"}, importance=${proj.importance ?? "—"}`
    );
    if (proj.keyAchievements?.length) {
      lines.push(`  Achievements: ${proj.keyAchievements.slice(0, 3).join(" | ")}`);
    }
  }

  lines.push("\nSTATS:");
  lines.push(`- ${stats.approximateComponentsBuilt} components built`);
  lines.push(`- ${stats.approximateBugsFixed} bugs fixed`);
  lines.push(`- ${stats.loanProductFlowsMigratedToCDD} loan product flows migrated to CDD`);
  lines.push(`- ${stats.totalProjects} total projects across ${stats.totalClients} clients`);
  lines.push(`- CDD status: ${stats.cddProjectStatus}`);

  // Include month summaries for evolution questions
  lines.push("\nWORK EVOLUTION — MONTH SUMMARIES:");
  for (const [monthKey, month] of Object.entries(workLog)) {
    if (month.summary) lines.push(`${monthKey}: ${month.summary}`);
  }

  return lines.join("\n");
}

// ─── Technology context ───────────────────────────────────────────────────────

function buildTechContext(question: string): string {
  const q = question.toLowerCase();
  const lines = ["SWAPNIL'S TECHNOLOGY USAGE:"];
  const techToProjects = new Map<string, Set<string>>();
  const addTechProjectLink = (tech: string, projectName: string) => {
    if (!techToProjects.has(tech)) techToProjects.set(tech, new Set());
    techToProjects.get(tech)?.add(projectName);
  };

  lines.push(`\nPrimary: ${stats.primaryTechnologies.join(", ")}`);
  lines.push(`Secondary: ${stats.secondaryTechnologies.join(", ")}`);
  lines.push(`AI Tools: ${stats.aiToolsUsed.join(", ")}`);

  lines.push("\nPROJECT TECHNOLOGY MAP:");
  for (const [projectName, project] of Object.entries(projects)) {
    if (project.technologiesUsed?.length) {
      lines.push(`${projectName}: ${project.technologiesUsed.join(", ")}`);
      for (const tech of project.technologiesUsed) {
        addTechProjectLink(tech, projectName);
      }
    }

    if (project.toolsUsed?.length) {
      lines.push(`${projectName} tools: ${project.toolsUsed.join(", ")}`);
      for (const tool of project.toolsUsed) {
        addTechProjectLink(tool, projectName);
      }
    }

    if (project.keyAchievements?.length) {
      lines.push(
        `${projectName} notable implementation details: ${project.keyAchievements.join(" | ")}`
      );
    }
  }

  for (const [clientName, client] of Object.entries(clients)) {
    const clientProjects = Object.entries(projects)
      .filter(([, project]) => project.client === clientName)
      .map(([projectName]) => projectName);

    if (client.defaultTechStack?.length) {
      lines.push(`\n${clientName} tech stack: ${client.defaultTechStack.join(", ")}`);
      for (const tech of client.defaultTechStack) {
        for (const projectName of clientProjects) {
          addTechProjectLink(tech, projectName);
        }
      }
    }
    if (client.defaultTools) {
      lines.push(`${clientName} tools: ${Object.values(client.defaultTools).join(", ")}`);
      for (const tool of Object.values(client.defaultTools)) {
        for (const projectName of clientProjects) {
          addTechProjectLink(tool, projectName);
        }
      }
    }
    if (client.aiTools) {
      const allAi = [...(client.aiTools.ide ?? []), ...(client.aiTools.browser ?? [])];
      if (allAi.length) {
        lines.push(`${clientName} AI tools: ${allAi.join(", ")}`);
        for (const aiTool of allAi) {
          for (const projectName of clientProjects) {
            addTechProjectLink(aiTool, projectName);
          }
        }
      }
    }
  }

  // Targeted worklog entries for a specifically mentioned technology
  const techKeywords = [
    "react",
    "next.js",
    "nextjs",
    "javascript",
    "css",
    "scss",
    "strapi",
    "typescript",
    "git",
    "api",
    "figma",
    "postman",
    "husky",
    "eslint",
  ];
  const mentionedTech = techKeywords.find((t) => q.includes(t));
  if (mentionedTech) {
    const techDays = getAllWorkingDays()
      .filter(([, e]) => e.technologies?.some((t) => t.toLowerCase().includes(mentionedTech)))
      .slice(0, 15);
    if (techDays.length) {
      lines.push(`\nEntries where "${mentionedTech}" was used:`);
      for (const [date, entry] of techDays) {
        lines.push(`${date} [${entry.client}]: ${entry.description}`);
      }
    }
  }

  lines.push("\nTECHNOLOGY TO PROJECTS:");
  for (const [tech, projectNames] of [...techToProjects.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    if (projectNames.size > 0) {
      lines.push(`${tech}: ${[...projectNames].join(", ")}`);
    }
  }

  return lines.join("\n");
}

// ─── General context ──────────────────────────────────────────────────────────

function buildGeneralContext(): string {
  const lines = ["SWAPNIL'S WORK OVERVIEW:"];
  lines.push(`\nTotal months covered: ${stats.totalMonthsCovered}`);
  lines.push(`Total clients: ${stats.totalClients}`);
  lines.push(`Total projects: ${stats.totalProjects} — ${stats.projectNames.join(", ")}`);
  lines.push(`Total personal leaves recorded: ${stats.totalPersonalLeaves}`);
  lines.push(`\nMonth-by-month summaries:`);
  for (const [monthKey, month] of Object.entries(workLog)) {
    if (month.summary) lines.push(`${monthKey}: ${month.summary}`);
  }
  lines.push(`\n${buildLeaveContext()}`);
  return lines.join("\n");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type TopicContext =
  | "worklog"
  | "project"
  | "glossary"
  | "achievement"
  | "technology"
  | "general"
  | null;

/**
 * Returns the right data slice as a readable string for Agent 2 to query.
 * For "personal" intent, the caller passes portfolioContext directly.
 */
export function buildDataContext(
  topicContext: TopicContext,
  timeContext: string | null,
  cleanQuestion: string
): string {
  switch (topicContext) {
    case "worklog":
      return buildWorklogContext(timeContext);
    case "project":
      return buildProjectContext(cleanQuestion);
    case "glossary":
      return buildGlossaryContext();
    case "achievement":
      return buildAchievementContext();
    case "technology":
      return buildTechContext(cleanQuestion);
    case "general":
    default:
      return buildGeneralContext() + "\n\n" + buildRecentDays(10);
  }
}

export { portfolioContext };
