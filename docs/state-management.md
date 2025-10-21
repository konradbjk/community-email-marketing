# State Management Reference

This guide summarizes how client and server state are organized in the chat application. It clarifies which concerns are handled by Zustand, TanStack Query, or persisted through the database/API.

---

## Overview

| Layer | Purpose | Examples |
| --- | --- | --- |
| **Zustand (`stores/chat-store.ts`)** | UI-focused, ephemeral state shared across components. | Active conversation ID, shared input buffer, loading flags. |
| **TanStack Query (`hooks/use-*.ts`)** | Server state (data fetched from API routes) with caching, optimistic updates, and mutations. | Conversation list, individual conversation details, message history, send/edit mutations. |
| **Database (PostgreSQL)** | Source of truth for conversations, messages, and user preferences. | Tables `conversations`, `messages`, `user_profiles`, etc. |

Zustand never mirrors the database; it only coordinates UI behaviour. TanStack Query talks to the Next.js API routes, which in turn persist data via TypeORM.

---

## Zustand State

Defined in `stores/chat-store.ts` and consumed through `hooks/use-chat.ts`.

| Key | Description |
| --- | --- |
| `activeConversationId` | Currently selected conversation across `/chat` and `/chat/[id]`. |
| `input` | Shared message composer value (used on the landing page and conversation view). |
| `isGenerating` / `setIsGenerating` | Landing-page UX flag for the initial “create + send” flow. |
| `isLoading` | Reserved flag for UI skeletons/spinners. |
| Actions | `setActiveConversation`, `setInput`, `clearInput`, `setIsGenerating`, `setIsLoading`, `resetChatUi`. |

Use cases:
- Switching the active conversation from the sidebar.
- Clearing the composer after send or edit cancel.
- Showing the “generating” state while `/chat` kicks off a new conversation.

Avoid storing server data (messages, conversation objects) in Zustand; those should come from TanStack Query to stay consistent with persistence.

---

## TanStack Query

Located in `hooks/use-conversations.ts`, `hooks/use-messages.ts`, `hooks/use-profile.ts`, etc.

### Queries
| Hook | Endpoint | Notes |
| --- | --- | --- |
| `useConversations(filters?)` | `GET /api/conversations` | Returns lightweight list (title, last message preview). |
| `useConversation(id)` | `GET /api/conversations/[id]` | Includes message array used to hydrate initial view. |
| `useMessages(conversationId)` | `GET /api/conversations/[id]` (same endpoint) | Normalizes into `types/messages.ts` and caches under `['messages', id]`. |
| `useProfile()` | `GET /api/profile` | Merges immutable auth data with editable preferences. |

### Mutations
| Hook | Endpoint | Behaviour |
| --- | --- | --- |
| `useCreateConversation` | `POST /api/conversations` | Invalidates conversation list on success. |
| `useSendMessage` | `POST /api/conversations/[id]/messages` | Optimistic user message, replaces with persisted user/assistant response, appends error bubble when backend fails. |
| `useUpdateMessage` | `PATCH /api/conversations/[id]/messages/[messageId]` | Updates edited message in cache, optionally appends regenerated assistant message, cleans up stale error bubbles. |
| `useUpdateConversation` | `PATCH /api/conversations/[id]` | Used for archive/star/title actions. |

TanStack Query is responsible for:
- Cache invalidation (e.g., refreshing conversation list when new messages arrive).
- Rolling back optimistic updates on transport errors.
- Driving loading states in the UI (`isLoading`, `isPending`, etc.).

---

## Interaction Between Layers (Examples)

1. **Selecting a conversation from the sidebar**  
   - Sidebar click → `setActiveConversation(id)` (Zustand) → `router.push('/chat/id')`.  
   - `useChatMessages(id)` fetches messages via TanStack Query, showing skeletons while loading.

2. **Sending a message in `/chat/[id]`**  
   - Composer sends via `useSendMessage`.  
   - Optimistic message appended in TanStack cache; upon success, replaced with persisted entries.  
   - Zustand’s shared `input` is cleared; no other state is touched.

3. **Starting a new conversation from `/chat`**  
   - `startConversation` uses `createConversationMutation.mutateAsync` (TanStack).  
   - While request is in flight, `setIsGenerating(true)` (Zustand) toggles the button state.  
   - On success, `setActiveConversation(id)` (Zustand) and `router.push('/chat/id')`.  
   - `/chat/[id]` then hydrates via TanStack Query.

4. **Editing a message**  
   - Edit button toggles a banner by setting local React state and writes the edited content back into the shared `input` (Zustand).  
   - `useUpdateMessage` updates server state and caches; when `isUpdatingMessage` is true, the composer shows a combined pending state (`isGenerating || isUpdatingMessage`).

---

## Guidelines

- **Keep Zustand lean**: only track cross-component UI flags. If the state should survive a page reload or is derived from the database, it belongs in TanStack Query.
- **Normalize data in queries**: `useMessages` converts API responses into `types/messages.ts` so components can rely on a consistent shape.
- **Use mutation callbacks** (`onMutate`, `onSuccess`, `onError`) to keep the UI snappy.
- **Leverage query invalidation** for derived UI (e.g., conversation list last-message preview).
- **Treat the server as source of truth**: Always reflect the backend response in TanStack caches even after optimistic updates.

---

## References

- Zustand store: `stores/chat-store.ts`, hooks in `hooks/use-chat.ts`.
- Message queries/mutations: `hooks/use-messages.ts`.
- Conversation queries/mutations: `hooks/use-conversations.ts`.
- Profile queries/mutations: `hooks/use-profile.ts`.

See `docs/chat-interface.md` and `docs/python-backend-integration.md` for complementary architectural details.
