import { NextRequest, NextResponse } from 'next/server'
import { Agent, run, user } from '@openai/agents'
import { portfolioContext } from '@/data/portfolioContext'

// Create the agent with portfolio context
let agent: Agent | null = null

const getAgent = () => {
  if (!agent) {
    agent = new Agent({
      name: 'Portfolio Assistant',
      instructions: portfolioContext,
    })
  }
  return agent
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      message: string
      previousMessages?: unknown[]
    }
    const { message, previousMessages = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    const agent = getAgent()

    // Build input based on whether we have previous messages
    const input =
      previousMessages.length > 0
        ? [...previousMessages, user(message)]
        : message

    // Run the agent with the input
    const result = await run(agent, input)

    // Extract the response text
    const responseText = result.finalOutput || 'I apologize, but I could not generate a response.'

    return NextResponse.json({
      response: responseText,
      history: result.history,
    })
  } catch (error) {
    console.error('Error in chat API:', error)

    let errorMessage = 'An unexpected error occurred while processing your message.'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      if (error.message.includes('API key not configured')) {
        statusCode = 500
      } else if (error.message.includes('insufficient_quota') || error.message.includes('quota')) {
        errorMessage = 'OpenAI API quota has been exceeded. Please check your OpenAI account billing.'
        statusCode = 429
      } else if (error.message.includes('rate_limit') || error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.'
        statusCode = 429
      } else if (
        error.message.includes('Network') ||
        error.message.includes('connection') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('fetch')
      ) {
        errorMessage =
          'Connection error: Unable to reach OpenAI API. Please check your internet connection and try again.'
        statusCode = 503
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again in a moment.'
        statusCode = 504
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
