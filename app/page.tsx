"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Merck Internal Chatbot
          </h1>
          <h2 className="text-2xl font-semibold text-muted-foreground mb-6">
            AI Assistant for Internal Use
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start conversations with our AI assistant. Access project-based instructions,
            prompt library, and multi-turn dialogue capabilities.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push("/chat")}
              size="lg"
              className="gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              Start Chatting
            </Button>
            <Button
              onClick={() => router.push("/prompts")}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              Browse Prompts
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-muted-foreground font-medium">
              POC Version - Development in Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
