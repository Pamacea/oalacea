import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Imperium Table Component
 * Warhammer 40K inspired brutalist data table
 *
 * Features:
 * - Square corners (no border radius)
 * - Crimson header
 * - Iron borders
 * - Strong hover states
 */

const ImperiumTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className={cn("w-full overflow-auto border-2 border-imperium-iron")}>
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
ImperiumTable.displayName = "ImperiumTable"

const ImperiumTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "border-b-2 border-imperium-crimson bg-imperium-maroon/30 [&_tr]:border-b-0",
      className
    )}
    {...props}
  />
))
ImperiumTableHeader.displayName = "ImperiumTableHeader"

const ImperiumTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
ImperiumTableBody.displayName = "ImperiumTableBody"

const ImperiumTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t-2 border-imperium-iron bg-imperium-black-elevate [&_tr]:border-b-0",
      className
    )}
    {...props}
  />
))
ImperiumTableFooter.displayName = "ImperiumTableFooter"

const ImperiumTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-imperium-iron transition-colors hover:bg-imperium-crimson/10 data-[state=selected]:bg-imperium-crimson/20",
      className
    )}
    {...props}
  />
))
ImperiumTableRow.displayName = "ImperiumTableRow"

const ImperiumTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-bold text-imperium-ivory uppercase tracking-wider [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
ImperiumTableHead.displayName = "ImperiumTableHead"

const ImperiumTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle text-imperium-ivory-dim [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
ImperiumTableCell.displayName = "ImperiumTableCell"

const ImperiumTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-sm text-imperium-ivory-muted",
      className
    )}
    {...props}
  />
))
ImperiumTableCaption.displayName = "ImperiumTableCaption"

export {
  ImperiumTable,
  ImperiumTableHeader,
  ImperiumTableBody,
  ImperiumTableFooter,
  ImperiumTableHead,
  ImperiumTableRow,
  ImperiumTableCell,
  ImperiumTableCaption,
}
