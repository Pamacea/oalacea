/**
 * Imperium UI Components
 * Warhammer 40K inspired brutalist UI components
 *
 * Design System:
 * - Dark First (no light mode)
 * - Square corners (no border radius)
 * - Crimson & Gold accent colors
 * - Glitch/distortion animations
 * - High contrast for accessibility
 *
 * @version 1.0.0
 */

// ============================================
// BUTTON
// ============================================
export { ImperiumButton, buttonVariants } from "./button"
export type { ImperiumButtonProps } from "./button"

// ============================================
// CARD
// ============================================
export {
  MineralCard,
  MineralCardHeader,
  MineralCardTitle,
  MineralCardDescription,
  MineralCardContent,
  MineralCardFooter,
} from "./mineral-card"
export type { MineralCardProps } from "./mineral-card"

// ============================================
// NAVIGATION
// ============================================
export { ImperiumNav, ImperiumNavMobile } from "./navigation"
export type { NavItem, ImperiumNavProps } from "./navigation"

// ============================================
// BADGE
// ============================================
export { ImperiumBadge, badgeVariants } from "./badge"
export type { ImperiumBadgeProps } from "./badge"

// ============================================
// FORM INPUTS
// ============================================
export { ImperiumInput, inputVariants } from "./input"
export type { ImperiumInputProps } from "./input"

export { ImperiumTextarea, textareaVariants } from "./textarea"
export type { ImperiumTextareaProps } from "./textarea"

// ============================================
// DIALOG
// ============================================
export {
  ImperiumDialog,
  ImperiumDialogPortal,
  ImperiumDialogOverlay,
  ImperiumDialogClose,
  ImperiumDialogTrigger,
  ImperiumDialogContent,
  ImperiumDialogHeader,
  ImperiumDialogFooter,
  ImperiumDialogTitle,
  ImperiumDialogDescription,
} from "./dialog"

// ============================================
// TABLE
// ============================================
export {
  ImperiumTable,
  ImperiumTableHeader,
  ImperiumTableBody,
  ImperiumTableFooter,
  ImperiumTableHead,
  ImperiumTableRow,
  ImperiumTableCell,
  ImperiumTableCaption,
} from "./table"

// ============================================
// EFFECTS
// ============================================
export {
  GlitchText,
  Scanlines,
  Noise,
  GlowBox,
  ChronoFlicker,
  BorderGlow,
} from "./effects"
export type {
  GlitchTextProps,
  ScanlinesProps,
  NoiseProps,
  GlowBoxProps,
  ChronoFlickerProps,
  BorderGlowProps,
} from "./effects"

// ============================================
// LOADING
// ============================================
export {
  ImperiumSpinner,
  ImperiumSkeleton,
  ImperiumProgressBar,
  ImperiumLoadingScreen,
} from "./loading"
export type {
  ImperiumSpinnerProps,
  ImperiumSkeletonProps,
  ImperiumProgressBarProps,
  ImperiumLoadingScreenProps,
} from "./loading"
