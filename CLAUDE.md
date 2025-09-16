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

Internal chatbot application for Merck that enables multi-turn conversations with an agentic system. Features include chat interface with sidebar conversations, voice/image/file input composer, contextual conversation memory, project-based custom instructions, and a comprehensive prompt library system.

## Architecture & Tech Stack

### Frontend
- Framework: **Next.js 15** with App Router and **Turbopack**
- React: **19**
- Styling: **Tailwind CSS v4** with CSS variables
- UI Components: **shadcn/ui** (New York style) with **Radix UI** primitives
- Icons: **Lucide React**
- State Management: **Zustand** + **TanStack Query v5**
- Forms: **React Hook Form** + **Zod** validation

### Backend & Data
- Database: **PostgreSQL** with **TypeORM**
- Authentication: POC stage - no auth system yet
- Environment: **Zod** validation in `lib/env-validation.ts`

### UI Component System
- Style: New York variant of **shadcn/ui**
- Base color: Slate
- Component location: `@/components/ui/`
- Utils location: `@/lib/utils`
- CSS Variables: Enabled for theming

## Key Features (Based on Specification)

### Core User Flows
1. **Chat Interface**
   - Left sidebar with conversation list and actions (minimizable)
   - Right side chat window: message list (top) + composer (bottom)
   - Multi-modal input: voice transcription, image upload, file attachments
   - Chronological message ordering with latest at bottom

2. **Multi-turn Dialogue Support**
   - Create, remove, or archive conversations
   - Modifiable conversation titles
   - Archived conversations searchable but not in default list
   - Double opt-in deletion with confirmation modal

3. **Contextual Conversation Memory**
   - User profile-based question influence
   - Project-based custom instructions and documents
   - Response style selection (Normal, Concise, Learning, Formal)
   - Custom instructions for Normal mode

4. **Conversation Sharing** (Future)
   - Share conversations with other users
   - View tool results (URLs searched, Snowflake data)
   - Three sharing modes: collaborative, fork-on-response, view-only

5. **Feedback Tracking**
   - Thumbs up/down on AI responses
   - Category selection (UI Bug, Poor understanding, etc.)
   - Optional detailed text feedback
   - Integration with Langfuse annotation queue

6. **Prompt Library System**
   - Suggestion prompts (short templates for expansion)
   - Final prompts (complete, curated prompts)
   - Personal prompt creation and forking
   - Company-wide prompt sharing with approval process

## Project Structure

```text
app/                     # Next.js App Router pages & API routes
├── api/                 # API route handlers
├── chat/                # Chat interface pages
├── projects/            # Project management pages
├── prompts/             # Prompt library pages
components/              # React components
├── ui/                  # shadcn/ui components
├── chat/                # Chat interface components
├── prompts/             # Prompt library components
lib/                    # Utilities and configuration
├── env-validation.ts    # Environment validation
├── backend-config.ts    # Database configuration
├── ai-providers.ts      # AI provider configurations
├── utils.ts             # Utility functions
providers/              # App providers (TanStack Query, etc.)
hooks/                  # Custom React hooks
types/                  # TypeScript type definitions
```

## URL Structure

### Main Routes (POC - No Auth)
- `/` - Chat interface (main application)
- `/chat/[conversationId]` - Specific conversation view
- `/projects` - Project management dashboard
- `/projects/[projectId]` - Project detail and conversations
- `/prompts` - Prompt library browser
- `/prompts/[promptId]` - Prompt detail and usage

### API Routes
- `/api/v1/conversations` - Conversation CRUD operations
- `/api/v1/messages` - Message handling and AI responses
- `/api/v1/projects` - Project management
- `/api/v1/prompts` - Prompt library operations
- `/api/v1/feedback` - User feedback collection
- `/api/v1/upload` - File upload handling
- `/api/v1/transcribe` - Voice transcription

## Environment Configuration

The application uses comprehensive environment validation via `lib/env-validation.ts`:

Required Variables:
- **PostgreSQL**: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Backend API**: `BACKEND_API_URL`, `BACKEND_API_KEY` (for custom AI backend integration)
- **Transcription**: `UPTIMIZE_TRANSCRIBE_ENDPOINT`, `UPTIMIZE_API_KEY`

Optional Variables:
- `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` - For prompt library and feedback tracking
- `POSTGRES_SSL` - SSL configuration
- `SNOWFLAKE_*` - For Snowflake data integration (future)

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
- Chat components in `components/chat/`
- Prompt library components in `components/prompts/`
- Shared utilities in `lib/`

### Database Schema Considerations
Core Entities (Based on Specification):
- `users` - User profile, preferences, response style settings
- `conversations` - Title, status (active/archived), creation/modification dates
- `messages` - Content, role (human/ai), attachments, feedback, conversation relation
- `projects` - Name, custom instructions, documents, user relation
- `project_conversations` - Many-to-many relation between projects and conversations
- `prompts` - Personal and shared prompts, forked relationships
- `feedback` - User feedback on AI responses with categories and details

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
- File upload handling with drag & drop support for attachments

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

### Chat Interface Specific Patterns

Message Components:
- Human/AI message distinction with role-based styling
- Multi-modal message rendering (text, images, files)
- Timestamp and status indicators
- Feedback buttons (thumbs up/down) on AI messages

Composer Components:
- Auto-growing text input with rich formatting
- File drag & drop attachment handling
- Voice recording and transcription integration
- Send button states and loading indicators

Conversation Management:
- Sidebar conversation list with search/filter
- Archive/delete operations with confirmations
- Title editing with inline input
- Status indicators (active, archived)

### Backend Integration Guidelines
- **Custom AI Backend**: HTTP client for backend API communication
- **Request/Response**: Structured API calls with proper error handling
- **Streaming**: Real-time message streaming for AI responses
- **File Handling**: Upload management for attachments and project documents
- **Feedback Integration**: Langfuse API integration for user feedback tracking

### Multi-modal Input Integration
- **Voice Transcription**: Uptimize endpoint integration for audio processing
- **File Processing**: Support for images, documents, and other attachments
- **Combined Inputs**: Single message composition with multiple input types
- **Preview Generation**: Attachment previews before sending

## Final Reminder

**Speed doesn't matter. Getting it right does.**

Taking 10 minutes to understand prevents 3 hours of debugging.
Writing 50 lines correctly beats 500 lines of fixes.
One verified solution beats five attempts.

Slow down. Think. Verify. Succeed.