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

// Mock conversations with Merck marketing analytics context
export const mockConversations: MockConversation[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Email Open Rates by Type Analysis",
    lastMessage: "Medical emails achieve 24% open rates vs 18% for promotional content across regions.",
    timestamp: subMinutes(new Date(), 15),
    isStarred: true,
    isArchived: false,
    messageCount: 12,
    projectId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // Email Performance Insights
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Economic Segmentation Strategy Review",
    lastMessage: "Premium segment shows 65% engagement vs 40% in value segment, suggesting refinement needed.",
    timestamp: subHours(new Date(), 2),
    isStarred: false,
    isArchived: false,
    messageCount: 8,
    projectId: "6ba7b811-9dad-11d1-80b4-00c04fd430c8", // Customer Segmentation Optimization
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Omnichannel Mix Trends 2024",
    lastMessage: "Digital interactions increased 32% while maintaining face-to-face quality scores above 4.1.",
    timestamp: subHours(new Date(), 5),
    isStarred: true,
    isArchived: false,
    messageCount: 15,
    projectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Omnichannel Analytics Dashboard
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Field vs Non-Field Interaction Analysis",
    lastMessage: "Oncology BU shows 68% field-driven interactions, above 62% regional average.",
    timestamp: subDays(new Date(), 1),
    isStarred: false,
    isArchived: false,
    messageCount: 6,
    projectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // Omnichannel Analytics Dashboard
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "HCP Opt-in Rates Q4 Analysis",
    lastMessage: "Communication opt-in reached 73% this quarter, up 8% from Q3 baseline.",
    timestamp: subDays(new Date(), 2),
    isStarred: false,
    isArchived: false,
    messageCount: 9,
    // No project assignment
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Behavioral Segmentation Evolution",
    lastMessage: "Early adopter segment grew 15% while traditionalist segment decreased 12% year-over-year.",
    timestamp: subDays(new Date(), 3),
    isStarred: true,
    isArchived: false,
    messageCount: 18,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Channel X Performance by Country",
    lastMessage: "Germany leads with 89% execution rate, compared to 67% in home market.",
    timestamp: subDays(new Date(), 5),
    isStarred: false,
    isArchived: false,
    messageCount: 11,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    title: "Face-to-Face vs Digital Trade-off Analysis",
    lastMessage: "6-month trend shows 15% shift to digital with maintained relationship quality.",
    timestamp: subDays(new Date(), 8),
    isStarred: false,
    isArchived: true,
    messageCount: 14,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Regional Channel Mix Comparison",
    lastMessage: "EMEA shows 45% digital vs 35% APAC, indicating market maturity differences.",
    timestamp: subDays(new Date(), 12),
    isStarred: false,
    isArchived: false,
    messageCount: 7,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    title: "Digital Channel Territory Mapping",
    lastMessage: "Urban territories adopt digital channels 2.4x faster than rural counterparts.",
    timestamp: subDays(new Date(), 20),
    isStarred: true,
    isArchived: false,
    messageCount: 22,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    title: "Content Type Performance Analysis",
    lastMessage: "Event-related content generates 31% open rates vs 19% commercial emails.",
    timestamp: subDays(new Date(), 35),
    isStarred: false,
    isArchived: true,
    messageCount: 16,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    title: "Cross-Country Email Trends",
    lastMessage: "Nordic countries show 28% higher open rates than global average across all content types.",
    timestamp: subDays(new Date(), 45),
    isStarred: false,
    isArchived: false,
    messageCount: 13,
  },
]

// Mock projects - Merck marketing analytics focus
export const mockProjects: MockProject[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "omnichannel-analytics",
    displayName: "Omnichannel Analytics Dashboard",
    description: "Track field vs digital interaction ratios, channel performance, and customer engagement across all touchpoints",
    isStarred: true,
    conversationCount: 28,
    lastActivity: subHours(new Date(), 2),
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "email-performance-insights",
    displayName: "Email Performance Insights",
    description: "Analyze email open rates by content type (Commercial, Medical, Promotional, Event) across regions and customer segments",
    isStarred: false,
    conversationCount: 19,
    lastActivity: subDays(new Date(), 1),
  },
  {
    id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    name: "customer-segmentation-optimization",
    displayName: "Customer Segmentation Optimization",
    description: "Economic and behavioral segmentation analysis, HCP opt-in tracking, and segment performance evaluation",
    isStarred: true,
    conversationCount: 34,
    lastActivity: subHours(new Date(), 3),
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    name: "cross-regional-benchmarking",
    displayName: "Cross-Regional Benchmarking",
    description: "Compare channel execution, engagement rates, and marketing performance across countries and regions",
    isStarred: false,
    conversationCount: 22,
    lastActivity: subDays(new Date(), 5),
  },
  {
    id: "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
    name: "digital-territory-mapping",
    displayName: "Digital Territory Mapping",
    description: "Identify territories with highest digital channel adoption and optimize digital engagement strategies",
    isStarred: false,
    conversationCount: 15,
    lastActivity: subDays(new Date(), 7),
  },
]

// Helper function to get starred items
export function getStarredConversations(): MockConversation[] {
  return mockConversations.filter(conv => conv.isStarred)
}

export function getStarredProjects(): MockProject[] {
  return mockProjects.filter(proj => proj.isStarred)
}

// Helper function to get project by ID
export function getProjectById(projectId: string): MockProject | undefined {
  return mockProjects.find(proj => proj.id === projectId)
}

// Helper function to group conversations by date
export function getConversationsByGroup() {
  const now = new Date()
  const conversations = [...mockConversations].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const groups = {
    today: conversations.filter(conv => {
      const convDate = new Date(conv.timestamp)
      return convDate.toDateString() === now.toDateString()
    }),
    yesterday: conversations.filter(conv => {
      const yesterday = subDays(now, 1)
      const convDate = new Date(conv.timestamp)
      return convDate.toDateString() === yesterday.toDateString()
    }),
    last7days: conversations.filter(conv => {
      const sevenDaysAgo = subDays(now, 7)
      const twoDaysAgo = subDays(now, 2)
      const convDate = new Date(conv.timestamp)
      return convDate >= sevenDaysAgo && convDate < twoDaysAgo
    }),
    thismonth: conversations.filter(conv => {
      const sevenDaysAgo = subDays(now, 7)
      const convDate = new Date(conv.timestamp)
      return convDate.getMonth() === now.getMonth() &&
             convDate.getFullYear() === now.getFullYear() &&
             convDate < sevenDaysAgo
    }),
    older: conversations.filter(conv => {
      const convDate = new Date(conv.timestamp)
      return convDate.getMonth() !== now.getMonth() ||
             convDate.getFullYear() !== now.getFullYear()
    })
  }

  return groups
}