# Comments System - Completion Plan

## Current Status: 95% Complete

**Summary**: The comments system is production-ready with robust security. Missing items are polish/enhancements, not critical issues.

## Verified Security Features ✅

| Feature | Status | Location |
|---------|--------|----------|
| XSS Protection | ✅ Verified | `src/shared/utils/sanitize.ts` |
| RBAC Authorization | ✅ Verified | `src/actions/comments.ts:326` |
| Parent Validation | ✅ Verified | `src/actions/comments.ts:225-268` |
| Rate Limiting (5/hour) | ✅ Verified | `src/actions/comments.ts:48-85` |
| 3-level Threading | ✅ Verified | Server-side enforced |
| Real IP Extraction | ✅ Verified | Multi-proxy headers |
| Revalidation Paths | ✅ Verified | Uses post slug |

## Missing Features (Todo - Polish)

### 1. Honeypot Fields (High Priority - Security)
**File**: `src/features/blog/components/Comments.tsx`

```tsx
// Add hidden honeypot field
<input
  type="text"
  name="website"
  className="sr-only"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  placeholder="Leave blank if human"
/>
```

**Server Action**: Check if honeypot has value → reject as spam

**Effort**: 15 minutes

### 2. Markdown Support (Medium Priority - UX)
**Files to modify**:
- `src/features/blog/components/Comments.tsx` - rendering
- `src/actions/comments.ts` - server action

**Implementation**:
- Use `react-markdown` with custom renderers
- Sanitize markdown output with DOMPurify
- Support: bold, italic, code, links, lists
- Preserve line breaks

**Effort**: 1-2 hours

### 3. Email Notifications (Medium Priority - UX)
**Files to create**:
- `src/features/notifications/email.ts` - email service

**Implementation**:
- Notify admin on new pending comments
- Notify commenters on replies (opt-in)
- Use Resend/SendGrid

**Effort**: 2-3 hours

### 4. Spam Filtering (Low Priority - Enhancement)
**Files to create**:
- `src/features/comments/akismet.ts` - Akismet client

**Implementation**:
- Check comments against Akismet API
- Auto-mark suspicious as SPAM
- Manual review still required

**Effort**: 2-3 hours

## Implementation Order

1. **Honeypot fields** - Quick win, immediate bot protection
2. **Markdown support** - Improves UX significantly
3. **Email notifications** - Better moderation workflow
4. **Spam filtering** - Advanced protection (optional)

## Updated Progress Entry

```markdown
### Comments System - 97%

**Implemented:**
- All existing 95% features (see PROGRESS.md)
- Honeypot fields for bot protection

**Todo:**
- [ ] Markdown support in comments
- [ ] Email notifications on new comments
- [ ] Spam filtering service (Akismet)
```

## Notes

- The system is **already production-ready** without these additions
- Security posture is strong
- Missing features are quality-of-life improvements
