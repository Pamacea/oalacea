"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-imperium-black border-2 border-imperium-steel-dark p-3 [--cell-size:--spacing(8)]",
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn(
          "flex flex-col w-full gap-4",
          defaultClassNames.month
        ),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none rounded-none border-2 border-imperium-steel-dark",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none rounded-none border-2 border-imperium-steel-dark",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size) font-display uppercase tracking-wider text-imperium-crimson",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center font-terminal text-xs justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative border-2 border-imperium-steel-dark bg-imperium-black",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-imperium-black border-2 border-imperium-steel-dark inset-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-display text-sm uppercase select-none",
          captionLayout === "label"
            ? "text-imperium-steel"
            : "pl-2 flex items-center gap-1 text-sm h-8 [&>svg]:text-imperium-steel [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "font-display text-xs uppercase tracking-wider text-imperium-steel rounded-none flex-1 p-2",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "font-terminal text-xs select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "font-terminal text-imperium-steel",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:data-[selected=true]:border-r-2 group/day aspect-square select-none font-terminal",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:data-[selected=true]:border-l-2 data-[selected=true]:border-r-2"
            : "[&:first-child[data-selected=true]_button]:border-l-2",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-imperium-crimson text-imperium-bone border-2 border-imperium-crimson",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "bg-imperium-crimson/30 text-imperium-bone border-y-2 border-imperium-crimson",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "bg-imperium-crimson text-imperium-bone border-2 border-imperium-crimson",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-imperium-crimson/20 text-imperium-crimson data-[selected=true]:bg-imperium-crimson data-[selected=true]:text-imperium-bone",
          defaultClassNames.today
        ),
        outside: cn(
          "text-imperium-steel-dark opacity-50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-imperium-steel-dark opacity-30",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4 text-imperium-steel", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-imperium-steel", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 text-imperium-steel", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center font-terminal text-xs">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-imperium-crimson data-[selected-single=true]:text-imperium-bone data-[range-middle=true]:bg-imperium-crimson/30 data-[range-start=true]:bg-imperium-crimson data-[range-end=true]:bg-imperium-crimson rounded-none border-2 border-imperium-steel-dark group-data-[focused=true]/day:border-imperium-crimson group-data-[focused=true]/day:shadow-[0_0_0_2px_rgba(154,17,21,0.3)] flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
