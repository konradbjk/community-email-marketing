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

4. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Project Structure

```
app/                     # Next.js App Router
├── admin/               # Admin panel pages
├── api/                 # API routes
├── track/               # Email tracking endpoints
└── unsubscribe/         # Public unsubscribe pages

components/              # React components
├── ui/                  # shadcn/ui components
└── email/               # React Email templates

lib/                     # Utilities and configuration
├── env-validation.ts    # Environment validation
├── backend-config.ts    # Database configuration
└── utils.ts            # Utility functions

docs/                    # Documentation
└── specification.md     # Product requirements
```

## Environment Variables

Required variables:
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `ADMIN_EMAIL_1`, `ADMIN_EMAIL_2`

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
