'use client'

import { useState, useRef, useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import { useChatStore, MAX_QUESTIONS, MESSAGE_SOFT_LIMIT, MESSAGE_HARD_LIMIT } from '@/store/chatStore'
import { MessageRenderer } from './MessageRenderer'
import './ChatWidget.scss'

export const ChatWidget = () => {
  const { setChatOpen } = useUiStore()
  const { messages, isLoading, userMessageCount, sendMessage, resetChat } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setChatOpen(isOpen)
  }, [isOpen, setChatOpen])

  const handleClose = () => {
    setIsOpen(false)
    // Reset chat when closing
    resetChat()
  }

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = (instant = false) => {
    const messagesContainer = messagesEndRef.current?.parentElement
    if (messagesContainer) {
      if (instant) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready, then scroll to bottom (newest messages)
      const timer = setTimeout(() => {
        scrollToBottom(true) // Instant scroll to bottom when opening (show newest)
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Smooth scroll to bottom when new messages arrive (newest at bottom)
      scrollToBottom(false)
    }
  }, [messages, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    // Check question limit
    if (userMessageCount >= MAX_QUESTIONS) {
      setError(`You've reached the maximum of ${MAX_QUESTIONS} questions. Please reset the chat to continue.`)
      return
    }

    // Check hard limit
    if (input.length > MESSAGE_HARD_LIMIT) {
      setError(`Message is too long. Maximum ${MESSAGE_HARD_LIMIT} characters allowed.`)
      return
    }

    setError(null)
    const userInput = input.trim()
    setInput('')
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    inputRef.current?.focus()

    try {
      await sendMessage(userInput)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sorry, I encountered an error while processing your request.'
      setError(errorMessage)
    }
  }

  const handleReset = () => {
    resetChat()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    
    // Enforce hard limit
    if (value.length > MESSAGE_HARD_LIMIT) {
      return
    }
    
    setInput(value)
    setError(null) // Clear error on input change
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }
  
  // Calculate message length status
  const messageLength = input.length
  const isOverSoftLimit = messageLength > MESSAGE_SOFT_LIMIT
  const isOverHardLimit = messageLength >= MESSAGE_HARD_LIMIT
  const isAtQuestionLimit = userMessageCount >= MAX_QUESTIONS
  const remainingQuestions = MAX_QUESTIONS - userMessageCount
  const remainingChars = MESSAGE_HARD_LIMIT - messageLength

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form && !isLoading && input.trim()) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <>
          <div
            className="chat-widget__backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose()
              }
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault()
              }
            }}
            aria-hidden="true"
          />
          <div 
            className="chat-widget__container"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="chat-widget__header">
              <div className="chat-widget__header-info">
                <div className="chat-widget__status-indicator" />
                <div>
                  <h3 className="chat-widget__title">AI Assistant</h3>
                  <p className="chat-widget__subtitle">
                    {isAtQuestionLimit 
                      ? `You've reached ${MAX_QUESTIONS} questions. Reset to continue.`
                      : `${remainingQuestions} of ${MAX_QUESTIONS} questions remaining`
                    }
                  </p>
                </div>
              </div>
              <div className="chat-widget__header-actions">
                <button
                  className="chat-widget__reset"
                  onClick={handleReset}
                  aria-label="Reset chat"
                  title="Reset chat"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <button
                  className="chat-widget__close"
                  onClick={handleClose}
                  aria-label="Close chat"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="chat-widget__messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-widget__message chat-widget__message--${message.role}`}
                >
                  <div className="chat-widget__message-avatar">
                    {message.role === 'user' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    ) : (
                      <div className="chat-widget__ai-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"></path>
                          <path d="M19 3L19.94 6.06L23 7L19.94 7.94L19 11L18.06 7.94L15 7L18.06 6.06L19 3Z"></path>
                          <path d="M5 15L5.94 18.06L9 19L5.94 19.94L5 23L4.06 19.94L1 19L4.06 18.06L5 15Z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="chat-widget__message-content">
                    <div className="chat-widget__message-text">
                      {message.role === 'assistant' && message.content ? (
                        <MessageRenderer content={message.content} />
                      ) : (
                        <MessageRenderer content={message.text} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-widget__message chat-widget__message--assistant">
                  <div className="chat-widget__message-avatar">
                    <div className="chat-widget__ai-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"></path>
                        <path d="M19 3L19.94 6.06L23 7L19.94 7.94L19 11L18.06 7.94L15 7L18.06 6.06L19 3Z"></path>
                        <path d="M5 15L5.94 18.06L9 19L5.94 19.94L5 23L4.06 19.94L1 19L4.06 18.06L5 15Z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="chat-widget__message-content">
                    <div className="chat-widget__typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {isAtQuestionLimit && (
              <div className="chat-widget__limit-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <strong>Question limit reached!</strong>
                  <p>You've asked {MAX_QUESTIONS} questions. Click "Reset chat" to start a new conversation.</p>
                </div>
              </div>
            )}
            {error && (
              <div className="chat-widget__error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="chat-widget__input-container">
              <div className="chat-widget__input-wrapper">
                <textarea
                  ref={inputRef}
                  className={`chat-widget__input chat-widget__textarea ${
                    isOverSoftLimit ? 'chat-widget__input--warning' : ''
                  } ${isOverHardLimit ? 'chat-widget__input--error' : ''}`}
                  placeholder={
                    isAtQuestionLimit
                      ? "Question limit reached. Click 'Reset chat' to continue..."
                      : "Ask about Swapnil's experience, projects, or skills..."
                  }
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isAtQuestionLimit}
                  rows={3}
                  maxLength={MESSAGE_HARD_LIMIT}
                />
                <div className="chat-widget__input-footer">
                  {isOverSoftLimit && !isOverHardLimit && (
                    <span className="chat-widget__char-warning">
                      {remainingChars} characters remaining
                    </span>
                  )}
                  {isOverHardLimit && (
                    <span className="chat-widget__char-error">
                      Maximum length reached
                    </span>
                  )}
                  <span className={`chat-widget__char-count ${
                    isOverSoftLimit ? 'chat-widget__char-count--warning' : ''
                  }`}>
                    {messageLength}/{MESSAGE_HARD_LIMIT}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="chat-widget__send"
                disabled={!input.trim() || isLoading || isAtQuestionLimit || isOverHardLimit}
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="chat-widget__send-spinner" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </>
      )}
      {!isOpen && (
        <button
          className="chat-widget__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open chat"
          aria-expanded={false}
        >
          <div className="chat-widget__toggle-pulse" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  )
}
