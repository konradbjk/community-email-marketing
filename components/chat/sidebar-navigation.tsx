"use client"

import { MessageSquare, Plus, Folder, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavigationTab = "chats" | "projects" | "archived"

interface SidebarNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
  onNewChat: () => void
}

export function SidebarNavigation({
  activeTab,
  onTabChange,
  onNewChat
}: SidebarNavigationProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      {/* New Chat Button */}
      <Button
        onClick={onNewChat}
        className="w-full justify-start gap-2 h-9"
        variant="default"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("chats")}
          className={cn(
            "flex-1 gap-2 h-8",
            activeTab === "chats" && "bg-background shadow-sm"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Chats
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("projects")}
          className={cn(
            "flex-1 gap-2 h-8",
            activeTab === "projects" && "bg-background shadow-sm"
          )}
        >
          <Folder className="h-4 w-4" />
          Projects
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("archived")}
          className={cn(
            "flex-1 gap-2 h-8",
            activeTab === "archived" && "bg-background shadow-sm"
          )}
        >
          <Archive className="h-4 w-4" />
          Archive
        </Button>
      </div>
    </div>
  )
}