"use client"

import { useChat as useAIChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useCallback, useEffect } from 'react'
import { useChat, useAddMessage, useSetIsGenerating, useActiveConversation, useSetInput, useInput } from './use-chat'

/**
 * Enhanced chat hook that integrates AI SDK v5 with Zustand store
 * This combines the AI SDK's real AI capabilities with our local state management
 */
export function useAIChatIntegration() {
  const activeConversation = useActiveConversation()
  const addMessage = useAddMessage()
  const setIsGenerating = useSetIsGenerating()
  const setInput = useSetInput()
  const input = useInput()

  // Get current messages from store
  const currentMessages = useChat((state) => state.currentMessages)

  // Convert our message format to AI SDK format
  const convertToAIMessages = useCallback(() => {
    return currentMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      parts: [{ type: 'text' as const, text: msg.content }]
    }))
  }, [currentMessages])

  // AI SDK hook - Demo mode with basic integration
  const {
    messages: aiMessages,
    sendMessage,
    status,
    stop
  } = useAIChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    id: activeConversation?.id,
    messages: convertToAIMessages(),
    onFinish: () => {
      setIsGenerating(false)
    },
    onError: (error) => {
      console.error('AI Chat error:', error)
      setIsGenerating(false)
    }
  })

  // Update generating state based on AI SDK status
  useEffect(() => {
    const isGenerating = status === 'submitted' || status === 'streaming'
    setIsGenerating(isGenerating)
  }, [status, setIsGenerating])

  // Enhanced send message function
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !activeConversation) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    }

    // Add user message to store immediately
    addMessage(activeConversation.id, userMessage)
    setInput("")
    setIsGenerating(true)

    // Send to AI SDK
    try {
      await sendMessage({
        parts: [{ type: 'text', text: input.trim() }]
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsGenerating(false)
    }
  }, [input, activeConversation, addMessage, setInput, setIsGenerating, sendMessage])

  const handleStop = useCallback(() => {
    stop()
    setIsGenerating(false)
  }, [stop, setIsGenerating])

  return {
    messages: currentMessages,
    input,
    setInput,
    handleSendMessage,
    isGenerating: status === 'submitted' || status === 'streaming',
    status,
    stop: handleStop
  }
}