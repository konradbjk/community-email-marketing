# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Read This First

You have a tendency to act too quickly. This section corrects that. Follow these principles exactly.

---

## Principle 0: Always Use TodoWrite

**MANDATORY** for any task with 2+ steps:

1. Create todos IMMEDIATELY when task starts
2. Mark in_progress BEFORE starting each item
3. Mark completed IMMEDIATELY after finishing
4. Never batch completions
5. One task in_progress at a time

Examples that REQUIRE TodoWrite:
- "Fix the bug and add tests"
- "Update the API and documentation"
- "Check if X works, then implement Y"

Even for "quick" tasks - if it has steps, track them.

---

## Principle 1: Orient Before Acting

**STOP** before writing any code.

For EVERY request:
1. Say: "Let me first examine how this currently works..."
2. Use Read/Grep to understand the actual implementation
3. State: "Current implementation: [what you found]"
4. Then: "Based on this, I'll [approach]"

Never skip orientation. Ever.

---

## Principle 2: Minimal Change

Every line of code must be justified. Ask yourself:
- Is this the simplest solution that works?
- Am I adding complexity for undefined future needs?
- Can I achieve this by modifying existing code instead?

Start simple. Add complexity only when proven necessary.

---

## Principle 3: Follow Existing Patterns

Before writing code:
1. Check neighboring files for style and patterns
2. Examine imports to understand framework choices
3. Use the exact same patterns already in the codebase
4. Never assume a library exists - verify in package.json

Your code should be indistinguishable from existing code.

---

## Principle 4: Verify Everything

After EVERY change:
1. Find and run: `pnpm lint` (check package.json for exact command)
2. Find and run: `pnpm typecheck` or `pnpm tsc`
3. Run tests if they exist (check package.json scripts first)
4. Verify the functionality actually works
5. If commands unknown, ASK user for them

Never move to the next task until current one is verified working.

---

## Principle 5: Concise Communication

- Maximum 4 lines per response (excluding code/tools)
- No preambles like "I'll help you with..."
- No summaries unless requested
- Answer directly, implement silently

Examples:
- User: "Add a button" → You: [adds button] "Added."
- User: "What's 2+2?" → You: "4"

---

## Principle 6: Question and Clarify

You're not a yes-machine. When you see:
- Multiple valid approaches → Present options with tradeoffs
- Potential issues → Point them out
- Missing context → Ask for it
- Architectural implications → Discuss them

Think critically. Question assumptions. Provide expertise.

---

## Principle 7: Respect Architectural Boundaries

NEVER import server-side code in client components:
- Files with "use client" directive = frontend only
- No repository imports in client files
- No database entities in client files
- Check imports before adding any dependencies
- API routes don't use sessions directly - get user context from middleware headers

Your code must respect the client/server boundary.

---

## Development Commands

- Development server: `pnpm dev` (uses Turbopack) - we have this server running all the time for preview
- Production build: `pnpm build` (uses Turbopack)
- Start production server: `pnpm start`
- Package manager: This project uses `pnpm`

---

## Project Overview

GenAI Cracow Email Marketing Tool - A Next.js 15 application for community email marketing with subscriber management, campaign creation, automated sending, and analytics tracking.

## Architecture & Tech Stack

### Frontend
- Framework: **Next.js 15** with App Router and **Turbopack**
- React: **19.1.0** with React DOM 19.1.0
- Styling: **Tailwind CSS v4** with CSS variables
- UI Components: **shadcn/ui** (New York style) with **Radix UI** primitives
- Icons: **Lucide React**
- State Management: **Zustand** + **TanStack Query v5**
- Forms: **React Hook Form** + **Zod** validation

### Backend & Data
- Database: **PostgreSQL** with **TypeORM**
- Authentication: POC stage - no auth system yet
- Email Service: **AWS SES** integration with **React Email** components
- Environment: **Zod** validation in `lib/env-validation.ts`

### UI Component System
- Style: New York variant of **shadcn/ui**
- Base color: Slate
- Component location: `@/components/ui/`
- Utils location: `@/lib/utils`
- CSS Variables: Enabled for theming

## Key Features (Based on Specification)

### Core User Flows
1. **Subscriber Management** (`/admin/subscribers`)
   - Table view with search, bulk actions, CSV import/export
   - Add single subscriber modal with duplicate detection
   - Tag management and subscriber filtering

2. **Campaign Creation** (`/admin/campaigns`)
   - Multi-step campaign builder: Details → Recipients → Content → Review
   - WYSIWYG/Markdown editor with templates
   - Test email sending and scheduling

3. **Sending & Queue Management**
   - Batch processing with rate limiting
   - Daily quota tracking
   - SMTP integration with delivery logging

4. **Campaign Analytics** (`/admin/campaigns/[id]`)
   - Open/click tracking with pixel and redirect URLs
   - Engagement metrics and timeline charts
   - Export capabilities for engagement data

5. **Dashboard Overview** (`/admin`)
   - Quick stats, recent activity feed
   - System status and quota monitoring

6. **Public Pages**
   - Unsubscribe page (`/unsubscribe/[token]`)
   - Email tracking endpoints (`/track/open/`, `/track/click/`)

## Project Structure

```text
app/                     # Next.js App Router pages & API routes
├── api/                 # API route handlers
├── admin/               # Admin panel pages
├── track/               # Email tracking endpoints
├── unsubscribe/         # Public unsubscribe pages
components/              # React components
├── ui/                  # shadcn/ui components
├── email/               # React Email template components
lib/                    # Utilities and configuration
├── env-validation.ts    # Environment validation
├── backend-config.ts    # Database configuration
├── aws-ses.ts           # AWS SES client configuration
├── utils.ts             # Utility functions
providers/              # App providers (TanStack Query, etc.)
```

