import { WifiOff } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Logo size={40} />

        <PageHeader
          className="text-center sm:flex-col sm:items-center sm:text-center"
          title="You're offline"
          description="BatchPilot needs a connection to load your data."
        />

        <EmptyState
          className="w-full"
          icon={<WifiOff className="h-7 w-7" aria-hidden="true" />}
          title="No internet connection"
          description="Check your connection and try again. Anything you had open will still be there."
        />
      </div>
    </div>
  );
}
