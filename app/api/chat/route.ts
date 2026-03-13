import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { portfolioContext } from "@/data/portfolioContext";
import { buildWorkLogContext } from "@/data/workLog";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type Intent = "work_history" | "tech_stack" | "general" | "projects";

interface PreprocessorResult {
  intent: Intent;
  cleanQuestion: string;
  timeContext: string | null;
}

interface FinalResponse {
  type: "structured" | "text";
  content: {
    text?: string;
    sections?: unknown[];
  };
  followUpQuestions: [string, string];
}

// ─── OpenAI client ───────────────────────────────────────────────────────────

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("API key not configured");
  return new OpenAI({ apiKey });
}

// ─── History sanitizer ───────────────────────────────────────────────────────

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

// ─── Agent 1: Preprocessor ───────────────────────────────────────────────────
// Fixes spelling/grammar, detects intent, extracts time context.
// ~300 input / ~80 output tokens

async function runPreprocessor(openai: OpenAI, rawQuestion: string): Promise<PreprocessorResult> {
  const systemPrompt = `You are a query preprocessor for a portfolio chatbot.

Given a user's raw message, return ONLY valid JSON (no markdown, no extra text):
{
  "intent": "work_history" | "tech_stack" | "general" | "projects",
  "cleanQuestion": "<fixed spelling + grammar, same meaning>",
  "timeContext": "<time reference extracted e.g. 'November 2025', 'last month', 'recently', 'October'> or null"
}

Intent rules:
- "work_history" → asking about daily work, what was done on a project, past activity, client work
- "tech_stack" → asking about technologies, tools, or skills used over time
- "general" → asking about Swapnil as a person, career, background, contact
- "projects" → asking about portfolio projects (eCommerce, eGaming, etc.)

Always correct spelling and grammar in cleanQuestion. Keep the meaning identical.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: rawQuestion },
    ],
    max_tokens: 120,
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(raw) as PreprocessorResult;
    return {
      intent: parsed.intent ?? "general",
      cleanQuestion: parsed.cleanQuestion ?? rawQuestion,
      timeContext: parsed.timeContext ?? null,
    };
  } catch {
    return { intent: "general", cleanQuestion: rawQuestion, timeContext: null };
  }
}

// ─── Agent 3: Work Log Specialist ────────────────────────────────────────────
// Answers factual questions using work log data only.
// ~1100 input / ~200 output tokens

async function runWorkLogSpecialist(
  openai: OpenAI,
  cleanQuestion: string,
  timeContext: string | null
): Promise<string> {
  const workLogContext = buildWorkLogContext(cleanQuestion, timeContext);

  const systemPrompt = `You are a work log data analyst. You have access to Swapnil's daily work journal below.
Answer the question factually and concisely using only the data provided.
Be specific — mention dates, clients, technologies, and task types where relevant.
If the data doesn't cover the question, say so briefly.

${workLogContext}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: cleanQuestion },
    ],
    max_tokens: 350,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// ─── Agent 2: Master Responder ───────────────────────────────────────────────
// Orchestrates final answer. Gets work log answer if needed, adds personality,
// always returns 2 follow-up questions.
// ~1200 input / ~400 output tokens

const MASTER_SYSTEM_PROMPT = `${portfolioContext}

RESPONSE FORMAT RULES:
Always return valid JSON (no markdown fences):
{
  "type": "text" | "structured",
  "content": {
    "text": "<your answer here>",
    "sections": []
  },
  "followUpQuestions": ["<follow-up Q1>", "<follow-up Q2>"]
}

For structured responses (lists, tables), populate "sections" using:
- { "type": "list", "data": { "items": [...], "ordered": false } }
- { "type": "table", "data": { "headers": [...], "rows": [[...]] } }

Rules:
- followUpQuestions must ALWAYS have exactly 2 short, relevant follow-up questions the user might want to ask next.
- Keep your answer in character (friendly, Hinglish vibe, concise).
- If a work_log_answer is provided in the user message, use it as your factual base and enhance it with personality.
- Never expose internal agent details to the user.`;

async function runMasterResponder(
  openai: OpenAI,
  cleanQuestion: string,
  workLogAnswer: string | null,
  history: ChatHistoryItem[]
): Promise<FinalResponse> {
  const userContent = workLogAnswer
    ? `User question: ${cleanQuestion}\n\nWork log data:\n${workLogAnswer}`
    : cleanQuestion;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userContent },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";

  try {
    const parsed = JSON.parse(raw) as FinalResponse;
    // Ensure followUpQuestions always has 2 items
    if (!Array.isArray(parsed.followUpQuestions) || parsed.followUpQuestions.length < 2) {
      parsed.followUpQuestions = [
        "What technologies has Swapnil been using lately?",
        "Tell me about his most recent project.",
      ];
    }
    return parsed;
  } catch {
    return {
      type: "text",
      content: { text: raw || "I couldn't generate a response." },
      followUpQuestions: [
        "What technologies has Swapnil been using lately?",
        "Tell me about his most recent project.",
      ],
    };
  }
}

// ─── POST handler ────────────────────────────────────────────────────────────

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

    // ── Step 1: Preprocess (Agent 1) ──────────────────────────────────────
    const { intent, cleanQuestion, timeContext } = await runPreprocessor(openai, message.trim());

    // ── Step 2: Work log lookup (Agent 3) — only if needed ────────────────
    let workLogAnswer: string | null = null;
    if (intent === "work_history" || intent === "tech_stack") {
      workLogAnswer = await runWorkLogSpecialist(openai, cleanQuestion, timeContext);
    }

    // ── Step 3: Master response (Agent 2) ────────────────────────────────
    const finalResponse = await runMasterResponder(openai, cleanQuestion, workLogAnswer, history);

    // Build updated history using cleanQuestion for better context continuity
    const updatedHistory: ChatHistoryItem[] = [
      ...history,
      { role: "user", content: cleanQuestion },
      {
        role: "assistant",
        content: finalResponse.content?.text ?? JSON.stringify(finalResponse.content),
      },
    ];

    return NextResponse.json({
      response: finalResponse,
      history: updatedHistory,
    });
  } catch (error) {
    console.error("Error in chat API:", error);

    let errorMessage = "An unexpected error occurred.";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("API key not configured")) statusCode = 500;
      else if (error.message.includes("quota") || error.message.includes("insufficient_quota")) {
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
