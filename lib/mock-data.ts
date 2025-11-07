import { subDays, subHours, subMinutes } from "date-fns"

export type MockConversation = {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  isStarred: boolean
  isArchived: boolean
  messageCount: number
  projectId?: string // Nullable project reference
}

export type MockProject = {
  id: string
  name: string
  displayName: string
  description: string
  isStarred: boolean
  conversationCount: number
  lastActivity: Date
}

// Removed hardcoded mock data - now using database API endpoints
// Data is seeded in postgres-init.sql and accessed via /api/conversations and /api/projects