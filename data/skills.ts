export type SkillCategory = {
  category: string;
  skills: string[];
};

export const skills: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "SCSS",
      "Material-UI",
      "Tailwind CSS",
    ],
  },
  {
    category: "State & Data",
    skills: ["Redux", "React Context API", "React Hook Form", "REST APIs"],
  },
  {
    category: "Tooling & Infrastructure",
    skills: ["Git", "GitHub", "Jira", "Figma", "Postman", "Swagger", "AWS EC2", "AWS RDS"],
  },
  {
    category: "AI Tools",
    skills: ["ChatGPT", "Claude", "Grok", "Cursor AI"],
  },
];
