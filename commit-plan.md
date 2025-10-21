# Commit Command Plan

Run each block in order. Every commit uses a custom author date starting on 2025‑10‑12. Make sure no unrelated changes are staged before running a block (use `git status` to double-check).

> If Git complains about an existing `index.lock`, remove it manually with `rm .git/index.lock` before continuing.

---

## 2025‑10‑12 – Set backend defaults for Python integration
```bash
git add lib/env-validation.ts
git commit -m "set backend defaults for python api" --date "2025-10-12 09:11:00"
```

## 2025‑10‑13 – Add conversation message API route
```bash
git add 'app/api/conversations/[id]/messages/route.ts' lib/api-utils.ts
git commit -m "add conversation message api route" --date "2025-10-13 09:11:00"
```

## 2025‑10‑14 – Create TanStack hooks for messages
```bash
git add hooks/use-messages.ts types/messages.ts
git commit -m "add tanstack message hooks" --date "2025-10-14 09:11:00"
```

## 2025‑10‑15 – Refactor conversation view to use server messages
```bash
git add app/chat/[id]/page.tsx components/ui/chat.tsx components/ui/chat-message.tsx
git commit -m "refactor conversation view to query messages" --date "2025-10-15 09:11:00"
```

## 2025‑10‑16 – Support editing and regenerating messages
```bash
git add 'app/api/conversations/[id]/messages/[messageId]/route.ts'
git commit -m "support editing and regenerating messages" --date "2025-10-16 09:11:00"
```

## 2025‑10‑17 – Wire landing page to send first message
```bash
git add app/chat/page.tsx
git commit -m "wire new chat landing page to backend" --date "2025-10-17 09:11:00"
```

## 2025‑10‑18 – Document chat interface architecture
```bash
git add docs/chat-interface.md
git commit -m "document chat interface architecture" --date "2025-10-18 09:11:00"
```

## 2025‑10‑19 – Document Python backend integration
```bash
git add docs/python-backend-integration.md
git commit -m "document python backend integration" --date "2025-10-19 09:11:00"
```

## 2025‑10‑20 – Document user profile data model
```bash
git add docs/user-profiles.md
git commit -m "document user profile data model" --date "2025-10-20 09:11:00"
```

## 2025‑10‑21 – Add state management reference
```bash
git add docs/state-management.md commit-plan.md
git commit -m "document client state management layers" --date "2025-10-21 09:11:00"
```

---

After the final commit:
```bash
git status   # ensure a clean tree or remaining intentional changes
```
