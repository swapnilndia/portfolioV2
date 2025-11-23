import { create } from 'zustand'

import { StructuredContent } from '@/components/chat/MessageRenderer'

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  content?: StructuredContent // Structured content for assistant messages
  id: string
  timestamp: Date
}

// Constants for limits
export const MAX_QUESTIONS = 15
export const MESSAGE_SOFT_LIMIT = 300 // Characters - shows warning
export const MESSAGE_HARD_LIMIT = 500 // Characters - prevents sending

interface ChatStore {
  messages: ChatMessage[]
  history: unknown[]
  isLoading: boolean
  userMessageCount: number
  sendMessage: (text: string) => Promise<void>
  resetChat: () => void
}

const SESSION_STORAGE_KEY = 'portfolio_chat_state'

// Helper to save state to sessionStorage
const saveToSessionStorage = (messages: ChatMessage[], history: unknown[]) => {
  try {
    const state = {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      history,
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save chat state to sessionStorage:', error)
  }
}

// Helper to load state from sessionStorage
const loadFromSessionStorage = (): {
  messages: ChatMessage[]
  history: unknown[]
} => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) {
      return { messages: [], history: [] }
    }

    const parsed = JSON.parse(stored)
    const messages = (parsed.messages || []).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
    return {
      messages,
      history: parsed.history || [],
    }
  } catch (error) {
    console.error('Failed to load chat state from sessionStorage:', error)
    return { messages: [], history: [] }
  }
}

// Initial state with welcome message if no stored state
const getInitialState = () => {
  // Always start fresh - don't load from sessionStorage on initialization
  // Messages will only persist during active session via sendMessage
  const welcomeMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    text: "Hi! I'm Swapnil's AI assistant. Feel free to ask me anything about Swapnil's experience, projects, or skills!",
    timestamp: new Date(),
  }

  return {
    messages: [welcomeMessage],
    history: [],
    userMessageCount: 0,
  }
}

// Helper to count user messages
const countUserMessages = (messages: ChatMessage[]): number => {
  return messages.filter(msg => msg.role === 'user').length
}

const initialState = getInitialState()

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: initialState.messages,
  history: initialState.history,
  isLoading: false,
  userMessageCount: initialState.userMessageCount,

  sendMessage: async (text: string) => {
    if (!text.trim()) return

    const state = get()

    // Check question limit
    if (state.userMessageCount >= MAX_QUESTIONS) {
      throw new Error(`You've reached the maximum of ${MAX_QUESTIONS} questions. Please reset the chat to continue.`)
    }

    // Check message length (hard limit)
    if (text.length > MESSAGE_HARD_LIMIT) {
      throw new Error(`Message is too long. Maximum ${MESSAGE_HARD_LIMIT} characters allowed.`)
    }
    
    // Optimistically add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...state.messages, userMessage]
    const newUserMessageCount = state.userMessageCount + 1
    set({ 
      messages: updatedMessages, 
      isLoading: true,
      userMessageCount: newUserMessageCount,
    })

    // Save to sessionStorage
    saveToSessionStorage(updatedMessages, state.history)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          previousMessages: state.history,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Handle structured or text response
      const responseContent = data.response
      let responseText = ''
      let structuredContent: StructuredContent | undefined = undefined

      try {
        if (typeof responseContent === 'object' && responseContent !== null && 'type' in responseContent) {
          // Structured response
          structuredContent = responseContent as StructuredContent
          // Extract text for display/fallback
          if (responseContent.type === 'text' && responseContent.content?.text) {
            responseText = String(responseContent.content.text)
          } else if (responseContent.type === 'structured') {
            responseText = String(responseContent.content?.text || 'Response')
          } else {
            responseText = 'Response received'
          }
        } else if (typeof responseContent === 'string') {
          // Legacy string format
          responseText = responseContent
        } else {
          responseText = 'I apologize, but I could not generate a response.'
        }
      } catch (error) {
        console.error('Error parsing response content:', error)
        responseText = typeof responseContent === 'string' ? responseContent : 'I apologize, but I could not generate a response.'
        structuredContent = undefined
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        content: structuredContent,
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      const newHistory = data.history || []

      set({
        messages: finalMessages,
        history: newHistory,
        isLoading: false,
        userMessageCount: newUserMessageCount,
      })

      // Save to sessionStorage
      saveToSessionStorage(finalMessages, newHistory)
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Sorry, I encountered an error while processing your request.'

      // Add error message as assistant message
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: errorMessage,
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, errorChatMessage]
      // Keep the user message count since the user message was already added

      set({
        messages: finalMessages,
        isLoading: false,
        userMessageCount: newUserMessageCount,
      })

      // Save to sessionStorage
      saveToSessionStorage(finalMessages, state.history)
    }
  },

  resetChat: () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to remove chat state from sessionStorage:', error)
    }

    // Reset to welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm Swapnil's AI assistant. Feel free to ask me anything about Swapnil's experience, projects, or skills!",
      timestamp: new Date(),
    }

    set({
      messages: [welcomeMessage],
      history: [],
      isLoading: false,
      userMessageCount: 0,
    })
  },
}))

