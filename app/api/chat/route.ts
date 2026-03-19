import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  AGENT1_PREPROCESSOR,
  AGENT2_DATA_FETCHER,
  AGENT3_ANSWER_BUILDER,
  AGENT4_PERSONALITY_LAYER,
} from "./agents";
import { buildDataContext, portfolioContext, type TopicContext } from "./contextBuilder";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type Intent = "factual" | "personal" | "unknown";

interface PreprocessorResult {
  intent: Intent;
  cleanQuestion: string;
  timeContext: string | null;
  topicContext: TopicContext;
}

interface FinalResponse {
  type: "text";
  content: { text: string };
  followUpQuestions?: string[];
}

function isSmallTalk(message: string): boolean {
  const text = message.toLowerCase().trim();
  return (
    /^(hi|hello|hey|yo|hii|hlo)\b/.test(text) ||
    /\b(how are you|how r u|what's up|whats up|sup)\b/.test(text) ||
    /\b(thanks|thank you|thx|ty)\b/.test(text)
  );
}

function isAiQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return /\b(ai|artificial intelligence|copilot|cline|claude|grok|chatgpt|github copilot)\b/.test(
    q
  );
}

function isLearningQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /\bcurrently learning\b/.test(q) ||
    (/\bhow (does|do) swapnil\b/.test(q) && /\blearn\b/.test(q)) ||
    (/\bhow (does|do) he\b/.test(q) && /\blearn\b/.test(q)) ||
    (/\bhow (does|do) he\b/.test(q) && /\blearn new\b/.test(q)) ||
    /\blearn new\b/.test(q) ||
    /\bhow (does|do).*learn\b/.test(q) ||
    /\badvance dsa\b/.test(q) ||
    /\bds(a|a)\b/.test(q) ||
    /\bsystem design\b/.test(q) ||
    /\bspring boot\b/.test(q) ||
    /\bjava\b/.test(q) ||
    /\bupdate(s|ing)? (his )?portfolio\b/.test(q)
  );
}

async function runGeneralHelper(
  openai: OpenAI,
  cleanQuestion: string,
  history: ChatHistoryItem[]
): Promise<FinalResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant embedded in a personal portfolio site. " +
          "Answer the user's question briefly and clearly in professional, warm English. " +
          "Keep it to 2–3 short sentences. Do not mention policy, models, or internal tools. " +
          "After answering, add one short sentence that gently redirects back to Swapnil's portfolio context " +
          '(e.g., \"If you want, ask how Swapnil has used this in his work.\").',
      },
      ...history.slice(-6),
      { role: "user", content: cleanQuestion },
    ],
    max_tokens: 160,
    temperature: 0.3,
  });

  const text = truncateWords(completion.choices[0]?.message?.content?.trim() ?? "", 120);
  return {
    type: "text",
    content: {
      text: text || "I can help with that. If you want, ask how Swapnil has used this in his work.",
    },
    followUpQuestions: [
      "How has Swapnil used this in his projects?",
      "Which project is most relevant to this topic?",
    ],
  };
}

async function runGeneralDefinitionHelper(
  openai: OpenAI,
  cleanQuestion: string
): Promise<FinalResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a concise explainer for software/AI terms inside a developer portfolio site. " +
          "Give a short, accurate definition in 2–3 sentences, in professional, warm English. " +
          "Focus on what the tool/term is and how developers typically use it. " +
          "Do not mention Swapnil here; this is a general explanation.",
      },
      { role: "user", content: cleanQuestion },
    ],
    max_tokens: 140,
    temperature: 0.2,
  });

  const text = truncateWords(completion.choices[0]?.message?.content?.trim() ?? "", 90);
  return {
    type: "text",
    content: {
      text:
        text ||
        "It’s a developer tool. If you’d like, you can ask how Swapnil has used it in his work.",
    },
    followUpQuestions: [
      "How has Swapnil used this tool in his work?",
      "Which of Swapnil's projects involved this tool?",
    ],
  };
}

