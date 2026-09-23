"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // Renders as a compact icon button that expands into the full input on
  // focus/click, and collapses again once empty and blurred. Opt-in only —
  // every existing caller keeps today's always-expanded search box.
  collapsible?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  collapsible = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!collapsible) {
    return (
      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Stays expanded while focused, and also while it holds a value (so an
  // active search term doesn't disappear from view just because the user
  // clicked elsewhere) — only collapses once both are false.
  const isExpanded = isFocused || value.length > 0;

  return (
    <div
      className={cn(
        "relative h-11 w-full shrink-0 overflow-hidden rounded-xl transition-[width] duration-200 ease-out",
        isExpanded ? "lg:w-64" : "lg:w-11",
      )}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        aria-label="Search"
        tabIndex={isExpanded ? -1 : 0}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />

      {isExpanded && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}