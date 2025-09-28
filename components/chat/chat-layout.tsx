"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ConversationSidebar } from "./conversation-sidebar"
import { Chat } from "@/components/ui/chat"
import { mockConversations } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

// Mock message type for demonstration
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Find active conversation
  const activeConversation = mockConversations.find(
    conv => conv.id === activeConversationId
  )

  // Mock chat handlers
  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.()
    if (!input.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: `I understand you said: "${userMessage.content}". This is a mock response for demonstration purposes. In the actual implementation, this would connect to your backend AI service.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsGenerating(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId)
    // TODO: Load conversation messages from API
    setMessages([
      {
        id: "demo-1",
        role: "user",
        content: "Hello! I'd like to discuss the topic from this conversation.",
        timestamp: new Date()
      },
      {
        id: "demo-2",
        role: "assistant",
        content: `Welcome to the conversation "${mockConversations.find(c => c.id === conversationId)?.title}". How can I help you today?`,
        timestamp: new Date()
      }
    ])
  }

  const handleProjectSelect = (projectId: string) => {
    // TODO: Navigate to project view
    console.log("Selected project:", projectId)
  }

  const handleNewChat = () => {
    setActiveConversationId(undefined)
    setMessages([])
    setInput("")
  }

  const handleRateResponse = (messageId: string, rating: "thumbs-up" | "thumbs-down") => {
    // TODO: Implement feedback handling
    console.log("Rating:", messageId, rating)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ConversationSidebar
          activeConversationId={activeConversationId}
          onConversationSelect={handleConversationSelect}
          onProjectSelect={handleProjectSelect}
          onNewChat={handleNewChat}
        />

        <SidebarInset className="flex flex-col">
          {/* Header with sidebar trigger and conversation title */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">
                {activeConversation?.title || "New Chat"}
              </h1>
            </div>
          </header>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {activeConversationId || messages.length > 0 ? (
              <Chat
                messages={messages.map(msg => ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content
                }))}
                handleSubmit={handleSubmit}
                input={input}
                handleInputChange={handleInputChange}
                isGenerating={isGenerating}
                onRateResponse={handleRateResponse}
                className="flex-1"
              />
            ) : (
              // Welcome screen when no conversation is selected
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md text-center space-y-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h2 className="text-xl font-semibold">Welcome to your AI Assistant</h2>
                  <p className="text-muted-foreground">
                    Start a new conversation or select an existing one from the sidebar to begin chatting.
                  </p>
                  <Button onClick={handleNewChat} className="mt-4">
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}