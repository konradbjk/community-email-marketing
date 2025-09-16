import Link from "next/link";
import { Mail, Users, BarChart3, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            GenAI Cracow
          </h1>
          <h2 className="text-2xl font-semibold text-muted-foreground mb-6">
            Email Marketing Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage subscribers, create campaigns, and track engagement for the GenAI Cracow community.
            Built with Next.js, AWS SES, and React Email.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Subscriber Management</h3>
            <p className="text-muted-foreground">
              Import, export, and manage community members with tags and segmentation.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <Mail className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Campaign Creation</h3>
            <p className="text-muted-foreground">
              Create beautiful emails with React Email templates and send via AWS SES.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <BarChart3 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics & Tracking</h3>
            <p className="text-muted-foreground">
              Track opens, clicks, and engagement metrics with detailed analytics.
            </p>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <Settings className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Configuration</h3>
            <p className="text-muted-foreground">
              Configure AWS SES settings, daily limits, and email preferences.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Access Admin Panel
            </Link>
            <Link
              href="/admin/campaigns"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium border transition-colors"
            >
              Create Campaign
            </Link>
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
  );
}
