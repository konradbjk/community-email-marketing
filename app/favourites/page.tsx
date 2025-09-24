"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageSquare, Folder, ArrowLeft, Search } from "lucide-react"
import { getStarredConversations, getStarredProjects } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"

export default function FavouritesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const starredConversations = getStarredConversations()
  const starredProjects = getStarredProjects()

  const filteredConversations = starredConversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProjects = starredProjects.filter(project =>
    project.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const ConversationCard = ({ conversation }: { conversation: any }) => (
    <Card key={conversation.id} className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleConversationClick(conversation.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{conversation.title}</CardTitle>
              <Star className="h-4 w-4 fill-current text-yellow-500" />
            </div>
            <CardDescription className="line-clamp-2">
              {conversation.lastMessage}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{conversation.messageCount} messages</span>
            </div>
          </div>
          <span>{formatDistanceToNow(conversation.timestamp, { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectCard = ({ project }: { project: any }) => (
    <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleProjectClick(project.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{project.displayName}</CardTitle>
              <Star className="h-4 w-4 fill-current text-yellow-500" />
            </div>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{project.conversationCount} conversations</span>
            </div>
          </div>
          <span>{formatDistanceToNow(project.lastActivity, { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <h1 className="text-lg font-semibold">Favourites</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your Starred Items</h2>
              <p className="text-muted-foreground">
                All your starred conversations and projects in one place
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search favourites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({starredConversations.length + starredProjects.length})</TabsTrigger>
              <TabsTrigger value="conversations">Conversations ({starredConversations.length})</TabsTrigger>
              <TabsTrigger value="projects">Projects ({starredProjects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredConversations.map((conversation) => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))}
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredConversations.map((conversation) => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))}
              </div>
              {filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No starred conversations found</h3>
                  <p className="text-muted-foreground">
                    Star conversations to see them here
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No starred projects found</h3>
                  <p className="text-muted-foreground">
                    Star projects to see them here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {(filteredConversations.length === 0 && filteredProjects.length === 0 && searchQuery) && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}