# Analysis Report

## Codebase Structure

```
src/features/3d-world/components/admin/
├── BlogPostForm.tsx         # Blog post editing form
├── ProjectForm.tsx          # Project editing form
├── InWorldAdminModal.tsx    # Modal container
└── queries/
    └── use-project-mutations.ts
```

## Relevant Files

| File | Purpose |
|------|---------|
| `src/features/3d-world/components/admin/BlogPostForm.tsx` | Blog post creation/editing form |
| `src/features/3d-world/components/admin/ProjectForm.tsx` | Project creation/editing form |
| `src/features/3d-world/components/admin/InWorldAdminModal.tsx` | Modal container with tabs |
| `package.json` | Dependencies - TipTap already installed |

## Existing Patterns

### File Organization
- Feature-based structure under `src/features/3d-world/`
- Admin components grouped in `components/admin/`
- Each form is a self-contained component

### Code Style
- Tailwind CSS with zinc-based dark theme
- Client components with `'use client'`
- React hooks for state management
- TanStack Query for mutations

### Styling Convention
```tsx
// Dark theme zinc colors
bg-zinc-900 / bg-zinc-800 / bg-zinc-700
border-zinc-700 focus:border-zinc-600
text-zinc-100 / text-zinc-300 / text-zinc-500
```

### State Management
- Local state with `useState`
- Modal store via Zustand (`useInWorldAdminStore`)
- TanStack Query mutations for API calls

## Dependencies

### Already Installed (TipTap v3.17.1)
```json
"@tiptap/extension-code-block-lowlight": "^3.17.1"
"@tiptap/extension-image": "^3.17.1"
"@tiptap/extension-link": "^3.17.1"
"@tiptap/extension-placeholder": "^3.17.1"
"@tiptap/pm": "^3.17.1"
"@tiptap/react": "^3.17.1"
"@tiptap/starter-kit": "^3.17.1"
"lowlight": "^3.3.0"
```

### Additional Extensions Needed
```bash
@tiptap/extension-text-style  # For text styling
@tiptap/extension-color       # For text colors
@tiptap/extension-task-list   # For task lists
@tiptap/extension-table       # For tables
```

## Current Implementation

### BlogPostForm Content Field
```tsx
<textarea
  className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-4 py-3 font-mono leading-relaxed"
  rows={12}
  placeholder="# Titre du article\n\nÉcrivez votre contenu ici en **markdown**..."
/>
```

### ProjectForm Long Description Field
```tsx
<textarea
  className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-4 py-3"
  rows={5}
/>
```

## Chosen Editor: Tiptap v3

### Why Tiptap?
- Already installed in the project
- Best-in-class extensibility
- Excellent TypeScript support
- SSR improvements in v3.0 for Next.js
- Built-in extensions for color, links, tables
- Large community and ecosystem

### Features to Implement
1. Rich text toolbar (bold, italic, headings, lists)
2. Text color picker
3. Link insertion with internal blog/project linking
4. Code blocks with syntax highlighting
5. Image upload
6. Table support
7. Markdown toggle (view source)

## New Folder Structure

```
src/features/3d-world/components/admin/
└── markdown-editor/
    ├── index.ts                    # Public API exports
    ├── MarkdownEditor.tsx          # Main editor component
    ├── EditorToolbar.tsx           # Toolbar with formatting buttons
    ├── ColorPicker.tsx             # Text color selection
    ├── LinkModal.tsx               # Link insertion with internal content search
    ├── extensions.ts               # Tiptap extensions configuration
    └── types.ts                    # Editor-specific types
```

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| SSR compatibility | Medium | Use `immediatelyRender: false` and dynamic import |
| Internal link routing | Low | Use Next.js Link component for internal routes |
| Color contrast issues | Low | Provide predefined color palette with good contrast |
| Bundle size | Low | Lazy load editor component |

## Examples Found

### Existing Tiptap Usage (if any)
The project has Tiptap extensions installed but no current usage found in forms. The extensions were likely added for future use or another feature.

### Form Pattern Reference
```tsx
// Typical form field pattern
<div className="space-y-2">
  <label className="text-sm font-medium text-zinc-300">Label</label>
  <input
    value={formData.field}
    onChange={(e) => setFormData({...formData, field: e.target.value})}
    className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-4 py-3"
  />
</div>
```
