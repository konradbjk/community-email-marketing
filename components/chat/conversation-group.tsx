"use client"

import { getDateGroupLabel, type DateGroup } from "@/lib/date-utils"
import { ChatItem } from "./chat-item"
import { SidebarMenu } from "@/components/ui/sidebar"
import type { MockConversation } from "@/lib/mock-data"

interface ConversationGroupProps {
  group: DateGroup
  conversations: MockConversation[]
  activeConversationId?: string
  onConversationClick: (conversationId: string) => void
  onToggleStar: (conversationId: string) => void
  onArchive: (conversationId: string) => void
  onDelete: (conversationId: string) => void
  onRename: (conversationId: string, newTitle: string) => void
}

export function ConversationGroup({
  group,
  conversations,
  activeConversationId,
  onConversationClick,
  onToggleStar,
  onArchive,
  onDelete,
  onRename
}: ConversationGroupProps) {
  if (conversations.length === 0) {
    return null
  }

  return (
    <SidebarMenu>
      {conversations.map((conversation) => (
        <ChatItem
          key={conversation.id}
          id={conversation.id}
          title={conversation.title}
          lastMessage={conversation.lastMessage}
          timestamp={conversation.timestamp}
          isStarred={conversation.isStarred}
          isActive={activeConversationId === conversation.id}
          messageCount={conversation.messageCount}
          onSelect={onConversationClick}
          onToggleStar={onToggleStar}
          onArchive={onArchive}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </SidebarMenu>
  )
}