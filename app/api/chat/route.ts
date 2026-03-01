import { NextRequest, NextResponse } from "next/server";
import { Agent, run, user, type AgentInputItem } from "@openai/agents";
import { portfolioContext } from "@/data/portfolioContext";

// Create the agent with portfolio context
let agent: Agent | null = null;

const getAgent = () => {
  if (!agent) {
    const enhancedInstructions = `${portfolioContext}

RESPONSE FORMATTING RULES:
When your response contains structured content (lists, tables, code blocks, or when formatting would improve readability), format it as JSON. For simple conversational responses, use plain text.

JSON Structure (when needed):
{
  "type": "structured",
  "content": {
    "text": "Optional introductory text",
    "sections": [
      {
        "type": "list" | "table" | "code" | "image" | "text",
        "data": {...}
      }
    ]
  }
}

Examples:

List response:
{
  "type": "structured",
  "content": {
    "text": "Here are Swapnil's key skills:",
    "sections": [
      {
        "type": "list",
        "data": {
          "items": ["React", "TypeScript", "Next.js"],
          "ordered": false
        }
      }
    ]
  }
}

Table response:
{
  "type": "structured",
  "content": {
    "sections": [
      {
        "type": "table",
        "data": {
          "headers": ["Company", "Role", "Duration"],
          "rows": [["Tekonika", "Software Developer", "May 2025 - Present"]]
        }
      }
    ]
  }
}

Code response:
{
  "type": "structured",
  "content": {
    "sections": [
      {
        "type": "code",
        "data": {
          "code": "const greeting = 'Hello';",
          "language": "javascript"
        }
      }
    ]
  }
}

Simple text response (use this for most conversational replies):
Just respond with plain text, no JSON needed. Only use JSON when structure adds clear value.

IMPORTANT: Always ensure valid JSON when using structured format. For casual conversation, use plain text.`;

    agent = new Agent({
      name: "Portfolio Assistant",
      instructions: enhancedInstructions,
    });
  }
  return agent;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message: string;
      previousMessages?: AgentInputItem[];
    };
    const { message, previousMessages = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const agent = getAgent();

    // Build input based on whether we have previous messages
    const input = previousMessages.length > 0 ? [...previousMessages, user(message)] : message;

    // Run the agent with the input
    const result = await run(agent, input);

    // Extract the response text
    const responseText = result.finalOutput || "I apologize, but I could not generate a response.";

    // Try to parse as JSON, fallback to text if not valid JSON
    let parsedResponse: unknown = null;
    try {
      // Only try to parse if it looks like JSON (starts with { or [)
      const trimmed = responseText.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        parsedResponse = JSON.parse(responseText);
        // Validate it's our expected structure
        if (
          typeof parsedResponse === "object" &&
          parsedResponse !== null &&
          "type" in parsedResponse &&
          (parsedResponse.type === "text" || parsedResponse.type === "structured")
        ) {
          // Valid structured response - use it as is
        } else {
          // Invalid structure, treat as plain text
          parsedResponse = null;
        }
      }
    } catch {
      // Not valid JSON, treat as plain text
      parsedResponse = null;
    }

    // Always return a valid response structure
    const finalResponse = parsedResponse || {
      type: "text",
      content: {
        text: responseText,
      },
    };

    return NextResponse.json({
      response: finalResponse,
      history: result.history,
    });
  } catch (error) {
    console.error("Error in chat API:", error);

    let errorMessage = "An unexpected error occurred while processing your message.";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes("API key not configured")) {
        statusCode = 500;
      } else if (error.message.includes("insufficient_quota") || error.message.includes("quota")) {
        errorMessage =
          "OpenAI API quota has been exceeded. Please check your OpenAI account billing.";
        statusCode = 429;
      } else if (error.message.includes("rate_limit") || error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again in a moment.";
        statusCode = 429;
      } else if (
        error.message.includes("Network") ||
        error.message.includes("connection") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Connection error: Unable to reach OpenAI API. Please check your internet connection and try again.";
        statusCode = 503;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout. Please try again in a moment.";
        statusCode = 504;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
