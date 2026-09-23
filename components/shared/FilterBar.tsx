import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  search: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  // Set to false when `search` sizes itself (e.g. a collapsible search
  // control) so the wrapper doesn't force it to stretch across the
  // remaining row width. Defaults to true — every existing filter bar
  // keeps its current full-width search box unchanged.
  searchGrow?: boolean;
}

// The shared shell every filter bar in the app uses: a search box that
// takes the remaining width, plus a row of filter controls (and a reset
// button) that wraps on smaller screens. Individual pages only need to
// supply their own Select/Input controls as children.
export function FilterBar({
  search,
  children,
  className,
  searchGrow = true,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:gap-3",
        className,
      )}
    >
      <div className={cn("w-full", searchGrow ? "lg:flex-1" : "lg:w-auto")}>
        {search}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {children}
      </div>
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

// A single filter control with its label — the label is visible on the
// stacked mobile layout and screen-reader-only once controls sit in a row.
export function FilterField({ label, htmlFor, children }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground lg:sr-only"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
