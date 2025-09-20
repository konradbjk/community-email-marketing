"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Chat } from "@/components/ui/chat"
import { MessageInput } from "@/components/ui/message-input"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"
import {
  useActiveConversation,
  useCreateNewConversation,
  useInput,
  useIsGenerating,
  useAddMessage,
  useSetInput,
  useSetIsGenerating
} from "@/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { MessageSquare, Plus } from "lucide-react"

export default function ChatPage() {
  const router = useRouter()
  const activeConversation = useActiveConversation()
  const createNewConversation = useCreateNewConversation()
  const input = useInput()
  const isGenerating = useIsGenerating()
  const addMessage = useAddMessage()
  const setInput = useSetInput()
  const setIsGenerating = useSetIsGenerating()
  const [files, setFiles] = useState<File[] | null>(null)

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => {
    event?.preventDefault?.()
    if (!input.trim()) return

    // Create a new conversation if none exists
    let conversationId = activeConversation?.id
    if (!conversationId) {
      conversationId = createNewConversation()
    }

    const userMessageData = {
      role: "user" as const,
      content: input.trim()
    }

    // Handle attachments if present
    if (options?.experimental_attachments && options.experimental_attachments.length > 0) {
      console.log("Attachments:", options.experimental_attachments)
    }

    addMessage(conversationId, userMessageData)
    setInput("")
    setIsGenerating(true)

    // Navigate to the conversation
    router.push(`/chat/${conversationId}`)

    // Simulate AI response
    setTimeout(() => {
      const aiMessageData = {
        role: "assistant" as const,
        content: `I understand you said: "${userMessageData.content}". This is a mock response for demonstration purposes.`
      }
      addMessage(conversationId!, aiMessageData)
      setIsGenerating(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleAppend = (message: { role: "user"; content: string }) => {
    // Create a new conversation
    const conversationId = createNewConversation()
    addMessage(conversationId, message)
    setIsGenerating(true)

    // Navigate to the conversation
    router.push(`/chat/${conversationId}`)

    // Simulate AI response
    setTimeout(() => {
      const aiMessageData = {
        role: "assistant" as const,
        content: `I understand you said: "${message.content}". This is a mock response for demonstration purposes.`
      }
      addMessage(conversationId, aiMessageData)
      setIsGenerating(false)
    }, 1000)
  }

  const handleStop = () => {
    setIsGenerating(false)
  }

  const handleTranscribeAudio = async (blob: Blob): Promise<string> => {
    console.log("Transcribing audio blob:", blob)
    return "Mock transcription result"
  }

  // Merck marketing team specific suggestions for new users
  const suggestions = [
    "For a selected brand and Business Unit (BU), what proportion of total interactions (field and non-field) are driven by field teams?",
    "Which types of emails (Commercial, Medical, Promotional, Event-related) generate the highest open rates?",
    "What does the distribution of customers across economic segments reveal about our current segmentation strategy?",
    "Are there any noticeable trends in email open rates across different countries?",
    "What are the differences in channel mix for each franchise in Country X compared to regional averages?",
    "What is the degree of trade-off between face-to-face interactions and digital channels over the last 6 months?"
  ]

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
      </header>

      {/* Chat area - Centered layout */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Greeting */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold text-foreground">
              Hi there, how can I help you today?
            </h1>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="w-full">
            <MessageInput
              value={input}
              onChange={handleInputChange}
              placeholder="How can I help you today?"
              allowAttachments={true}
              files={files}
              setFiles={setFiles}
              isGenerating={isGenerating}
              stop={handleStop}
              transcribeAudio={handleTranscribeAudio}
            />
          </form>
        </div>

        {/* Prompt Suggestions */}
        <PromptSuggestions
          label="Try these prompts"
          append={handleAppend}
          suggestions={suggestions.slice(0, 6)}
        />
      </div>
    </>
  )
}