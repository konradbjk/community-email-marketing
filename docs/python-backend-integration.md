# Python Backend Integration

This document summarizes the current contract between the Next.js chat application and the Python backend (default host: `http://localhost:8000`). It focuses on the server-side orchestration, request/response payloads, environment requirements, and failure handling. UI details and broader state management live in `docs/chat-interface.md`.

---

## High-Level Flow

1. **API entrypoint**  
   - `POST /api/conversations/[id]/messages` – send a new message.  
   - `PATCH /api/conversations/[id]/messages/[messageId]` – edit a user message and optionally regenerate the assistant reply.
2. **Persistence first** – user messages are saved to PostgreSQL before any call to Python so nothing is lost if the model is unavailable.
3. **Context assembly** – the API loads the full conversation history, prepends a system primer, and enriches the payload with user metadata (name, role, department, Merck ID).
4. **Python call** – request is forwarded to `POST {BACKEND_API_URL}/v1/chat/completions`.
5. **Response handling** – assistant messages (if present) are persisted and returned; errors are surfaced to the client while leaving the user message intact.

```
Client ─→ Next.js API ─→ DB (persist user message)
              │
              ├─→ Python backend (history + user context)
              │
              └─→ DB (persist assistant) ─→ Client
```

---

## Next.js API Endpoints

### `POST /api/conversations/[conversationId]/messages`
- Validates ownership (conversation must belong to the authenticated Merck user).
- Rejects archived conversations with `400`.
- Persists the user message (`messages` table) with generated `msg_*` ID.
- Fetches the entire conversation history (chronological).
- Calls Python and, on success, saves the assistant reply.
- Returns both messages:
  ```json
  {
    "userMessage": { "id": "msg_...", "role": "user", "content": "...", "createdAt": "..." },
    "aiMessage": { "id": "msg_...", "role": "assistant", "content": "...", "createdAt": "..." }
  }
  ```
- On failure: returns `aiMessage: null` plus an `error` string; user message stays persisted.

### `PATCH /api/conversations/[conversationId]/messages/[messageId]`
- Restricts edits to user-role messages.
- Updates the message content; when `regenerate: true` is passed:
  - Replays the full conversation (including the edited message) to Python.
  - Persists a new assistant reply (if any).
- Response mirrors the POST handler (user + optional assistant message, or `aiMessage: null` with `error`).

Both endpoints load `conversation.user` and `user.profile` so that the downstream payload includes business metadata.

---

## Payloads Sent to Python

### Request
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are talking with a merck employee over email campaigns data"
    },
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
- **System message** is always injected first; adjust text here if the guidance changes.
- **Messages array** uses the persisted transcript (oldest → newest).
- **User context** falls back to header values (`x-user-*`) and defaults to `"Unknown"` role/department if no profile exists.

### Expected Response (`ChatCompletionResponse`)
- Standard OpenAI-style body with `choices[0].message.content`.
- `tool_calls` are mapped into `tool_invocations` JSON stored alongside the assistant message.
- If the backend returns non-200 or no `content`, the API throws, catches the error, and returns `aiMessage: null`.

---

## Environment Configuration

Defined in `lib/env-validation.ts` and validated at runtime:

| Variable | Default | Description |
| --- | --- | --- |
| `BACKEND_API_URL` | `http://localhost:8000` | Python service root. |
| `BACKEND_API_TIMEOUT` | `60000` | Timeout in milliseconds (used with `AbortSignal.timeout`). |
| `BACKEND_API_MODEL` | `gpt-4` | Identifier sent in the payload’s `model` field. |

Missing/invalid values trigger a startup error thanks to Zod validation.

---

## Failure Handling & Retries

| Scenario | API Response | UI Behaviour |
| --- | --- | --- |
| Python timeout (`AbortError`) | `200 OK`, `aiMessage: null`, `error: "Request timeout"` | Optimistic message is replaced by real user message; assistant shows retry bubble. |
| Python returns non-200 | Same as above but with descriptive `error`. | |
| Conversation archived | `400`, `error: "Cannot send messages in archived conversation"` | Toast and inline banner keep the composer disabled. |
| Edit on non-user message | `400`, `error: "Only user messages can be edited"` | Toast. |

The client mutation handlers restore cached state on transport errors and keep the user-visible transcript consistent with the database.

---

## Data Considerations

- `messages` table uses TEXT IDs (e.g., `msg_<uuid>`), matching the front-end requirement for stable string identifiers.
- `user_profiles.user_id` points to the UUID primary key (`users.id`). Do not store `merck_id` in that column; otherwise the ORM join fails and role/department will fall back to `"Unknown"`.
- Attachments and tool invocations are stored as `JSONB` blobs; the current UI does not surface tool outputs yet.

---

## Operational Notes

- Logs: errors in the API routes use `console.error`. In production, route handlers should be instrumented with structured logging / telemetry.
- Network access: the integration currently assumes the Python service is reachable without auth. Add headers or tokens at the Fetch call if required.
- Testing: during manual QA, stop the Python backend to confirm retry UX, and inspect the request body with a local proxy (e.g., mitmproxy) if payload changes are needed.

---

## Future Enhancements

- Streaming responses from Python (swap to SSE or chunked fetch).
- Attachment upload pipeline (upload before POST, include URLs in payload).
- Tool invocation feedback surfaced in the UI.
- Observability (metrics around timeout rates, regeneration attempts).
