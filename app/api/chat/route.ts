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
  if (isUnavailableAnswer(rawFacts) || isUnavailableAnswer(finalText)) {
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

    // ── Step 1: Preprocess (Agent 1) ──────────────────────────────────────────
    const { intent, cleanQuestion, timeContext, topicContext } = await runPreprocessor(
      openai,
      message.trim(),
      history
    );

    // ── Step 2: Unknown intent → graceful fallback (no more LLM calls) ────────
    if (intent === "unknown") {
      const fallback: FinalResponse = {
        type: "text",
        content: {
          text: "Yaar, yeh Swapnil ke baare mein nahi lag raha. Main sirf uske kaam, projects, aur skills ke baare mein bata sakta hoon. Koi relevant sawaal puchho!",
        },
        followUpQuestions: undefined,
      };
      const updatedHistory: ChatHistoryItem[] = [
        ...history,
        { role: "user", content: cleanQuestion },
        { role: "assistant", content: fallback.content.text },
      ];
      return NextResponse.json({ response: fallback, history: updatedHistory });
    }

    // ── Step 3: Build data context ────────────────────────────────────────────
    const dataContext =
      intent === "personal"
        ? portfolioContext
        : buildDataContext(topicContext, timeContext, cleanQuestion);

    // ── Step 4: Fetch raw facts (Agent 2) ─────────────────────────────────────
    const rawFacts = await runDataFetcher(openai, cleanQuestion, dataContext);

    // ── Step 5: Build clean answer (Agent 3) ──────────────────────────────────
    const cleanAnswer = await runAnswerBuilder(openai, cleanQuestion, rawFacts);

    // ── Step 6: Add personality (Agent 4) ─────────────────────────────────────
    const finalResponse = await runPersonalityLayer(openai, cleanQuestion, cleanAnswer, history);
    finalResponse.followUpQuestions = buildGroundedFollowUps(
      topicContext,
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
