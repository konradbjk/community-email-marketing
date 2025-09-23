"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, Star, Plus, Clock, User, Building2 } from "lucide-react"

// Mock prompts data - Merck marketing analytics focus
const mockPrompts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440101",
    title: "Economic Segmentation Strategy Effectiveness",
    description: "What does the distribution of customers across economic segments reveal about the effectiveness and actionability of our current economic segmentation strategy?",
    content: "What does the distribution of customers across economic segments reveal about the effectiveness and actionability of our current economic segmentation strategy?",
    category: "Customer Segmentation",
    type: "final",
    isStarred: true,
    isPersonal: false,
    author: "Segmentation Team",
    createdAt: "2024-01-15",
    usageCount: 42
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440102",
    title: "Email Content Type Performance",
    description: "Which types of emails (e.g., Commercial, Medical, Promotional, Event-related) generate the highest open rates?",
    content: "Which types of emails (e.g., Commercial, Medical, Promotional, Event-related) generate the highest open rates?",
    category: "Email Marketing",
    type: "final",
    isStarred: false,
    isPersonal: false,
    author: "Email Marketing Team",
    createdAt: "2024-01-14",
    usageCount: 38
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440103",
    title: "Email Open Rate Trends by Country",
    description: "Are there any noticeable trends in email open rates across different countries?",
    content: "Are there any noticeable trends in email open rates across different countries?",
    category: "Email Marketing",
    type: "final",
    isStarred: false,
    isPersonal: false,
    author: "Global Email Team",
    createdAt: "2024-01-13",
    usageCount: 29
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440104",
    title: "Field Team Interaction Proportion",
    description: "For a selected brand and Business Unit (BU), what proportion of total interactions (field and non-field) are driven by field teams?",
    content: "For a selected brand and Business Unit (BU), what proportion of total interactions (field and non-field) are driven by field teams?",
    category: "Channel Analytics",
    type: "final",
    isStarred: true,
    isPersonal: false,
    author: "Channel Analytics Team",
    createdAt: "2024-01-12",
    usageCount: 45
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440105",
    title: "Field Interactions vs Regional Average",
    description: "For a selected brand and Business Unit (BU), how does the proportion of field-team-driven interactions compare to the regional average?",
    content: "For a selected brand and Business Unit (BU), how does the proportion of field-team-driven interactions compare to the regional average?",
    category: "Channel Analytics",
    type: "final",
    isStarred: false,
    isPersonal: false,
    author: "Regional Analytics Team",
    createdAt: "2024-01-11",
    usageCount: 33
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440106",
    title: "Franchise Channel Mix Comparison",
    description: "What are the differences in channel mix for each franchise in Country X, and how do these compare to the regional and global averages?",
    content: "What are the differences in channel mix for each franchise in Country X, and how do these compare to the regional and global averages?",
    category: "Channel Analytics",
    type: "final",
    isStarred: false,
    isPersonal: false,
    author: "Franchise Analytics Team",
    createdAt: "2024-01-10",
    usageCount: 27
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440107",
    title: "Face-to-Face vs Other Interactions Trade-off",
    description: "What is the degree of trade-off between face-to-face interactions and all other interaction types over the last X months?",
    content: "What is the degree of trade-off between face-to-face interactions and all other interaction types over the last X months?",
    category: "Channel Analytics",
    type: "suggestion",
    isStarred: false,
    isPersonal: false,
    author: "Interaction Analytics Team",
    createdAt: "2024-01-09",
    usageCount: 22
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440108",
    title: "Channel X Performance by Country",
    description: "Which countries demonstrate the best performance in executing channel X, and how does this compare to the performance in my country?",
    content: "Which countries demonstrate the best performance in executing channel X, and how does this compare to the performance in my country?",
    category: "Channel Analytics",
    type: "suggestion",
    isStarred: true,
    isPersonal: false,
    author: "Global Channel Team",
    createdAt: "2024-01-08",
    usageCount: 19
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440109",
    title: "Omnichannel Mix Trends This Year",
    description: "What are the trends in our omnichannel mix for this year?",
    content: "What are the trends in our omnichannel mix for this year?",
    category: "Channel Analytics",
    type: "suggestion",
    isStarred: false,
    isPersonal: false,
    author: "Omnichannel Team",
    createdAt: "2024-01-07",
    usageCount: 31
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440110",
    title: "Regional Omnichannel Mix Comparison",
    description: "How does our omnichannel mix compare to that of other countries in Region X?",
    content: "How does our omnichannel mix compare to that of other countries in Region X?",
    category: "Channel Analytics",
    type: "suggestion",
    isStarred: false,
    isPersonal: true,
    author: "You",
    createdAt: "2024-01-06",
    usageCount: 16
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440111",
    title: "Digital Channel Territory Usage",
    description: "What territories are most commonly using digital channels?",
    content: "What territories are most commonly using digital channels?",
    category: "Digital Strategy",
    type: "suggestion",
    isStarred: true,
    isPersonal: true,
    author: "You",
    createdAt: "2024-01-05",
    usageCount: 24
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440112",
    title: "HCP Communication Opt-in Quarterly Analysis",
    description: "What percentage of HCPs have opted in for communication this quarter?",
    content: "What percentage of HCPs have opted in for communication this quarter?",
    category: "HCP Engagement",
    type: "final",
    isStarred: false,
    isPersonal: false,
    author: "HCP Engagement Team",
    createdAt: "2024-01-04",
    usageCount: 35
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440113",
    title: "Behavioral Segmentation Year-over-Year Changes",
    description: "How have the behavioral segments changed over the past year?",
    content: "How have the behavioral segments changed over the past year?",
    category: "Customer Segmentation",
    type: "final",
    isStarred: false,
    isPersonal: false,
    author: "Behavioral Analytics Team",
    createdAt: "2024-01-03",
    usageCount: 28
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440114",
    title: "Email Content Type Open Rate Optimization",
    description: "What type of e-mails/Content maximize open rate (Commercial / Medical, promo, event etc.…) at national level/ in other country?",
    content: "What type of e-mails/Content maximize open rate (Commercial / Medical, promo, event etc.…) at national level/ in other country?",
    category: "Email Marketing",
    type: "suggestion",
    isStarred: false,
    isPersonal: true,
    author: "You",
    createdAt: "2024-01-02",
    usageCount: 18
  }
]

