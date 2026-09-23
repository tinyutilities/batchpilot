import Link from "next/link";
import { CheckCircle2, Layers, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function WelcomeOnboarding() {
  return (
    <Card className="[--card-spacing:--spacing(6)] rounded-2xl border-border bg-card shadow-raised sm:[--card-spacing:--spacing(8)]">
      <CardContent className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to BatchPilot 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Let&apos;s set up your tuition.
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col">
          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Step 1
            </span>
            <p className="text-base font-medium text-foreground">
              Create your first batch
            </p>
            <Button asChild className="h-11 gap-2 rounded-xl">
              <Link href="/dashboard/batches/new">
                <Layers className="h-4 w-4" aria-hidden="true" />
                Create Batch
              </Link>
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Step 2
            </span>
            <p className="text-base font-medium text-foreground">
              Open your batch to add students
            </p>
            <Button asChild variant="outline" className="h-11 gap-2 rounded-xl">
              <Link href="/dashboard/batches">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Go to Batches
              </Link>
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col items-center gap-2 pt-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step 3
            </span>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Start tracking attendance, fees and marks.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
