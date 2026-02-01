# Adversarial Code Review Report

## Review Summary

Four adversarial reviewers analyzed the newly created `(mie)` route group files:
- Security Reviewer
- Code Quality Reviewer
- Logic Reviewer
- Architecture Reviewer

---

## Critical Issues (Must Fix) - 1 item

### 1. Stored XSS via Blog Post Content
**File:** `src/app/(mie)/blogs/[slug]/page.tsx` (Line 63-66)

**Issue:** `dangerouslySetInnerHTML` used without sanitization for user-controlled blog content.

**Risk:** If admin account compromised or content inserted directly into DB, malicious scripts execute in users' browsers.

**Recommendation:**
```tsx
import DOMPurify from 'isomorphic-dompurify';
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
```

---

## High Priority (Should Fix) - 4 items

### 2. Duplicated Card Components
**Files:** `blogs/page.tsx`, `projets/page.tsx`

**Issue:** Card components duplicated inline (~80-95 lines each) instead of using existing `PostCard` and `ProjectCard` from `@/features/`.

**Impact:** Updates must be made in two places; inconsistent styling (static colors vs dynamic `useWorldTheme`).

### 3. Duplicate Category Labels
**Files:** `projets/page.tsx`, `projets/[slug]/page.tsx`

**Issue:** `categoryLabels` defined in two places. Should be in shared constants file.

### 4. Missing Metadata (SEO)
**Files:** All `(mie)` pages

**Issue:** No `metadata` or `generateMetadata` exports. Missing OpenGraph tags.

### 5. Gravatar MD5 Hash Not Computed
**File:** `Comments.tsx` (Line 294) - existing component

**Issue:** Uses raw email instead of MD5 hash. Gravatar functionality broken.

---

## Medium Priority (Consider Fixing) - 5 items

### 6. Hardcoded Fallback for readingTime
**File:** `blogs/page.tsx` (Line 98)

**Issue:** `{post.readingTime || 5}` - if `readingTime` is 0, shows "5 min". Use `??` instead.

### 7. Date Formatting Inline
**Files:** Multiple

**Issue:** `toLocaleDateString("fr-FR", ...)` repeated. Should use shared formatter from `@/lib/formatters`.

### 8. Inline SVG Icons
**File:** `blogs/page.tsx` (Lines 108-110, 117-120)

**Issue:** Mixed usage - imports `Calendar`/`Clock` from lucide-react but uses inline SVGs for arrow/eye.

### 9. Missing Loading/Error States
**Files:** All `(mie)` routes

**Issue:** No `loading.tsx` or `error.tsx` files.

### 10. URL Validation for External Links
**File:** `projets/[slug]/page.tsx`

**Issue:** External URLs not validated against `javascript:` or `data:` protocols.

---

## Low Priority (Nice to Have) - 4 items

### 11. Magic Number for Default Reading Time
### 12. Hardcoded URL Paths
### 13. Missing Structured Data (JSON-LD)
### 14. No Pagination on List Pages

---

## False Positives (Can Ignore) - 5 items

1. **`await params` pattern** - Correct for Next.js 15
2. **Server Component usage** - Correct RSC pattern
3. **Prisma ORM** - Protected from SQL injection
4. **React default escaping** - Safe for text content
5. **No auth required** - These are public pages

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 4 |
| Medium | 5 |
| Low | 4 |
| False Positive | 5 |
| **Total Issues** | **19** |

---

## Recommended Action Plan

1. **Before production:** Fix XSS vulnerability (#1)
2. **This sprint:** Extract duplicated components (#2, #3)
3. **Next iteration:** Add SEO metadata (#4), fix Gravatar (#5)
4. **Polish:** Address medium/low priority items
