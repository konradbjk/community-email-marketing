# GenAI Cracow Email Marketing Tool

A modern email marketing platform built for the GenAI Cracow community. This application enables event organizers to manage subscribers, create campaigns, send emails via AWS SES, and track engagement analytics.

## Features

- **Subscriber Management**: Import/export CSV, tag management, duplicate detection
- **Campaign Creation**: Multi-step campaign builder with React Email templates
- **Email Delivery**: AWS SES integration with rate limiting and batch processing
- **Analytics & Tracking**: Open/click tracking, engagement metrics, bounce handling
- **Responsive Design**: Mobile-friendly admin interface with dark/light mode support

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: TypeORM with PostgreSQL
- **Email Service**: AWS SES with React Email templates
- **State Management**: TanStack Query v5 + Zustand
- **Forms & Validation**: React Hook Form + Zod
- **Development**: TypeScript, Turbopack, pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)
- PostgreSQL database
- AWS SES account and credentials

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd community-email-marketing
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the PostgreSQL database
```bash
docker-compose up -d
```

5. Seed the database

**Required**: Seed reference data (response styles)
```bash
pnpm seed
```

**Development only**: Seed demo user and sample data
```bash
pnpm seed:dev
```

6. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm seed` - Seed reference data (response styles)
- `pnpm seed:dev` - Seed reference + development data (demo user, projects, conversations)

## Project Structure

```
app/                     # Next.js App Router
├── api/                 # API routes
├── chat/                # Chat interface pages
├── projects/            # Project management pages
└── prompts/             # Prompt library pages

components/              # React components
├── ui/                  # shadcn/ui components
├── chat/                # Chat interface components
└── prompts/             # Prompt library components

database/                # Database layer
├── entities/            # TypeORM entities
├── data-source.ts       # Database connection config
├── schema/              # Pure SQL schema
│   └── init.sql
├── seeds/               # Seed data (TypeORM-based)
│   ├── reference-data.ts
│   └── development.ts
└── scripts/
    └── seed.ts          # Seed runner script

lib/                     # Utilities and configuration
├── env-validation.ts    # Environment validation
└── utils.ts             # Utility functions

docs/                    # Documentation
└── specification.md     # Product requirements
```

## Database Setup

The application uses PostgreSQL with TypeORM. Database initialization follows a clean separation:

1. **Schema** (`database/schema/init.sql`): Pure DDL - table definitions, indexes, constraints
2. **Reference Data** (`database/seeds/reference-data.ts`): Required system data (response styles)
3. **Development Data** (`database/seeds/development.ts`): Demo user, projects, conversations (dev only)

### First-time Setup

```bash
# Start PostgreSQL container
docker-compose up -d

# Seed reference data (required for all environments)
pnpm seed

# Seed development data (optional, for local development)
pnpm seed:dev
```

**Note**: Users are created dynamically on first login via Auth.js/SSO. The users table exists but starts empty in production.

## Environment Variables

Required variables:
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `AUTH_SECRET` - Auth.js secret key for JWT signing
- `BACKEND_API_URL`, `BACKEND_API_KEY` - Custom AI backend integration
- `UPTIMIZE_TRANSCRIBE_ENDPOINT`, `UPTIMIZE_API_KEY` - Voice transcription

See `lib/env-validation.ts` for complete environment configuration.

## Development Status

This is a POC (Proof of Concept) version. Current features:
- ✅ Basic project structure
- 🚧 Subscriber management (in development)
- 🚧 Campaign creation (in development)
- 🚧 AWS SES integration (in development)
- 🚧 Email tracking (in development)

## Contributing

See `CLAUDE.md` for development guidelines and coding conventions.