const FOLLOW_UP_REFERENCE_REGEX =
  /\b(this|that|it|they|them|he|his|these|those|previous|above|same|yeh|woh|uska|unka)\b/i;

function formatHistoryForPreprocessor(history: ChatHistoryItem[]): string {
  return history
    .slice(-6)
    .map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.content}`)
    .join("\n");
}

function isLikelyFollowUpQuestion(question: string): boolean {
  return FOLLOW_UP_REFERENCE_REGEX.test(question);
}

function inferTopicContext(question: string): TopicContext {
  const q = question.toLowerCase();

  if (
    /\bwhat did|working on|worked on|last week|last month|recently|today|yesterday|november|october|january|february|march|april|may|june|july|august|september|december\b/.test(
      q
    )
  ) {
    return "worklog";
  }

  if (/\bwhat is|what does|stand for|meaning|cdd|ondc|fnb|strapi\b/.test(q)) {
    return "glossary";
  }

  if (/\b(ai|artificial intelligence|github copilot|copilot|claude|grok|chatgpt)\b/.test(q)) {
    return "technology";
  }

  if (/\bleave|leaves|holiday|personal leave|half day\b/.test(q)) {
    return "general";
  }

  if (
    /\bachievement|achieve|evolved|evolution|grow|growth|proud|biggest|best work|impact|challenging\b/.test(
      q
    )
  ) {
    return "achievement";
  }

  if (
    /\btech|stack|technology|tool|react|next\.?js|javascript|css|strapi|seo|api|git|testing|husky|eslint\b/.test(
      q
    )
  ) {
    return "technology";
  }

  if (
    /\bproject|build|built|contribution|contributed|piramal|bajaj|protean|cdd|fnb|grocery|inspired|motivat/.test(
      q
    )
  ) {
    return "project";
  }

  return "general";
}

function normalizePreprocessorResult(
  parsed: PreprocessorResult,
  rawQuestion: string,
  history: ChatHistoryItem[]
): PreprocessorResult {
  const cleanQuestion = parsed.cleanQuestion ?? rawQuestion;
  const isFollowUp = history.length > 0 && isLikelyFollowUpQuestion(cleanQuestion);

  if (parsed.intent === "unknown" && isFollowUp) {
    return {
      intent: "factual",
      cleanQuestion,
      timeContext: parsed.timeContext ?? null,
      topicContext: parsed.topicContext ?? inferTopicContext(cleanQuestion),
    };
  }

  if (parsed.intent !== "unknown" && !parsed.topicContext && parsed.intent === "factual") {
    return {
      ...parsed,
      cleanQuestion,
      timeContext: parsed.timeContext ?? null,
      topicContext: inferTopicContext(cleanQuestion),
    };
  }

  return {
    intent: parsed.intent ?? "factual",
    cleanQuestion,
    timeContext: parsed.timeContext ?? null,
    topicContext: parsed.topicContext ?? "general",
  };
}

function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return raw.slice(start, index + 1);
    }
  }

  return null;
}

function normalizeAssistantText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function truncateWords(text: string, maxWords = 180): string {
  const normalized = normalizeAssistantText(text);
  const words = normalized.split(" ").filter(Boolean);

  if (words.length <= maxWords) {
    return normalized;
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/);
  const selected: string[] = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(" ").filter(Boolean);
    if (sentenceWords.length === 0) continue;

    if (wordCount + sentenceWords.length > maxWords) {
      break;
    }

    selected.push(sentence);
    wordCount += sentenceWords.length;
  }

  if (selected.length > 0 && wordCount >= 120) {
    return selected.join(" ").trim();
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

function unescapeJsonString(value: string): string {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value
      .replace(/\\"/g, '"')
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\\\/g, "\\");
  }
}

function extractTextFromMalformedJson(raw: string): string | null {
  const textMatch = raw.match(/"text"\s*:\s*"((?:\\[\s\S]|[^"\\])*)"/);
  if (!textMatch?.[1]) return null;
  return truncateWords(unescapeJsonString(textMatch[1]));
}

function extractFollowUpsFromMalformedJson(raw: string): string[] | undefined {
  const match = raw.match(/"followUpQuestions"\s*:\s*\[((?:.|\n|\r)*?)\]/);
  if (!match?.[1]) return undefined;

  const items = [...match[1].matchAll(/"((?:\\.|[^"\\])*)"/g)]
    .map((item) => unescapeJsonString(item[1]).trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function isUnavailableAnswer(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("i don't have that specific information") ||
    lower.includes("this specific information is not available") ||
    lower.includes("isn't available at the moment") ||
    lower.includes("there isn't specific information")
  );
}

function getSpecificTechMention(question: string): string | null {
  const techMentions = [
    "React",
    "Next.js",
    "JavaScript",
    "CSS",
    "Strapi",
    "SEO",
    "API Integration",
    "Git",
    "Unit Testing",
    "Husky",
    "ESLint",
    "GitHub Copilot",
    "Cline",
    "Claude",
    "Grok",
    "ChatGPT",
  ];

  const lower = question.toLowerCase();
  return techMentions.find((tech) => lower.includes(tech.toLowerCase())) ?? null;
}

function getRelevantProjectLabel(question: string, rawFacts: string): string | null {
  const combined = `${question}\n${rawFacts}`.toLowerCase();

  if (
    combined.includes("config driven deployment") ||
    combined.includes("cdd") ||
    combined.includes("piramal sales central")
  ) {
    return "CDD project";
  }

  if (combined.includes("bajaj") || combined.includes("ondc") || combined.includes("fnb")) {
    return "Bajaj Finserv Markets project";
  }

  if (combined.includes("protean")) {
    return "Protean project";
  }

  return null;
}

function buildGroundedFollowUps(
  topicContext: TopicContext,
  cleanQuestion: string,
  rawFacts: string,
  finalText: string,
  history: ChatHistoryItem[]
): string[] | undefined {
  const learningQ = isLearningQuestion(cleanQuestion);
  const aiQ = isAiQuestion(cleanQuestion);

  // If the portfolio data is missing, we still want follow-ups for "learning" and "AI" topics
  // so the chat stays conversational instead of dead-ending.
  if ((isUnavailableAnswer(rawFacts) || isUnavailableAnswer(finalText)) && !learningQ && !aiQ) {
    return undefined;
  }

  const projectLabel = getRelevantProjectLabel(cleanQuestion, rawFacts);
  const techMention = getSpecificTechMention(cleanQuestion);
  const recentUserQuestions = new Set(
    history
      .filter((item) => item.role === "user")
      .slice(-8)
      .map((item) => item.content.trim().toLowerCase())
  );
  recentUserQuestions.add(cleanQuestion.trim().toLowerCase());

  const pickFollowUps = (candidates: string[], fallback: string[]): string[] | undefined => {
    const uniqueCandidates = [...new Set(candidates.map((item) => item.trim()))].filter(Boolean);
    const filtered = uniqueCandidates.filter(
      (item) => !recentUserQuestions.has(item.toLowerCase())
    );
    const chosen = (filtered.length >= 2 ? filtered : uniqueCandidates).slice(0, 4);

    if (chosen.length >= 2) {
      return chosen;
    }

    const fallbackPool = [...new Set(fallback.map((item) => item.trim()))].filter(
      (item) => item && !recentUserQuestions.has(item.toLowerCase())
    );

    if (chosen.length === 1 && fallbackPool.length > 0) {
      return [chosen[0], ...fallbackPool.slice(0, 3)];
    }

    if (fallbackPool.length >= 2) {
      return fallbackPool.slice(0, 4);
    }

    return undefined;
  };

  if (learningQ) {
    return pickFollowUps(
      [
        "What topics in advanced DSA is Swapnil currently focusing on?",
        "How does Swapnil plan his learning roadmap day by day?",
        "After DSA, what does Swapnil want to learn next (system design)?",
        "What is Swapnil's plan for Java and Spring Boot after system design?",
      ],
      [
        "How does Swapnil prefer to learn new technologies (group study, AI, YouTube)?",
        "What helps Swapnil stay consistent while updating his portfolio daily?",
      ]
    );
  }

  switch (topicContext) {
    case "project":
      if (projectLabel === "CDD project") {
        return pickFollowUps(
          [
            "What problem did the CDD project solve?",
            "What technologies were used in the CDD project?",
            "What impact did the CDD project have on the codebase?",
            "Why was the CDD project so important?",
          ],
          [
            "What was Swapnil's most challenging project?",
            "How has Swapnil's work evolved over time?",
          ]
        );
      }
      if (projectLabel === "Bajaj Finserv Markets project") {
        return pickFollowUps(
          [
            "What did Swapnil build for the Bajaj Finserv Markets project?",
            "What technologies were used in the Bajaj Finserv Markets project?",
            "How did Swapnil handle SEO in the Bajaj Finserv Markets project?",
            "What was Swapnil's role in the Bajaj Finserv Markets project?",
          ],
          [
            "What technologies has Swapnil been using lately?",
            "What was Swapnil's biggest achievement so far?",
          ]
        );
      }
      if (projectLabel === "Protean project") {
        return pickFollowUps(
          [
            "What did Swapnil build for the Protean project?",
            "What technologies were used in the Protean project?",
            "How complex was the Protean project?",
          ],
          [
            "What technologies has Swapnil been using lately?",
            "Tell me about Swapnil's most recent project.",
          ]
        );
      }
      return pickFollowUps(
        [
          "What technologies were used in that project?",
          "What impact did that project have?",
          "What was Swapnil's contribution to that project?",
        ],
        [
          "What technologies has Swapnil been using lately?",
          "What was Swapnil's biggest achievement so far?",
        ]
      );
    case "technology":
      if (techMention) {
        return pickFollowUps(
          [
            `Which projects used ${techMention}?`,
            `How has Swapnil used ${techMention} in his work?`,
            `Has ${techMention} been part of Swapnil's recent work?`,
          ],
          ["Which AI tools does Swapnil use at work?", "What is Swapnil's most recent project?"]
        );
      }
      return pickFollowUps(
        [
          "Which projects used this tech stack?",
          "Which AI tools does Swapnil use at work?",
          "How has Swapnil used these technologies across projects?",
        ],
        [
          "What was Swapnil's biggest achievement so far?",
          "Tell me about Swapnil's most recent project.",
        ]
      );
    case "worklog":
      return pickFollowUps(
        [
          "Which project was Swapnil focused on during that time?",
          "What technologies did Swapnil use during that period?",
          "What did Swapnil build during that period?",
        ],
        [
          "How has Swapnil's work evolved over time?",
          "What technologies has Swapnil been using lately?",
        ]
      );
    case "achievement":
      return pickFollowUps(
        [
          "What was Swapnil's most challenging project?",
          "How has Swapnil's work evolved over time?",
          "What impact did Swapnil have in his recent projects?",
        ],
        [
          "What technologies has Swapnil been using lately?",
          "Tell me about Swapnil's most recent project.",
        ]
      );
    case "glossary":
      if (cleanQuestion.toLowerCase().includes("cdd")) {
        return pickFollowUps(
          [
            "Which project used CDD?",
            "What impact did CDD have on the codebase?",
            "Why was CDD introduced?",
          ],
          [
            "Tell me about Swapnil's most recent project.",
            "What technologies has Swapnil been using lately?",
          ]
        );
      }
      return pickFollowUps(
        [
          "Where has Swapnil used that in his work?",
          "Which project is most relevant to that term?",
          "How does that connect to Swapnil's projects?",
        ],
        [
          "Tell me about Swapnil's most recent project.",
          "What was Swapnil's biggest achievement so far?",
        ]
      );
    case "general":
    default:
      return pickFollowUps(
        [
          "Tell me about Swapnil's most recent project.",
          "What technologies has Swapnil been using lately?",
          "What was Swapnil's biggest achievement so far?",
          "How has Swapnil's work evolved over time?",
        ],
        []
      );
  }
}

