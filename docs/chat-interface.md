# Chat Interface Architecture

This document captures the current implementation of the chat experience, covering routing, state management, message flow, backend integration, and known limitations. It supersedes the previous implementation plan.

---

## Feature Summary

- **Claude‑style layout** featuring a collapsible sidebar, grouped conversation list, starred items, quick navigation, and a main chat panel.
- **Landing page (`/chat`)** with suggestions and a single input that creates a conversation and sends the first message in one step.
- **Conversation view (`/chat/[id]`)** that streams messages through TanStack Query, supports retrying failed assistant responses, and lets users edit and resend their own messages.
- **Global state via Zustand** for lightweight UI concerns (active conversation, shared input, loading flags).
- **Server state via TanStack Query** for conversations, individual conversation details, message history, and send/update mutations.
- **Python backend orchestration** through Next.js API routes that persist messages, build user context, and forward history with a consistent system primer.

---

## Routing & Layout

| Route | Description |
| --- | --- |
| `/chat` | Landing page. Allows starting a brand new conversation and provides prompt suggestions. |
| `/chat/[id]` | Conversation detail. Displays sidebar, message history, retry/edit actions, and message composer. |

`components/chat/chat-layout.tsx` renders the shared sidebar + content shell used by both routes.

---

## State Management

### Zustand (`stores/chat-store.ts`)
- Tracks `activeConversationId`, the shared input buffer, and UI flags (`isGenerating`, `isLoading`).
- Exposed through hooks in `hooks/use-chat.ts`, e.g., `useInput`, `useSetActiveConversation`.

### TanStack Query (`hooks/use-conversations.ts`, `hooks/use-messages.ts`)
- `useConversations` / `useConversation` fetch lists and individual conversations.
- `useChatMessages` wraps:
  - `useMessages` query (GET `/api/conversations/[id]`).
  - `useSendMessage` mutation (POST `/api/conversations/[id]/messages`).
  - `useUpdateMessage` mutation (PATCH `/api/conversations/[id]/messages/[messageId]`).
- Mutations provide optimistic updates, rollback on error, and append backend responses.

---

## Message Lifecycle

### Existing Conversation (`/chat/[id]`)
1. User submits via `app/chat/[id]/page.tsx`.
2. `useSendMessage` optimistically adds the user message, POSTs to `/api/conversations/[id]/messages`, and replaces the optimistic entry with persisted user/assistant messages.
3. Errors:
   - Roll back to the previous message list.
   - Show Sonner toast.
   - Inject an assistant error bubble with retry metadata.

### New Conversation (`/chat`)
1. `startConversation` (in `app/chat/page.tsx`) runs `createConversation` and, on success, immediately posts the first message to `/api/conversations/{id}/messages`.
2. Only after both steps succeed do we push to `/chat/{id}` and set the new conversation active.
3. On failure, we surface the toast and restore the input so the user can try again.

### Editing & Regenerating Messages
- Hovering a user message exposes an **Edit** action via `components/ui/chat.tsx`.
- Editing pre-fills the composer, shows a banner, and triggers `useUpdateMessage` with `regenerate: true`.
- `useUpdateMessage` updates the user message in cache, removes stale error bubbles, and inserts the (optional) regenerated assistant reply.
- Assistant messages display **Copy**, **Regenerate**, **Like**, **Dislike** actions:
  - Regenerate replays the last user message through `useUpdateMessage`.
  - Copy uses `navigator.clipboard`, with toast feedback.

---

## Backend Integration

### API Routes

| Route | Purpose |
| --- | --- |
| `POST /api/conversations/[id]/messages` | Persist user message, assemble history, call Python backend, persist assistant response. |
| `PATCH /api/conversations/[id]/messages/[messageId]` | Update a user message (edit) and optionally regenerate an assistant response. |

Both routes:
- Enforce ownership using `conversation.user_id`.
- Load the associated `user` + `profile` to build a **user context** object for the Python backend:
  ```json
  {
    "id": "m277098",
    "name": "Alex Johnson",
    "role": "Senior Marketing Manager",
    "department": "Oncology Business Unit"
  }
  ```
- Prepend a consistent system message:  
  _“You are talking with a merck employee over email campaigns data.”_
- Persist every user message before contacting Python so nothing is lost on upstream failures.
  - On errors/timeouts, the response returns `aiMessage: null` plus a friendly `error` string; the UI retains the user message and shows a retry bubble.

### Python Payload Example
```json
{
  "messages": [
    { "role": "system", "content": "You are talking with a merck employee over email campaigns data" },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "model": "gpt-4",
  "user": {
    "id": "m277098",
    "name": "Alex Johnson",
    "role": "Senior Marketing Manager",
    "department": "Oncology Business Unit"
  }
}
```

---

## Data Persistence

- `messages` table stores conversation history (`TEXT` IDs, `JSONB` tool invocations/attachments).
- `conversations` table holds titles, archive/star flags, `updated_at` timestamps.
- `users` / `user_profiles` supply Merck identity and additional metadata surfaced in the user context; ORM joins rely on the UUID FK (`user_profiles.user_id → users.id`).

---

## Error Handling & UX

- Toast notifications for API failures on send/update.
- Assistant error bubbles with inline **Regenerate** button.
- Editing banner with **Cancel edit** button to exit edit mode.
- Retry surfaces the most recent user message content; editing a specific message overrides that content before resending.
- New conversations currently reject file attachments with a “not supported yet” toast to avoid losing the initial message.

---

## Manual QA Checklist

- Start a new conversation from `/chat`, ensure the first message appears after navigation.
- Send additional messages in `/chat/[id]`, confirm persistence after reload.
- Trigger Python backend failure (stop backend) → user message remains, assistant shows retry bubble.
- Click **Regenerate** and verify new assistant response or repeated error bubble on failure.
- Edit an earlier user message, resend, and ensure the assistant reply reflects the edited content.
- Confirm archived conversations block sending, editing, and retrying.
- Resize viewport to confirm sidebar collapse, mobile navigation, and prompt suggestions.

---

## Known Limitations / Future Enhancements

- File attachments are not yet supported for new conversations or edits; UI warns and prevents submission.
- Multiple retries retain prior assistant error bubbles; future work could collapse them into a single entry.
- Conversation cleanup after a failed first message is manual; we currently leave the empty conversation for visibility.
- Like/Dislike actions are UI only (no backend persistence yet).

---

## References

- `app/chat/page.tsx` – New conversation flow.
- `app/chat/[id]/page.tsx` – Conversation detail view, edit/retry logic.
- `hooks/use-messages.ts` – Message queries and mutations.
- `app/api/conversations/[id]/messages/route.ts` – Send handler orchestration.
- `app/api/conversations/[id]/messages/[messageId]/route.ts` – Edit/regenerate handler.
- `components/ui/chat.tsx` – Action toolbar and message list wiring.
