"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { MessageInput } from "@/components/ui/message-input"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"
import {
  useInput,
  useIsGenerating,
  useSetInput,
  useSetIsGenerating,
  useSetActiveConversation
} from "@/hooks/use-chat"
import { useCreateConversation } from "@/hooks/use-conversations"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function ChatPage() {
  const router = useRouter()
  const input = useInput()
  const isGenerating = useIsGenerating()
  const setInput = useSetInput()
  const setIsGenerating = useSetIsGenerating()
  const setActiveConversation = useSetActiveConversation()
  const createConversationMutation = useCreateConversation()
  const [files, setFiles] = useState<File[] | null>(null)

  const sendMessageToConversation = useCallback(
    async (conversationId: string, message: string) => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Failed to send message")
      }
    },
    []
  )

  const startConversation = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim()) return
      if (createConversationMutation.isPending || isGenerating) return

      setIsGenerating(true)
      setInput("")
      setFiles(null)

      let conversationId: string | null = null

      try {
        const conversation = await createConversationMutation.mutateAsync({ title: "New Chat" })
        conversationId = conversation.id

        await sendMessageToConversation(conversation.id, messageContent)

        setActiveConversation(conversation.id)
        router.push(`/chat/${conversation.id}`)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start conversation"
        toast.error(errorMessage)
        setInput(messageContent)

        if (conversationId) {
          setActiveConversation(conversationId)
          router.push(`/chat/${conversationId}`)
        }
      } finally {
        setIsGenerating(false)
      }
    },
    [
      createConversationMutation,
      isGenerating,
      router,
      sendMessageToConversation,
      setActiveConversation,
      setInput,
      setFiles,
      setIsGenerating,
    ]
  )

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => {
    event?.preventDefault?.()
    if (!input.trim()) return

    if (options?.experimental_attachments && options.experimental_attachments.length > 0) {
      toast.error("File attachments are not supported in new conversations yet.")
      return
    }

    await startConversation(input.trim())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleAppend = async (message: { role: "user"; content: string }) => {
    await startConversation(message.content)
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