// ─── OpenAI client ────────────────────────────────────────────────────────────

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("API key not configured");
  return new OpenAI({ apiKey });
}

// ─── History sanitizer ────────────────────────────────────────────────────────

function sanitizeHistory(value: unknown): ChatHistoryItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ChatHistoryItem =>
        typeof item === "object" &&
        item !== null &&
        "role" in item &&
        "content" in item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-20);
}

// ─── Agent 1: Preprocessor ────────────────────────────────────────────────────

async function runPreprocessor(
  openai: OpenAI,
  rawQuestion: string,
  history: ChatHistoryItem[]
): Promise<PreprocessorResult> {
  const conversationContext = formatHistoryForPreprocessor(history);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: AGENT1_PREPROCESSOR },
      {
        role: "user",
        content: conversationContext
          ? `Recent conversation:\n${conversationContext}\n\nLatest user message:\n${rawQuestion}`
          : rawQuestion,
      },
    ],
    max_tokens: 150,
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  try {
    return normalizePreprocessorResult(JSON.parse(raw) as PreprocessorResult, rawQuestion, history);
  } catch {
    return normalizePreprocessorResult(
      { intent: "factual", cleanQuestion: rawQuestion, timeContext: null, topicContext: null },
      rawQuestion,
      history
    );
  }
}

