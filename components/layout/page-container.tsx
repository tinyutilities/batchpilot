import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

// The standard page shell — PageHeader, then every section, spaced by one
// consistent rhythm. Pass className="gap-6" for detail/form pages, which
// use a slightly airier rhythm than list pages.
export function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      {children}
    </div>
  );
}