export default function PromptsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "Channel Analytics", "Email Marketing", "Customer Segmentation", "HCP Engagement", "Digital Strategy"]

  const filteredPrompts = mockPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort prompts by creation date for recent tab
  const recentPrompts = [...filteredPrompts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const sharedPrompts = filteredPrompts.filter(p => !p.isPersonal)
  const myOwnPrompts = filteredPrompts.filter(p => p.isPersonal)

  const handlePromptClick = (promptId: string) => {
    router.push(`/prompts/${promptId}`)
  }

  const PromptCard = ({ prompt }: { prompt: any }) => (
    <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handlePromptClick(prompt.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{prompt.title}</CardTitle>
              {prompt.isStarred && (
                <Star className="h-4 w-4 fill-current text-yellow-500" />
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {prompt.description}
            </CardDescription>
          </div>
          <Badge variant={prompt.type === "final" ? "default" : "secondary"}>
            {prompt.type === "final" ? "Final" : "Suggestion"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
            <div className="flex items-center gap-1">
              {prompt.isPersonal ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              <span>{prompt.author}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>{prompt.usageCount} uses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Prompt Library</h1>
        </div>
        <div className="ml-auto">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Prompt
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Prompt Library</h2>
              <p className="text-muted-foreground">
                Discover and use curated prompts for pharmaceutical research and analysis
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4"
                />
              </div>
              <div className="flex items-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="my-own">My Own</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shared" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sharedPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-own" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myOwnPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}