// ─── Agent 2: Data Fetcher ────────────────────────────────────────────────────

async function runDataFetcher(
  openai: OpenAI,
  cleanQuestion: string,
  dataContext: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: AGENT2_DATA_FETCHER(dataContext) },
      { role: "user", content: cleanQuestion },
    ],
    max_tokens: 600,
    temperature: 0,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// ─── Agent 3: Answer Builder ──────────────────────────────────────────────────

async function runAnswerBuilder(
  openai: OpenAI,
  cleanQuestion: string,
  rawFacts: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: AGENT3_ANSWER_BUILDER },
      { role: "user", content: `Question: ${cleanQuestion}\n\nFacts:\n${rawFacts}` },
    ],
    max_tokens: 220,
    temperature: 0.1,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// ─── Agent 4: Personality Layer ───────────────────────────────────────────────

async function runPersonalityLayer(
  openai: OpenAI,
  cleanQuestion: string,
  factualAnswer: string,
  history: ChatHistoryItem[]
): Promise<FinalResponse> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: AGENT4_PERSONALITY_LAYER },
      ...history,
      { role: "user", content: `Question: ${cleanQuestion}\n\nAnswer:\n${factualAnswer}` },
    ],
    max_tokens: 260,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(extractJsonObject(raw) ?? raw) as FinalResponse;
    parsed.content = { text: truncateWords(parsed.content?.text ?? "") };
    return parsed;
  } catch {
    const recoveredText = extractTextFromMalformedJson(raw);
    const recoveredFollowUps = extractFollowUpsFromMalformedJson(raw);

    return {
      type: "text",
      content: {
        text: recoveredText ?? truncateWords(raw || "I couldn't generate a response."),
      },
      followUpQuestions: recoveredFollowUps,
    };
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message: string;
      previousMessages?: unknown[];
    };
    const { message, previousMessages } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const history = sanitizeHistory(previousMessages);
    const openai = getClient();

    if (isSmallTalk(message)) {
      const response: FinalResponse = {
        type: "text",
        content: {
          text: "Hi there — happy to help. This assistant is focused on Swapnil’s work and portfolio, so feel free to ask about his projects, experience, tech stack, or recent work.",
        },
        followUpQuestions: [
          "What is Swapnil working on recently?",
          "Which projects show his strongest impact?",
        ],
      };

      const updatedHistory: ChatHistoryItem[] = [
        ...history,
        { role: "user", content: message.trim() },
        { role: "assistant", content: response.content.text },
      ];

      return NextResponse.json({ response, history: updatedHistory });
    }

    // ── Step 1: Preprocess (Agent 1) ──────────────────────────────────────────
    const { intent, cleanQuestion, timeContext, topicContext } = await runPreprocessor(
      openai,
      message.trim(),
      history
    );

    const learningOverride = isLearningQuestion(cleanQuestion);
    const effectiveIntent: Intent = learningOverride ? "personal" : intent;
    const effectiveTopicContext: TopicContext = learningOverride ? "general" : topicContext;

    // ── Step 2: Unknown intent → graceful fallback (no more LLM calls) ────────
    if (effectiveIntent === "unknown") {
      const fallback = await runGeneralHelper(openai, cleanQuestion, history);
      const updatedHistory: ChatHistoryItem[] = [
        ...history,
        { role: "user", content: cleanQuestion },
        { role: "assistant", content: fallback.content.text },
      ];
      return NextResponse.json({ response: fallback, history: updatedHistory });
    }

    // ── Step 3: Build data context ────────────────────────────────────────────
    const dataContext =
      effectiveIntent === "personal"
        ? portfolioContext
        : buildDataContext(effectiveTopicContext, timeContext, cleanQuestion);

    // ── Step 4: Fetch raw facts (Agent 2) ─────────────────────────────────────
    const rawFacts = await runDataFetcher(openai, cleanQuestion, dataContext);

    const lowerQuestion = message.toLowerCase();
    const mentionsSwapnil =
      lowerQuestion.includes("swapnil") ||
      lowerQuestion.includes("his ") ||
      lowerQuestion.includes("he ");

    if (
      !mentionsSwapnil &&
      (topicContext === "glossary" || topicContext === "technology") &&
      isUnavailableAnswer(rawFacts)
    ) {
      const generalDef = await runGeneralDefinitionHelper(openai, cleanQuestion);
      const updatedHistory: ChatHistoryItem[] = [
        ...history,
        { role: "user", content: cleanQuestion },
        { role: "assistant", content: generalDef.content.text },
      ];
      return NextResponse.json({ response: generalDef, history: updatedHistory });
    }

    // ── Step 5: Build clean answer (Agent 3) ──────────────────────────────────
    const cleanAnswer = await runAnswerBuilder(openai, cleanQuestion, rawFacts);

    // ── Step 6: Add personality (Agent 4) ─────────────────────────────────────
    const finalResponse = await runPersonalityLayer(openai, cleanQuestion, cleanAnswer, history);
    finalResponse.followUpQuestions = buildGroundedFollowUps(
      effectiveTopicContext,
      cleanQuestion,
      rawFacts,
      finalResponse.content.text,
      history
    );

    const updatedHistory: ChatHistoryItem[] = [
      ...history,
      { role: "user", content: cleanQuestion },
      { role: "assistant", content: finalResponse.content?.text ?? "" },
    ];

    return NextResponse.json({ response: finalResponse, history: updatedHistory });
  } catch (error) {
    console.error("Error in chat API:", error);

    let errorMessage = "An unexpected error occurred.";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("API key not configured")) {
        statusCode = 500;
      } else if (error.message.includes("quota") || error.message.includes("insufficient_quota")) {
        errorMessage = "OpenAI API quota exceeded. Please check your billing.";
        statusCode = 429;
      } else if (error.message.includes("rate_limit") || error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again in a moment.";
        statusCode = 429;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 504;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
