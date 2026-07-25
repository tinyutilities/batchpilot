"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Switch } from "@/components/ui/switch";
import { USE_DEMO_DATA } from "@/lib/config";

// Keep in sync with package.json's "version" field — not imported directly
// to avoid a JSON-module resolution dependency for a single read-only
// string.
const APP_VERSION = "0.1.0";

export default function AdminSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Admin Settings"
        description="Platform-level information and controls."
      />

      <DashboardCard
        title="Platform"
        description="Read-only information about this deployment."
      >
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              Application Version
            </dt>
            <dd className="text-sm font-medium text-foreground">
              v{APP_VERSION}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              Framework
            </dt>
            <dd className="text-sm font-medium text-foreground">
              Next.js 16 (App Router)
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              Deployment Platform
            </dt>
            <dd className="text-sm font-medium text-foreground">
              Cloudflare Workers (OpenNext)
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              Data Source
            </dt>
            <dd className="text-sm font-medium text-foreground">
              {USE_DEMO_DATA ? "Demo data" : "Live (empty until seeded)"}
            </dd>
          </div>
        </dl>
      </DashboardCard>

      <DashboardCard
        title="Platform Controls"
        description="Not yet connected to a backend — these are placeholders for future infrastructure work."
      >
        <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="demo-mode">Demo Mode</Label>
              <p className="text-sm text-muted-foreground">
                Serve every workspace with seeded demo data instead of live
                records. Currently controlled by the{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
                  NEXT_PUBLIC_USE_DEMO_DATA
                </code>{" "}
                environment variable.
              </p>
            </div>
            <Switch id="demo-mode" checked={USE_DEMO_DATA} disabled />
          </div>

          <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Show a maintenance screen to teachers while changes are
                deployed. Reserved for a future release.
              </p>
            </div>
            <Switch id="maintenance-mode" checked={false} disabled />
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}
