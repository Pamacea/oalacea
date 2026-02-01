# Implementation Plan

## Files to Create

### src/features/3d-world/components/admin/markdown-editor/index.ts
- **Purpose**: Public API exports for the markdown editor
- **Exports**: MarkdownEditor, EditorToolbar (optional), types
- **Size estimate**: small (~10 lines)

### src/features/3d-world/components/admin/markdown-editor/types.ts
- **Purpose**: TypeScript types and interfaces for the editor
- **Content**: Editor props, toolbar button config, color palette type
- **Size estimate**: small (~30 lines)

### src/features/3d-world/components/admin/markdown-editor/extensions.ts
- **Purpose**: Tiptap extensions configuration
- **Dependencies**: @tiptap/* packages
- **Size estimate**: medium (~80 lines)
- **Extensions to configure**:
  - StarterKit (base extensions)
  - TextStyle + Color (text colors)
  - Link (with custom HTML attributes)
  - TaskList + TaskItem (checkboxes)
  - Table + TableRow + TableHeader + TableCell
  - Image (with drag-drop)
  - CodeBlock (with lowlight syntax highlighting)
  - Placeholder

### src/features/3d-world/components/admin/markdown-editor/MarkdownEditor.tsx
- **Purpose**: Main editor component
- **Dependencies**: extensions.ts, types.ts, @tiptap/react
- **Size estimate**: medium (~150 lines)
- **Features**:
  - useEditor hook with SSR handling
  - EditorContent wrapper with dark theme styling
  - Markdown output (getMarkdown method)
  - Controlled component pattern

### src/features/3d-world/components/admin/markdown-editor/EditorToolbar.tsx
- **Purpose**: Formatting toolbar with buttons
- **Dependencies**: lucide-react icons, types.ts
- **Size estimate**: large (~200 lines)
- **Buttons**:
  - Text formatting: bold, italic, strike, code
  - Headings: h1, h2, h3
  - Lists: bullet, ordered, task
  - Insert: link, image, table, hr
  - History: undo, redo
  - View: markdown source toggle

### src/features/3d-world/components/admin/markdown-editor/ColorPicker.tsx
- **Purpose**: Text color selection palette
- **Dependencies**: types.ts
- **Size estimate**: small (~60 lines)
- **Colors**: predefined palette with good contrast on zinc dark theme

### src/features/3d-world/components/admin/markdown-editor/LinkModal.tsx
- **Purpose**: Link insertion with internal content search
- **Dependencies**: Blog/Project queries for internal linking
- **Size estimate**: medium (~120 lines)
- **Features**:
  - External URL input
  - Internal content search (blogs/projects)
  - Preview and confirm

## Files to Modify

### src/features/3d-world/components/admin/BlogPostForm.tsx
- **Changes**: Replace `content` textarea with `<MarkdownEditor />`
- **Risk level**: medium - core form functionality
- **Dependencies affected**: None (compatible interface)

### src/features/3d-world/components/admin/ProjectForm.tsx
- **Changes**: Replace `longDescription` textarea with `<MarkdownEditor />`
- **Risk level**: medium - core form functionality
- **Dependencies affected**: None (compatible interface)

### package.json
- **Changes**: Add new Tiptap extensions as dependencies
- **Risk level**: low - dependency addition only
- **Dependencies to add**:
  - @tiptap/extension-text-style
  - @tiptap/extension-color
  - @tiptap/extension-task-list
  - @tiptap/extension-table

## Acceptance Criteria

### Functional Requirements
- [ ] Markdown editor renders correctly in both blog and project forms
- [ ] Text formatting works (bold, italic, headings, lists, code)
- [ ] Text color can be changed from a predefined palette
- [ ] Links can be inserted (external URLs and internal blogs/projects)
- [ ] Images can be inserted via URL
- [ ] Tables can be created and edited
- [ ] Code blocks with syntax highlighting work
- [ ] Markdown source can be viewed and edited
- [ ] Content is saved correctly to the database
- [ ] Editor works on both create and edit modes

### Non-Functional Requirements
- [ ] Code passes linting
- [ ] Code passes typecheck
- [ ] Build succeeds
- [ ] SSR compatibility verified (no hydration errors)
- [ ] Bundle size impact is reasonable

### Quality Standards
- [ ] Follows existing zinc dark theme
- [ ] Consistent with existing form patterns
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Accessible (keyboard navigation, ARIA labels)

## Implementation Steps

### Phase 1: Setup
1. [ ] Install additional Tiptap extensions
2. [ ] Create markdown-editor folder structure
3. [ ] Create types.ts with editor interfaces

### Phase 2: Core Editor
4. [ ] Create extensions.ts with all Tiptap extensions
5. [ ] Create MarkdownEditor.tsx main component
6. [ ] Create EditorToolbar.tsx with all buttons

### Phase 3: Features
7. [ ] Create ColorPicker.tsx
8. [ ] Create LinkModal.tsx with internal search
9. [ ] Add markdown source toggle

### Phase 4: Integration
10. [ ] Update BlogPostForm.tsx to use MarkdownEditor
11. [ ] Update ProjectForm.tsx to use MarkdownEditor
12. [ ] Create index.ts exports

### Phase 5: Validation
13. [ ] Run lint and fix issues
14. [ ] Run typecheck and fix issues
15. [ ] Run build and verify
16. [ ] Manual testing in browser

## Risk Assessment

### High Risk Items
- None identified

### Medium Risk Items
- **SSR Hydration Issues** - Mitigation: Use `immediatelyRender: false` and dynamic import with `ssr: false`
- **Internal Link Routing** - Mitigation: Use Next.js Link component for internal routes
- **Form State Sync** - Mitigation: Use controlled component pattern with onChange callbacks

### Low Risk Items
- Bundle size increase - Tiptap is tree-shakeable
- Color contrast - Will use predefined accessible palette
- Mobile responsiveness - Tailwind responsive classes

## Estimated Complexity
- **Overall**: Medium
- **New files**: 7
- **Modified files**: 3
- **Time**: Implementation is straightforward due to existing Tiptap setup
