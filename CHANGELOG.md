# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 3D model assets (GLB/GLTF/FBX) in `/public/3d/models/`
- Environment textures (HDRs) in `/public/3d/env/`
- NPC system (Tech Priest, Art Curator)

## [1.0.2] - 2025-02-19

### Added
- **Shadow Secret Integration**: Secure secrets management with SOPS encryption
  - Added `project.yaml` for shadow-secret configuration
  - Added `.sops.yaml` for age-based encryption
  - Secure vault system for environment secrets

### Changed
- **Git Configuration**: Updated `.gitignore` to only exclude `.env.local`
- **Prisma Configuration**: Improved environment loading with dotenv priority
- Enhanced `prisma.config.ts` with better dotenv configuration

### Fixed
- Environment file handling for better local development experience

## [1.0.1] - 2025-02-11

### Added
- **About Page v1.0.1**: Completely redesigned about page with Imperium Theme
  - Clean, minimal design inspired by 3D About Modal
  - Simple tech stack badges (no progress bars)
  - Animated header with glitch effect
  - Identity card with stats (Projects, Articles, Commits)
  - Navigation cards to Projects and Blogs
  - Contact section (GitHub, Email)
  - Responsive grid layout
  - Moved from `(marketing)` to `(mie)` route group

### Changed
- Removed old about page from `(marketing)` route group
- Updated overall project completion to 91%

### Fixed
- Route conflict between `(marketing)/about` and `(mie)/about`
- Client component metadata export issue (moved to layout.tsx)

[Unreleased]: https://github.com/Pamacea/oalacea/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/Pamacea/oalacea/releases/tag/v1.0.2
[1.0.1]: https://github.com/Pamacea/oalacea/releases/tag/v1.0.1
[1.0.0]: https://github.com/Pamacea/oalacea/releases/tag/v1.0.0

### Added
- **3D Interactive Scene**: Isometric 3D scene built with Three.js and React Three Fiber
- **Portfolio/Blog**: Professional portfolio platform with blog capabilities
- **Tech Stack**: Next.js 16 with App Router, React 19, TypeScript 5
- **UI Framework**: Tailwind CSS 4 with Shadcn UI components
- **State Management**: Zustand for client state, TanStack Query for server state
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js integration

### Security
- Secure authentication with NextAuth.js
- Environment-based configuration

[Unreleased]: https://github.com/Pamacea/oalacea/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Pamacea/oalacea/releases/tag/v1.0.0
