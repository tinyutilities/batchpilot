"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">
        This page ran into a problem
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Something unexpected happened while loading this screen. You can try
        again, or navigate elsewhere from the sidebar.
      </p>
      <Button className="mt-2 h-11 rounded-xl" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
