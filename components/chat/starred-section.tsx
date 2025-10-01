"use client"

import { useState } from "react"
import { Star, Folder, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { MockConversation, MockProject } from "@/lib/mock-data"
import { useRouter } from "next/navigation"

interface StarredSectionProps {
  starredConversations: MockConversation[]
  starredProjects: MockProject[]
  activeConversationId?: string
  onConversationClick: (conversationId: string) => void
  onProjectClick: (projectId: string) => void
  onToggleConversationStar: (conversationId: string) => void
  onToggleProjectStar: (projectId: string) => void
}

export function StarredSection({
  starredConversations,
  starredProjects,
  activeConversationId,
  onConversationClick,
  onProjectClick,
  onToggleConversationStar,
  onToggleProjectStar
}: StarredSectionProps) {
  const router = useRouter()
  const hasStarredItems = starredConversations.length > 0 || starredProjects.length > 0

  // Combine conversations and projects, then limit to 6 items
  const allStarredItems = [
    ...starredConversations.map(item => ({ ...item, type: 'conversation' as const })),
    ...starredProjects.map(item => ({ ...item, type: 'project' as const }))
  ]
  const displayedItems = allStarredItems.slice(0, 6)
  const hasMoreItems = allStarredItems.length > 6

  // Create hover states for all items at the top level to follow Rules of Hooks
  const [hoveredItems, setHoveredItems] = useState<Record<string, boolean>>({})

  if (!hasStarredItems) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {/* Display limited starred items */}
        {displayedItems.map((item) => {
          if (item.type === 'conversation') {
            const conversation = item as MockConversation & { type: 'conversation' }
            const itemKey = `conv-${conversation.id}`
            const isHovered = hoveredItems[itemKey] || false
            return (
              <div
                key={`starred-conv-${conversation.id}`}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  activeConversationId === conversation.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                onClick={() => onConversationClick(conversation.id)}
                onMouseEnter={() => setHoveredItems(prev => ({ ...prev, [itemKey]: true }))}
                onMouseLeave={() => setHoveredItems(prev => ({ ...prev, [itemKey]: false }))}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {conversation.title}
                  </h3>
                </div>

                <div className="absolute right-2 top-2 z-50">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6 hover:bg-sidebar-accent transition-opacity",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="z-50">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleConversationStar(conversation.id)
                        }}
                      >
                        <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                        Remove from favourites
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          } else {
            const project = item as MockProject & { type: 'project' }
            const itemKey = `proj-${project.id}`
            const isProjectHovered = hoveredItems[itemKey] || false
            return (
              <div
                key={`starred-proj-${project.id}`}
                className="relative flex items-center gap-3 rounded-lg p-2 cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => onProjectClick(project.id)}
                onMouseEnter={() => setHoveredItems(prev => ({ ...prev, [itemKey]: true }))}
                onMouseLeave={() => setHoveredItems(prev => ({ ...prev, [itemKey]: false }))}
              >
                <div className="flex-shrink-0">
                  <Folder className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {project.displayName}
                  </h3>
                </div>

                <div className="absolute right-2 top-2 z-50">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-6 w-6 hover:bg-sidebar-accent transition-opacity",
                          isProjectHovered ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="z-50">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleProjectStar(project.id)
                        }}
                      >
                        <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                        Remove from favourites
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          }
        })}

        {/* Show more button */}
        {hasMoreItems && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/favourites')}
          >
            Show more ({allStarredItems.length - 6} more)
          </Button>
        )}
      </div>
    </div>
  )
}