## URL Structure

### Admin Routes (POC - No Auth)
- `/admin` - Main dashboard
- `/admin/subscribers` - Subscriber management
- `/admin/campaigns` - Campaign list and creation
- `/admin/campaigns/[id]` - Campaign analytics
- `/admin/settings` - AWS SES and system configuration

### Public Routes
- `/` - Landing page
- `/unsubscribe/[token]` - Unsubscribe page

### API Routes
- `/api/v1/subscribers` - Subscriber CRUD operations
- `/api/v1/campaigns` - Campaign management
- `/api/v1/email/send` - Email sending queue
- `/track/open/[campaignId]/[subscriberId]` - Open tracking
- `/track/click/[linkId]/[subscriberId]` - Click tracking

## Environment Configuration

The application uses comprehensive environment validation via `lib/env-validation.ts`:

Required Variables:
- **PostgreSQL**: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **AWS SES**: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Admin: `ADMIN_EMAIL_1`, `ADMIN_EMAIL_2`

Optional Variables:
- `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY` - For AI spam testing features
- `POSTGRES_SSL` - SSL configuration
- `AWS_SESSION_TOKEN` - For temporary AWS credentials

## Development Rules & Conventions

### Critical Development Practices
- **MANDATORY REFLECTION**: Always start with analysis and reasoning before any code implementation
- **MANDATORY TODO LISTS**: Use TodoWrite tool for any non-trivial task (3+ steps)
- **NEVER ASSUME**: Always ask for clarification when requests are ambiguous
- **COMPLETION VERIFICATION**: Only mark tasks completed when code has been written/modified successfully

### State Management
- **TanStack Query v5** for server state and caching
- **Zustand** for UI states (avoid prop drilling)
- Form management with **react-hook-form** and **Zod** validation

### Component Organization
- UI components follow **shadcn/ui** patterns
- Email templates in `components/email/`
- Admin components in `components/admin/`
- Shared utilities in `lib/`

### Database Schema Considerations
Core Entities (Based on Specification):
- `subscribers` - Email, name, status, tags, subscription date
- `campaigns` - Name, subject, content, status, send date
- `campaign_sends` - Individual send records with tracking
- `email_events` - Opens, clicks, bounces, unsubscribes
- `settings` - SMTP configuration, daily limits

### TypeScript Conventions
- Prefer Types over Interfaces: Use types for data structures
- File Organization:
  - Pure constants: `lib/constants.ts`
  - Types: `types/` directory
  - Validation schemas: **Zod** schemas co-located with usage

### API Route Pattern (POC Stage)

API routes are currently open (no authentication):
```typescript
// app/api/v1/route.ts
export async function GET(request: Request) {
  // POC: No authentication required
  // Future: Add authentication middleware
  // Process request directly
}
```

### Form Development Pattern
- Use **React Hook Form** with **Zod** validation through **shadcn/ui** `<Form />` components
- Schema-first design: Define **Zod** schemas before components
- Validation modes: `onChange` for immediate feedback, `onSubmit` for performance
- CSV upload handling with drag & drop support

### Styling Guidelines
- Use **shadcn/ui** CLI to add components: `pnpm dlx shadcn@latest add [component]`
- **ALWAYS use shadcn/ui color tokens** from `app/globals.css` instead of hardcoded colors:
  - `bg-background`, `text-foreground` (main background/text)
  - `bg-card`, `text-card-foreground` (card backgrounds)
  - `bg-primary`, `text-primary-foreground` (primary actions)
  - `bg-secondary`, `text-secondary-foreground` (secondary actions)
  - `bg-muted`, `text-muted-foreground` (muted content)
  - `border` (consistent borders)
- **NEVER use hardcoded colors** like `bg-blue-600`, `text-gray-300` - always use semantic color tokens
- Responsive design with Tailwind variants (`sm:`, `md:`, `lg:`)
- Component extraction for repeated UI patterns
- Skeleton components match actual content layout

### Email Marketing Specific Patterns

Campaign Management Components:
- Multi-step campaign creation
- Template selection and editing
- Recipient selection (tags, custom lists)
- Preview generation (desktop/mobile)
- Test email sending

Subscriber Management Components:
- Bulk operations (import, export, delete)
- Tag management
- Duplicate detection
- Search and filtering

Analytics & Tracking Implementation:
- 1x1 pixel for opens `/track/open/[campaignId]/[subscriberId]`
- Redirect URLs for clicks `/track/click/[linkId]/[subscriberId]`
- Bounce handling via SMTP webhooks
- Unsubscribe token validation

### AWS SES Integration Guidelines
- Email Components: Use **React Email** (@react-email/components) for template creation
- AWS SES Client: Use **@aws-sdk/client-ses** for email sending
- Rate Limiting: Respect **AWS SES** sending quotas and rates
- Template Management: **React Email** components in `components/email/`
- Delivery Tracking: **AWS SES** bounce/complaint notifications
- Future AI Integration: Spam testing using **OpenAI/Google AI** before sending

### React Email Integration
- Components: Create email templates using **React Email** components
- Development: Use **React Email CLI** for template development and testing
- Rendering: Convert React components to HTML for **AWS SES**
- Styling: Inline CSS support for email clients

## Final Reminder

**Speed doesn't matter. Getting it right does.**

Taking 10 minutes to understand prevents 3 hours of debugging.
Writing 50 lines correctly beats 500 lines of fixes.
One verified solution beats five attempts.

Slow down. Think. Verify. Succeed.