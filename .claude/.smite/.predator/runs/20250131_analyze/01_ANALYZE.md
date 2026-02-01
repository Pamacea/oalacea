# Analysis Report

## Codebase Structure

### Next.js 15 App Router with Route Groups

```
src/app/
├── (marketing)/         # Route group: public pages with header/footer
│   ├── layout.tsx       # Marketing layout (Header + main + Footer)
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── page.tsx         # Marketing homepage
├── (auth)/              # Route group: authentication pages
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── admin/               # Admin dashboard
│   ├── layout.tsx       # Admin layout with sidebar
│   ├── blog/page.tsx    # Blog management
│   └── projects/page.tsx # Project management
└── layout.tsx           # Root layout with providers
```

## Relevant Files

### Existing Server Actions (Data fetching)
- `src/actions/blog/query.ts` - getPosts(), getPostBySlug(), getAllCategories()
- `src/actions/projects.ts` - getProjects(), getProjectBySlug()

### Existing Components (Reusable)
- `src/features/blog/components/BlogGrid.tsx` - Grid layout for posts
- `src/features/blog/components/PostCard.tsx` - Individual post card with theme
- `src/features/portfolio/components/ProjectGrid.tsx` - Grid layout for projects
- `src/features/portfolio/components/ProjectCard.tsx` - Individual project card with theme

### Layout Components
- `src/components/layout/header.tsx` - Header component with navigation
- `src/components/layout/footer.tsx` - Footer component
- `src/app/(marketing)/layout.tsx` - Simple marketing layout (reference pattern)

### Toast System
- `src/components/ui/sonner.tsx` - Sonner toaster with Lucide icons

### Navigation Configuration
- `src/config/navigation.ts` - Contains mainNav and footerNav arrays

## Existing Patterns

### File Organization
- **Route Groups**: Parentheses naming `(marketing)`, `(auth)` for URL-independent organization
- **Feature-based**: Components organized by feature in `src/features/`
- **Server Actions**: Located in `src/actions/`, re-exported via `src/features/*/actions/`

### Code Style
- **Client Components**: `'use client'` directive for interactive components
- **Theme System**: `useWorldTheme()` hook for consistent theming
- **Server Actions**: `'use server'` directive, cached with `unstable_cache`

### Import Patterns
- Absolute imports: `@/components/layout`, `@/features/blog`, etc.
- Barrel exports: `index.ts` files for clean public APIs

### Theme/Colors
- Uses `useWorldTheme()` hook for colors
- Dynamic theme based on 3D world context
- Dark/light theme support via `next-themes`

## Dependencies

### External Libraries
- **Next.js 15** - App Router, Server Actions
- **Prisma** - Database ORM
- **Sonner** - Toast notifications
- **Lucide React** - Icons
- **next-themes** - Theme management

### Internal
- Server actions: `getPosts()`, `getPostBySlug()`, `getProjects()`, `getProjectBySlug()`
- Components: `BlogGrid`, `ProjectGrid`, `PostCard`, `ProjectCard`, `Header`, `Footer`
- Theme: `useWorldTheme()` hook

## Potential Issues

1. **No existing public routes**: `/blog` and `/portfolio` routes don't exist yet (only `/admin/blog` and `/admin/projects`)
2. **Navigation links exist**: The header already has links to `/blog` and `/portfolio` - they will 404 currently

## Examples

### Marketing Layout Pattern
```typescript
// src/app/(marketing)/layout.tsx
import { Header, Footer } from "@/components/layout"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
    </>
  )
}
```

### Simple Page Pattern
```typescript
// src/app/(marketing)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-2xl font-semibold text-zinc-100">À propos</h1>
        ...
      </div>
    </div>
  );
}
```

## Task Summary

Create a new route group `(mie)` with:
- `src/app/(mie)/layout.tsx` - Simple layout like `(marketing)`
- `src/app/(mie)/blogs/page.tsx` - Public blog listing page
- `src/app/(mie)/blogs/[slug]/page.tsx` - Individual blog post page
- `src/app/(mie)/projets/page.tsx` - Public projects listing page
- `src/app/(mie)/projets/[slug]/page.tsx` - Individual project page

Use existing:
- Server actions from `src/actions/blog/query.ts` and `src/actions/projects.ts`
- Components `BlogGrid`, `ProjectGrid`, `PostCard`, `ProjectCard`
- Toast system via `sonner`
- Layout components `Header`, `Footer`
