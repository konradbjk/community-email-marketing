# User Profile Data Model

This document explains how user identity and profile preferences are stored today, and outlines the planned migration away from the legacy `users` table in favour of Auth.js identities.

---

## Current State

### Authentication
- **Provider**: Auth.js v5 (NextAuth) using a credentials provider for the POC.
- **Session payload**: The middleware injects Merck identity info into request headers (`x-user-merck-id`, `x-user-name`, `x-user-surname`, `x-user-email`, optional `x-user-image`).
- No user rows are created automatically; the seed data under `postgres-init.sql` pre-populates the tables.

### Database Tables

| Table | Purpose | Key columns |
| --- | --- | --- |
| `users` | Immutable IDP metadata (legacy) | `id` (UUID PK), `merck_id`, `name`, `surname`, `email`, `image` |
| `user_profiles` | Editable preferences | `id` (UUID PK), `user_id` (FK → `users.id`), `role`, `department`, `region`, `role_description`, `ai_response_style_id`, `custom_response_style`, `custom_instructions` |

- `user_profiles.user_id` uses the internal UUID, not the `merck_id`.
- Conversations reference `users.id` (`conversations.user_id`), allowing ORM joins to pull profile data alongside each conversation/message.

### Access Patterns
- `GET /api/profile` / `PATCH /api/profile` fetch and update preferences by first looking up `users.merck_id = header.merck_id`, then joining the profile.
- Message endpoints (`/api/conversations/.../messages`) load `conversation.user` + `user.profile` to populate the Python backend’s user context (name/role/department).

---

## Motivation to Retire `users` Table

- Auth.js already maintains the canonical identity (`session.user.id`), making the duplicated `users` table unnecessary once we move beyond the seed-only POC.
- Keeping a shadow `users` table requires additional sync logic when switching authentication providers (e.g., Keycloak).
- The Merck-specific columns (`merck_id`, etc.) can live as read-only attributes in Auth.js session tokens or as part of the profile/preferences record.

---

## Target Direction

| Goal | Notes |
| --- | --- |
| 1. **Keep Auth.js as the single source of truth** | Stop creating/updating rows in an app-managed `users` table. |
| 2. **Retain editable preferences** | Continue storing UI preferences in `user_profiles`, keyed by Auth.js user ID. |
| 3. **Preserve Merck metadata** | Store immutable Merck fields either in the Auth.js session or as columns on the profile table (read-only). |

### Proposed Schema Adjustments

1. **Add Auth.js user identifier to `user_profiles`**
   - e.g., `auth_user_id TEXT UNIQUE NOT NULL`.
   - Populate from `session.user.id` on profile access/update.
2. **Add Merck fields (if still required)**
   - `merck_id`, `email`, `name`, `surname`, `image` as read-only columns on `user_profiles`, mirroring the Auth.js session.
3. **Update foreign keys**
   - Conversations, projects, prompts currently rely on `users.id`.
   - Replace `conversations.user_id` et al. with `user_profiles.auth_user_id` (or a new lightweight identity table) to remove the PK dependency on `users`.
4. **Migrate existing seed data**
   - For now, `postgres-init.sql` should populate `auth_user_id` with stable values (e.g., `authjs|alex.johnson`).
   - Backfill existing rows before removing the FK.

### API & Code Changes

- **Profile API**: Resolve profile by Auth.js user ID instead of `merck_id`. Use `upsert` semantics if a profile record doesn’t exist yet.
- **Message/Conversation endpoints**: Load the profile via the new identifier and stop referencing `conversation.user`.
- **Middleware**: Continue attaching Merck headers for system context, but treat them as optional extras.

---

## Migration Plan (High-Level)

1. Introduce the new `auth_user_id` column on `user_profiles`; backfill from seeded users and add an index/unique constraint.
2. Update resolvers to use `auth_user_id` first, falling back to the legacy join.
3. Migrate conversation/project foreign keys to the new identity reference.
4. Remove dependencies on `users` (code + schema); delete table once no rows need it.
5. Adjust seed scripts to create only `user_profiles` (no `users` entries).

Track progress in a dedicated issue/epic so application code, seeds, and docs stay aligned.

---

## Reference

- `docs/authentication.md` – Auth.js setup and session structure.
- `app/api/profile/route.ts` – Current profile API that still relies on the `users` table.
- `postgres-init.sql` – Seed data illustrating the legacy UUID-based linkage.

When implementing the migration, update the references above and this document to reflect the new schema and APIs.
