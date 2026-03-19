export type Project = {
  slug: string;
  title: string;
  role: string;
  company?: string;
  timeframe: string;
  techStack: string[];
  summary: string;
  /** Short resume-style bullets for cards (e.g. featured on home); falls back to `summary` if omitted. */
  resumeBullets?: string[];
  problem: string;
  solution: string;
  impact: string;
  links?: { type: "live" | "github"; url: string }[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "piramal-sales-central",
    title: "Piramal Sales Central",
    role: "Frontend Developer",
    company: "Tekonika Technologies",
    timeframe: "September 2025 – Present",
    techStack: ["React", "Next.js", "TypeScript", "JavaScript", "CSS"],
    summary:
      "Internal Piramal Finance tool for loan sales officers—sanction tracking across mortgage and non-mortgage products. I architected Config Driven Deployment (CDD) to replace a hardcoded SFDC-style flow and scale new loan products faster.",
    resumeBullets: [
      "Led Config Driven Deployment (CDD) to eliminate conditional hell by unifying mortgage + non-mortgage journeys into one scalable architecture.",
      "Built a migration path for 8+ loan product flows (including HLSA, BLSA, and 6 non-mortgage products) after Technical Director sign-off.",
      "Hardened the rollout with unit tests, documentation, and journey diagrams; supported QA regression handoff (Mar 2026).",
      "Owned frontend delivery for the internal sales tool and handled Cloud Defence remediation + Next.js upgrades.",
    ],
    problem:
      "Mortgage and non-mortgage loan journeys lived in separate, branch-heavy code paths—conditional sprawl slowed delivery, duplicated UI logic, and made every product change risky.",
    solution:
      "Proposed Config Driven Deployment, built a POC, and presented it to the Technical Director. After sign-off, implemented CDD across the app: unified config-driven flows for mortgage (HLSA, BLSA) and six non-mortgage products, added unit tests for CDD changes, documentation and journey diagrams, and handled Cloud Defence fixes plus Next.js upgrades.",
    impact:
      "Migrated 8+ loan product flows to one maintainable architecture, cut duplication, and shortened bug-fix cycles by making behaviour data-driven instead of copy-paste UI. March 2026: CDD work handed to QA for regression.",
    featured: true,
  },
  {
    slug: "ecommerce-platform-frontend",
    title: "eCommerce Platform Frontend",
    role: "Software Developer",
    company: "Tekonika Technologies",
    timeframe: "May 2025 – Present",
    techStack: ["React", "Next.js", "JavaScript", "REST APIs", "SCSS"],
    summary:
      "Built and maintained the frontend for an eCommerce platform with a focus on responsive design, SEO optimization, and performance.",
    resumeBullets: [
      "Built EasyPay’s ONDC e-commerce frontend verticals (Food & Beverages, Grocery, Electronics) from Figma to production using React/Next.js.",
      "Integrated Strapi CMS for dynamic content and implemented skeleton/shimmer loading UX across verticals.",
      "Delivered full technical SEO (sitemap.xml, robots.txt, OG/meta tags) and presented the rollout to Bajaj Finserv engineering.",
      "Implemented dynamic search (debounced suggestions, filters, pagination) with location-aware listing APIs; resolved 100+ UI/functional bugs.",
    ],
    problem:
      "The existing eCommerce platform needed improved SEO rankings, faster page loads, and better code organization to support growing feature requirements.",
    solution:
      "Implemented code-splitting and bundle optimization strategies, improved semantic HTML structure for SEO, and refactored components using React and Redux for better state management. Used SCSS for maintainable styling.",
    impact:
      "Improved page load times by ~40%, enhanced SEO rankings, and established a scalable codebase structure that supports continuous feature development.",
    links: [
      { type: "live", url: "#" },
      { type: "github", url: "#" },
    ],
    featured: true,
  },
  {
    slug: "nextjs-egaming-platform",
    title: "Next.js eGaming Platform",
    role: "Software Developer",
    company: "WagerGeeks Private Limited",
    timeframe: "Feb 2025 – May 2025",
    techStack: ["React", "Next.js", "JavaScript", "REST APIs"],
    summary:
      "Built a Next.js eGaming platform frontend with gaming lobby UI, authentication flows, and dynamic pages.",
    resumeBullets: [
      "Developed the player-facing Next.js app with SSR-friendly routing, lobby/catalog UX, and secure authentication aligned to product requirements.",
      "Built reusable UI primitives for games and dynamic content so new titles and layouts shipped faster with less one-off code.",
      "Improved discoverability and navigation performance via Next.js rendering choices, structured routing, and pragmatic code splitting where it mattered.",
      "Integrated REST APIs for live catalogue and player state; kept UX resilient as data and lobby configurations changed.",
    ],
    problem:
      "Needed a modern, scalable frontend for an eGaming platform that could handle real-time updates, complex authentication flows, and dynamic content loading.",
    solution:
      "Developed the frontend using Next.js for SSR capabilities and optimized routing. Built reusable components for gaming lobby UI, implemented secure authentication flows, and created dynamic pages for game content.",
    impact:
      "Delivered a performant eGaming platform with improved user experience, faster navigation, and better SEO through Next.js SSR capabilities.",
    links: [{ type: "live", url: "#" }],
    featured: true,
  },
  {
    slug: "egaming-admin-portal",
    title: "eGaming Admin Portal",
    role: "Software Developer",
    company: "WagerGeeks Private Limited",
    timeframe: "Feb 2025 – May 2025",
    techStack: ["React", "REST APIs", "JavaScript", "CSS"],
    summary:
      "Built an Admin Portal with React and REST APIs for real-time data visualization, content management, and administrative operations.",
    resumeBullets: [
      "Delivered a React admin console with REST-backed dashboards, content tools, and workflows tailored to internal operators—not just read-only charts.",
      "Implemented data-dense tables, filters, and forms with attention to validation and edge cases so admins could work quickly without engineering babysitting.",
      "Established shared patterns for layout, navigation, and data fetching to add new admin features with fewer regressions across modules.",
      "Prioritized responsive, keyboard-friendly interactions so day-to-day ops stayed efficient on common screen sizes used in the business.",
    ],
    problem:
      "Administrators needed a comprehensive dashboard to manage content, view real-time statistics, and perform administrative tasks efficiently.",
    solution:
      "Created a React-based admin portal with REST API integration. Implemented dashboards with real-time data updates, content management interfaces, and intuitive navigation. Focused on responsive design and user-friendly interactions.",
    impact:
      "Streamlined administrative workflows, improved content management efficiency, and provided administrators with actionable insights through data visualization.",
    links: [{ type: "live", url: "#" }],
    featured: true,
  },
  {
    slug: "credit-management-system",
    title: "Credit Management System (B2B)",
    role: "React Developer",
    company: "Treeroot Informatics",
    timeframe: "Jan 2023 – Apr 2024",
    techStack: ["React", "Redux", "JavaScript", "CSS"],
    summary:
      "Developed a B2B Credit Management System for Dutch clients using React and Redux, with a focus on performance optimization and data-heavy UI.",
    resumeBullets: [
      "Built a data-heavy B2B credit management UI in React/Redux, designed for fast, reliable workflows with complex forms and tables.",
      "Applied performance optimizations (memoization, dynamic imports, code-splitting) to keep rendering smooth even with large datasets.",
      "Created reusable UI components for data-heavy views, reducing duplication and making future changes safer.",
      "Maintained a consistent state management approach across screens to improve maintainability and developer velocity.",
    ],
    problem:
      "The credit management system needed to handle large datasets efficiently, provide smooth user interactions, and ensure fast rendering of complex data tables and forms.",
    solution:
      "Built the frontend using React and Redux for state management. Implemented performance optimizations including memoization, dynamic imports, and code-splitting. Created reusable components for data-heavy UI elements.",
    impact:
      "Significantly improved application performance, reduced load times, and provided a smooth user experience even with large datasets. Enabled efficient credit management workflows for the B2B client.",
    links: [{ type: "github", url: "#" }],
    featured: false,
  },
  {
    slug: "legacy-react-app-maintenance",
    title: "Legacy React App Maintenance",
    role: "Software Developer",
    company: "WagerGeeks Private Limited",
    timeframe: "Feb 2025 – May 2025",
    techStack: ["React", "JavaScript", "CSS"],
    summary:
      "Maintained and enhanced a legacy React application, improving code quality and adding new features while preserving existing functionality.",
    resumeBullets: [
      "Refactored critical parts of a legacy React codebase to improve readability and reduce tech debt without breaking existing behavior.",
      "Incrementally shipped new features while preserving backward compatibility, using cautious changes and clear patterns.",
      "Improved code organization and established conventions so the app stayed easier to extend over time.",
      "Handled ongoing UI/functional fixes to keep the product stable and predictable for users.",
    ],
    problem:
      "The legacy application needed updates and new features while maintaining backward compatibility and avoiding breaking changes.",
    solution:
      "Refactored critical components, improved code organization, and added new features incrementally. Documented existing functionality and established patterns for future development.",
    impact:
      "Improved maintainability of the legacy codebase, enabled faster feature development, and ensured stable application performance.",
    featured: false,
  },
];
