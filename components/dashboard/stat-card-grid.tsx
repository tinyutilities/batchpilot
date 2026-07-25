import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 3 | 4;
  className?: string;
}

// Shared responsive grid every StatCard row across the app uses — same
// column counts and gap regardless of which module renders it.
export function StatCardGrid({
  children,
  columns = 4,
  className,
}: StatCardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
