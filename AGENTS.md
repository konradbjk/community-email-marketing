# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts App Router routes (chat, projects, prompts, API); add `use client` at feature entrypoints that render on the client.
- `components/` holds reusable UI—shadcn primitives under `components/ui`, feature widgets under `components/chat`, `components/prompts`, etc.
- `database/` stores TypeORM entities, schema, and `database/scripts/seed.ts`; follow `.roo/rules-typeorm/*.md` for edits.
- Shared helpers live in `lib/`, providers in `providers/`, stores in `stores/` per `.roo/rules-zustand/*.md`, constants in `consts/`; `docs/` and `public/` cover specs and static assets.

## Build, Seed & Runtime Commands
- `pnpm dev` starts the Turbopack dev server.
- `pnpm build` compiles production output; `pnpm start` serves it.
- `pnpm seed` restores reference data; rerun after schema tweaks.
- `pnpm seed:dev` adds demo users and projects for local QA.
- `docker-compose up -d` launches PostgreSQL via `postgres.env`; keep it running before seeding.

## Coding Style & Naming Conventions
- TypeScript + React 19; keep shared hooks in `hooks/`.
- Match repo Prettier output: two-space indent, single quotes, trailing commas where valid.
- PascalCase components, camelCase helpers, SCREAMING_SNAKE_CASE constants.
- Keep Tailwind classes inline and global tokens in `app/globals.css`.
- Respect client/server boundaries; never import database modules into client-marked files.

## Testing Guidelines
- No automated suite; perform focused manual QA before merging.
- Cover chat, project, and prompt journeys; document scenarios in the PR.
- Add unit tests only where logic is isolated and tooling agreed.
- When a runner lands, expose it via `package.json` scripts and update this section.

## Commit & PR Workflow
- Prefer short, imperative commit messages (`update seeds`, `fix auth middleware`) per change.
- Rebase before pushing; confirm `pnpm build` and needed seed scripts succeed locally.
- PRs need a summary, testing notes, linked issue or ticket, and screenshots or GIFs for UI updates.
- Highlight schema updates with TypeORM or SQL diffs and coordinate with backend reviewers.
- Never commit `.env*`, `postgres.env`, or temporary debug artifacts.

## Security & Environment
- Store secrets in `.env.local`; `lib/env-validation.ts` catches misconfigurations.
- Keep Auth.js callbacks in `auth.ts` aligned with route protection in `middleware.ts`.
- Scrub real data from `database/seeds/development.ts` before sharing sample content.

## Process Playbooks
- Consult `.roo/rules-typeorm/` for repository, service, and migration expectations.
- Use `.roo/rules-zustand/` for store shape, slicing, and persistence patterns.
- Follow `.roo/rules-tanstack-query/` (01-overview.md→09-mutations.md): keep the types→lib→queries→hooks→UI flow, centralize keys/options in `/queries`, expose client hooks in `/hooks`, and reuse key factories for cache updates.
