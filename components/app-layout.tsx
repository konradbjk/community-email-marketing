"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { UserBar } from "@/components/layout/user-bar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import ChatProvider from "@/providers/chat-provider"
import { mockConversations } from "@/lib/mock-data"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Don't show sidebar on home page (login page)
  const isLoginPage = pathname === "/"
  const showSidebar = !isLoginPage

  // Redirect authenticated users from login page to chat
  useEffect(() => {
    if (status === "authenticated" && isLoginPage) {
      router.push("/chat")
    }
  }, [status, isLoginPage, router])

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  const handleProjectSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleNewChat = () => {
    router.push("/chat")
  }

  // Login page - no protection needed
  if (isLoginPage) {
    return (
      <ChatProvider initialConversations={mockConversations}>
        {children}
      </ChatProvider>
    )
  }

  // Protected pages - require authentication
  return (
    <ProtectedRoute>
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
            {/* User Bar positioned in top-right corner */}
            <div className="fixed top-4 right-4 z-50">
              <UserBar />
            </div>
          </div>
        </SidebarProvider>
      </ChatProvider>
    </ProtectedRoute>
  )
}
