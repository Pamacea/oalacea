# Oalacea Architecture Documentation

> Enterprise portfolio, blog & platform architecture documentation

**Version:** 1.0.0
**Last Updated:** 2026-01-24

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Architecture Layers](#architecture-layers)
5. [Component Organization](#component-organization)
6. [Data Flow](#data-flow)
7. [Key Patterns & Conventions](#key-patterns--conventions)
8. [Development Guidelines](#development-guidelines)

---

## Project Overview

Oalacea is a Next.js-based enterprise platform serving as:
- **Portfolio** - Showcase of projects, skills, and experience
- **Blog** - Content management and publication
- **Enterprise Hub** - Central platform for services and information

### Core Principles

- **Type Safety** - TypeScript strict mode, Zod validation
- **Performance** - React Server Components, optimized queries
- **Maintainability** - Clean architecture, separation of concerns
- **Scalability** - Modular structure, ready for growth

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.4 | React framework with App Router |
| **Runtime** | React | 19.2.3 | UI library |
| **Language** | TypeScript | 5 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS |
| **Database** | PostgreSQL | - | Primary database |
| **ORM** | Prisma | 7.3.0 | Database toolkit |
| **State** | TanStack Query | 5.90.20 | Server state management |
| **Validation** | Zod | 4.3.6 | Schema validation |

---

## Directory Structure

```
oalacea/
├── docs/                          # Project documentation
│   └── architecture.md            # This file
│
├── prisma/                        # Database schema & migrations
│   └── schema.prisma              # Database models definition
│
├── public/                        # Static assets
│   ├── images/                    # Images (avatars, projects, blog)
│   ├── icons/                     # Custom icons
│   └── favicon.ico                # Site favicon
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (marketing)/           # Public pages
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── about/
│   │   │   ├── portfolio/
│   │   │   └── contact/
│   │   │
│   │   ├── (blog)/                # Blog section
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx       # Blog index
│   │   │   │   └── [slug]/        # Blog post pages
│   │   │   └──── admin/
│   │   │       ├── posts/
│   │   │       └── categories/
│   │   │
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   ├── blog/
│   │   │   ├── portfolio/
│   │   │   └── contact/
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── favicon.ico            # Favicon
│   │
│   ├── components/                # React components
│   │   ├── ui/                    # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── container.tsx
│   │   │
│   │   ├── blog/                  # Blog-specific components
│   │   │   ├── post-card.tsx
│   │   │   ├── post-list.tsx
│   │   │   ├── post-meta.tsx
│   │   │   └── markdown-renderer.tsx
│   │   │
│   │   ├── portfolio/             # Portfolio components
│   │   │   ├── project-card.tsx
│   │   │   ├── project-gallery.tsx
│   │   │   ├── skills-showcase.tsx
│   │   │   └── timeline.tsx
│   │   │
│   │   ├── auth/                  # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── auth-guard.tsx
│   │   │
│   │   └── shared/                # Shared feature components
│   │       ├── loading-skeleton.tsx
│   │       ├── error-boundary.tsx
│   │       └── empty-state.tsx
│   │
│   ├── core/                      # Business logic (pure functions)
│   │   ├── blog/                  # Blog business rules
│   │   │   ├── post-service.ts
│   │   │   └── post-utils.ts
│   │   ├── portfolio/             # Portfolio business rules
│   │   │   └── project-service.ts
│   │   └── auth/                  # Auth business rules
│   │       └── auth-service.ts
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── usePosts.ts            # Blog posts hook
│   │   ├── useProjects.ts         # Portfolio hook
│   │   └── useMediaQuery.ts       # Responsive utilities
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── prisma.ts              # Prisma client setup
│   │   ├── validations.ts         # Zod schemas
│   │   ├── formatters.ts          # Date, number, text formatters
│   │   ├── constants.ts           # App-wide constants
│   │   └── utils.ts               # General utilities
│   │
│   ├── services/                  # External services & side effects
│   │   ├── email.ts               # Email service
│   │   ├── storage.ts             # File storage (S3, etc.)
│   │   └── analytics.ts           # Analytics tracking
│   │
│   ├── store/                     # State management (Zustand)
│   │   ├── auth-store.ts          # Auth state
│   │   ├── ui-store.ts            # UI state (modals, themes)
│   │   └── index.ts               # Barrel export
│   │
│   ├── types/                     # TypeScript types
│   │   ├── models.ts              # Domain models
│   │   ├── api.ts                 # API request/response types
│   │   └── index.ts               # Barrel export
│   │
│   ├── config/                    # Configuration files
│   │   ├── site.ts                # Site metadata, SEO
│   │   └── navigation.ts          # Navigation structure
│   │
│   └── generated/                 # Generated files (do not edit)
│       └── prisma/                # Prisma generated client
│
├── .env.example                   # Environment variables template
├── .env.local                     # Local environment (gitignored)
├── .gitignore                     # Git ignore rules
├── next.config.ts                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies & scripts
└── README.md                      # Project overview
```

---

## Architecture Layers

### 1. Presentation Layer (`src/app/`, `src/components/`)

**Purpose:** UI rendering and user interaction

| Location | Responsibility |
|----------|----------------|
| `src/app/` | Next.js App Router pages, layouts, API routes |
| `src/components/ui/` | Atomic UI components (Shadcn) |
| `src/components/layout/` | Layout structure (header, footer) |
| `src/components/[feature]/` | Feature-specific components |

**Key Patterns:**
- **React Server Components (RSC)** by default
- **Client Components** only when interactivity needed (`"use client"`)
- **Suspense boundaries** for async operations
- **Loading skeletons** for better UX

### 2. Business Logic Layer (`src/core/`, `src/hooks/`)

**Purpose:** Pure business logic and state management

| Location | Responsibility |
|----------|----------------|
| `src/core/` | Pure functions, business rules |
| `src/hooks/` | React hooks for state & side effects |
| `src/store/` | Global state (Zustand) |

**Key Patterns:**
- Pure functions in `core/` - no side effects
- Hooks orchestrate data fetching and state
- Store for UI state (modals, themes, sidebar)
- TanStack Query for server state caching

### 3. Data Layer (`src/app/api/`, `prisma/`)

**Purpose:** Data persistence and external APIs

| Location | Responsibility |
|----------|----------------|
| `src/app/api/` | API route handlers |
| `prisma/schema.prisma` | Database schema |
| `src/lib/prisma.ts` | Database client |
| `src/services/` | External service integrations |

**Key Patterns:**
- API routes for data mutations
- Server actions for simple mutations
- Prisma for type-safe database access
- Zod for input validation

### 4. Shared/Infrastructure (`src/lib/`, `src/types/`, `src/config/`)

**Purpose:** Cross-cutting concerns

| Location | Responsibility |
|----------|----------------|
| `src/lib/` | Utilities, formatters, validations |
| `src/types/` | Shared TypeScript types |
| `src/config/` | App configuration |

---

## Component Organization

### UI Components (`src/components/ui/`)

Atomic, reusable UI components (Shadcn UI pattern).

```tsx
// Example: button.tsx
interface ButtonProps {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Characteristics:**
- No business logic
- Highly reusable
- Styled with Tailwind
- Export via `index.ts`

### Feature Components (`src/components/[feature]/`)

Domain-specific components that compose UI components.

```tsx
// Example: blog/post-card.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <Button>Read more</Button>
    </Card>
  );
}
```

**Characteristics:**
- Contain domain logic
- Use UI components as building blocks
- Feature-specific

---

## Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Page     │  │   Layout    │  │  API Route  │    │
│  │ (RSC/Client)│  │   (RSC)     │  │  (Handler)  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼───────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                      Server Layer                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Hook     │  │   Service   │  │   Prisma    │    │
│  │ (TanStack)  │  │ (Business)  │  │    (ORM)    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼───────────┘
          │                │                │
          └────────────────┴────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │    PostgreSQL    │
                    │     Database     │
                    └──────────────────┘
```

### Reading Data (GET)

1. **Server Component** → Calls service directly
2. **Client Component** → Calls hook → Uses TanStack Query → API Route → Service → Prisma

### Writing Data (POST/PUT/DELETE)

1. **Form Submission** → Server Action / API Route
2. **Validation** → Zod schema
3. **Service** → Business logic
4. **Prisma** → Database mutation
5. **Cache Invalidation** → TanStack Query re-fetch

---

## Key Patterns & Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | `PascalCase.tsx` | `UserProfile.tsx` |
| Utilities | `camelCase.ts` | `formatDate.ts` |
| Types | `PascalCase.types.ts` | `User.types.ts` |
| Hooks | `useCamelCase.ts` | `useAuth.ts` |
| Config | `camelCase.ts` | `site.config.ts` |

### Imports

```typescript
// External libraries
import { useState } from 'react';
import { Link } from 'next/link';

// Internal - use @ alias
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { prisma } from '@/lib/prisma';
```

### Barrel Exports

Every directory should have an `index.ts`:

```typescript
// src/components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';

// Usage
import { Button, Card, Input } from '@/components/ui';
```

### Component Structure

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

// 2. Types
interface Props {
  title: string;
  onSubmit: () => void;
}

// 3. Component
export function ComponentName({ title, onSubmit }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 6. Handlers
  const handleClick = () => {
    // Handler logic
  };

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Validation with Zod

```typescript
// src/lib/validations.ts
import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
  categoryId: z.string().uuid(),
});

export type PostInput = z.infer<typeof postSchema>;
```

---

## Development Guidelines

### Scripts

```bash
# Development
pnpm dev              # Start dev server on localhost:3000

# Building
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database
pnpm prisma migrate dev    # Create and apply migration
pnpm prisma migrate reset  # Reset database
pnpm prisma studio         # Open Prisma Studio
pnpm prisma generate       # Generate Prisma client
```

### Environment Variables

```bash
# .env.local (gitignored)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SITE_URL="https://oalacea.com"

# Optional
SMTP_HOST="smtp.resend.com"
SMTP_API_KEY="re_..."
```

### Git Workflow

1. Create feature branch from `main`
2. Implement changes following architecture
3. Run `pnpm lint` and `pnpm type-check`
4. Commit with conventional messages
5. Create PR with description

### Commit Messages

```
feat: add blog post creation
fix: resolve login redirect loop
docs: update architecture documentation
refactor: extract auth service
style: format code with prettier
test: add unit tests for post service
```

---

## Next Steps

### Immediate Setup

1. **Configure Tailwind** - Create `tailwind.config.js`
2. **Install Shadcn UI** - Set up component library
3. **Define Prisma Schema** - Create initial models
4. **Set up Authentication** - Implement auth flow

### Feature Roadmap

- [ ] Authentication system
- [ ] Blog CRUD operations
- [ ] Portfolio projects management
- [ ] Admin dashboard
- [ ] Contact form
- [ ] Analytics integration
---

**Document maintained by:** Oalacea Team
**For questions or updates, please refer to the project repository.**
