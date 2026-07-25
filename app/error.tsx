"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { Logo } from "@/components/branding/logo";

export default function RootError({
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Logo size={40} />
        <EmptyState
          className="w-full"
          icon={<AlertTriangle className="h-7 w-7" aria-hidden="true" />}
          title="Something went wrong"
          description="An unexpected error occurred. Please try again, or head back to the homepage."
        />
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 rounded-xl" asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button className="h-11 rounded-xl" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
