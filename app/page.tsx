"use client"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Merck Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Merck OmniA Chat
          </h1>
          <p className="text-lg text-muted-foreground">
            Internal AI Assistant
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Merck & Co., Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
