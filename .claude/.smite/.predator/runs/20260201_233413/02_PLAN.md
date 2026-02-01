# Implementation Plan - Project Optimization

## Task Overview

**Total Tasks**: 10
**Estimated Complexity**: High
**Files to Create**: 20+
**Files to Modify**: 30+

---

## Phase 1: Quick Wins (Low Risk)

### Task 1: Remove Dead Code & Consolidate Duplicates

**Files to Modify:**
- `src/core/3d/scenes/worlds/DevWorld.tsx` - Remove lines 40-63 (commented code)
- `src/lib/formatters.ts` - Remove (consolidate into shared/utils/format.ts)
- `src/shared/utils/format.ts` - Keep as single source

**Risk Level:** Low
**Lines Removed:** ~100
**Impact:** Cleaner codebase, reduced bundle

---

### Task 2: Fix Re-render Issues in Modal Components

**Files to Modify:**
- `src/features/3d-world/components/readers/BlogListingModal.tsx`
- `src/features/3d-world/components/ui/InteractionPrompt.tsx`

**Changes:**
```typescript
// BlogListingModal.tsx
// Add useMemo for derived state
const hasPrev = useMemo(() => selectedIndex > 0, [selectedIndex]);
const hasNext = useMemo(() => selectedIndex < posts.length - 1, [selectedIndex, posts]);

// Add useCallback for handlers
const handleNext = useCallback(() => { /* ... */ }, [selectedIndex, posts]);
const handlePrevious = useCallback(() => { /* ... */ }, [selectedIndex, posts]);

// InteractionPrompt.tsx
// Combine store subscriptions with shallow
import { useShallow } from 'zustand/react/shallow';
const modalActions = useModalStore(useShallow((s) => ({
  openBlogListing: s.openBlogListing,
  openProjectListing: s.openProjectListing,
  // ...
})));
```

**Risk Level:** Low
**Impact:** Reduced re-renders, better performance

---

## Phase 2: Component Splitting (Medium Risk)

### Task 3: Split WorldGenerator.tsx (738 lines)

**Files to Create:**
- `src/core/3d/procedural/generators/NoiseGenerator.ts`
- `src/core/3d/procedural/generators/BiomeGenerator.ts`
- `src/core/3d/procedural/generators/BuildingGenerator.ts`
- `src/core/3d/procedural/generators/TerrainGenerator.ts`

**Files to Modify:**
- `src/core/3d/procedural/WorldGenerator.tsx` - Keep as orchestrator

**Risk Level:** Medium (core 3D functionality)
**Lines:** Split 738 → 4x ~150 + orchestrator ~100

---

### Task 4: Merge & Split ProjectForm Duplicates

**Files to Modify:**
- `src/features/3d-world/components/admin/ProjectForm.tsx` (570 lines)
- `src/features/admin/components/projects/ProjectForm.tsx` (560 lines)

**Files to Create:**
- `src/shared/components/projects/ProjectForm.tsx` (orchestrator)
- `src/shared/components/projects/ProjectFormFields.tsx`
- `src/shared/components/projects/ProjectMediaManager.tsx`
- `src/shared/components/projects/ProjectMarkdownEditor.tsx`

**Risk Level:** Medium (admin functionality)
**Strategy:**
1. Compare both files, identify differences
2. Create unified version in shared/
3. Update imports in both locations
4. Delete old files

---

### Task 5: Split 3D Terminal Components

**Files to Modify:**
- `src/core/3d/scenes/objects/AdminTerminal.tsx` (405 lines)
- `src/core/3d/scenes/objects/NewsletterTerminal.tsx` (395 lines)
- `src/core/3d/scenes/objects/ArtDisplay.tsx` (395 lines)
- `src/core/3d/scenes/objects/ContentTerminal.tsx` (374 lines)

**Files to Create:**
- `src/core/3d/scenes/objects/terminal/TerminalMesh.tsx` (reusable 3D mesh)
- `src/core/3d/scenes/objects/terminal/TerminalUI.tsx` (reusable UI panel)
- `src/core/3d/scenes/objects/terminal/BaseTerminal.tsx` (base component)

**Risk Level:** Medium (3D scene objects)

---

### Task 6: Split RichTextEditor (462 lines)

**Files to Create:**
- `src/features/admin/components/editor/EditorToolbar.tsx`
- `src/features/admin/components/editor/EditorContent.tsx`
- `src/features/admin/components/editor/EditorFormatting.tsx`

**Files to Modify:**
- `src/features/admin/components/RichTextEditor.tsx` - Keep as orchestrator

**Risk Level:** Low

---

### Task 7: Split Sidebar (724 lines)

**Files to Create:**
- `src/components/ui/sidebar/SidebarProvider.tsx`
- `src/components/ui/sidebar/SidebarContent.tsx`
- `src/components/ui/sidebar/SidebarMobile.tsx`
- `src/components/ui/sidebar/SidebarDesktop.tsx`

**Files to Modify:**
- `src/components/ui/sidebar.tsx` - Replace with barrel export

**Risk Level:** Medium (widely used component)

---

## Phase 3: Performance (High Impact)

### Task 8: Add Bundle Optimization

**Files to Modify:**
- `package.json` - Add @next/bundle-analyzer
- `next.config.ts` - Add optimizations

**Changes:**
```typescript
// next.config.ts
import type { NextConfig } from 'next/server';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
```

**Files to Create:**
- Dynamic import wrappers for heavy 3D components

**Risk Level:** Low (configuration only)

---

### Task 9: Add React.memo to Expensive Components

**Components to memoize:**
- `src/features/admin/components/AnalyticsDashboard.tsx`
- `src/features/blog/components/Comments.tsx`
- `src/features/portfolio/components/ProjectTemplate.tsx`
- `src/features/3d-world/components/readers/BlogReadingModal.tsx`
- `src/features/3d-world/components/readers/ProjectReadingModal.tsx`
- `src/components/ui/chart.tsx`

**Risk Level:** Low (performance optimization only)

---

## Phase 4: Validation

### Task 10: Run Validation & Fix Issues

**Steps:**
1. Run `pnpm lint` - Fix all linting errors
2. Run `pnpm typecheck` - Fix all type errors
3. Run `pnpm build` - Fix all build errors
4. Manual smoke test

**Risk Level:** High (final validation)

---

## Acceptance Criteria

### Functional Requirements
- [ ] All commented code removed
- [ ] Duplicate functions consolidated
- [ ] Large components split into smaller pieces
- [ ] Re-render issues fixed
- [ ] Bundle size reduced

### Non-Functional Requirements
- [ ] Code passes linting
- [ ] Code passes typecheck
- [ ] Build succeeds
- [ ] No console errors
- [ ] No visual regressions

### Quality Standards
- [ ] Components <200 lines (target)
- [ ] Single responsibility per component
- [ ] Proper memoization where needed
- [ ] Clear file organization

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking 3D functionality | Test in DevWorld after each change |
| Admin forms breaking | Keep old files until new version verified |
| Import errors | Update barrel exports |
| Type errors | Run typecheck after each file change |

---

## Rollback Strategy

If issues arise:
1. Git revert individual commits
2. Keep backup of original files in `.claude/.smite/.predator/runs/20260201_233413/backup/`
3. Test each phase before proceeding

---

## Estimated Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Components >200 lines | 50+ | <10 | 80% reduction |
| Duplicate functions | 3+ | 0 | 100% elimination |
| Bundle size | 740MB | ~400MB | ~45% reduction |
| Re-renders (measured) | Baseline | -30% | Better performance |
