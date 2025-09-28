"use client"

import { useState } from "react"
import { Star, MessageSquare, MoreHorizontal, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { formatConversationDate } from "@/lib/date-utils"
import type { MockConversation } from "@/lib/mock-data"
import { getProjectById } from "@/lib/mock-data"

interface ConversationItemProps {
  conversation: MockConversation
  isActive?: boolean
  onClick: () => void
  onToggleStar: () => void
  onArchive?: () => void
  onDelete?: () => void
  onRenameConversation?: (conversationId: string, newTitle: string) => void
  onProjectClick?: (projectId: string) => void
}

export function ConversationItem({
  conversation,
  isActive = false,
  onClick,
  onToggleStar,
  onRenameConversation,
  onProjectClick
}: ConversationItemProps) {
  const project = conversation.projectId ? getProjectById(conversation.projectId) : null
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(conversation.title)

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      onRenameConversation?.(conversation.id, newTitle.trim())
    }
    setIsRenaming(false)
    setNewTitle(conversation.title)
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
    setNewTitle(conversation.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
      onClick={onClick}
    >
      {/* Message Icon */}
      <div className="flex-shrink-0">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Conversation Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {project ? (
              <div className="flex items-center gap-1">
                {isRenaming ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleRename}
                      className="h-6 text-xs flex-1 min-w-0"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRename()
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelRename()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsRenaming(true)
                          }}
                          className="text-xs cursor-pointer"
                        >
                          {project.displayName}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs font-medium">
                          {conversation.title}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>
            ) : (
              isRenaming ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleRename}
                    className="h-6 text-xs flex-1 min-w-0"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRename()
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancelRename()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <h3
                  className="text-sm font-medium truncate cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsRenaming(true)
                  }}
                >
                  {conversation.title}
                </h3>
              )
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatConversationDate(conversation.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {conversation.lastMessage}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {conversation.messageCount} messages
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-sidebar-accent"
          onClick={(e) => {
            e.stopPropagation()
            onToggleStar()
          }}
        >
          <Star
            className={cn(
              "h-3 w-3",
              conversation.isStarred
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-sidebar-accent"
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Implement context menu
          }}
        >
          <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}