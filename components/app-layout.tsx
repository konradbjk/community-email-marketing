"use client"

import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import ChatProvider from "@/providers/chat-provider"
import { mockConversations } from "@/lib/mock-data"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show sidebar on home page
  const showSidebar = pathname !== "/"

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  const handleProjectSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleNewChat = () => {
    router.push("/chat")
  }

  if (!showSidebar) {
    return (
      <ChatProvider initialConversations={mockConversations}>
        {children}
      </ChatProvider>
    )
  }

  return (
    <ChatProvider initialConversations={mockConversations}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <ConversationSidebar
            onConversationSelect={handleConversationSelect}
            onProjectSelect={handleProjectSelect}
            onNewChat={handleNewChat}
          />
          <SidebarInset className="flex flex-col w-full">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ChatProvider>
  )
}