import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  Layers,
  UserPlus,
  Wallet,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

// Reuses the same soft-token set StatCard's icon circles use, so the
// dashboard's decorative icon accents read as one coherent system rather
// than an unrelated rainbow of hues.
const ACTIONS = [
  {
    label: "Add Student",
    href: "/dashboard/students?addStudent=1",
    icon: UserPlus,
    className: "bg-primary-soft text-primary",
  },
  {
    label: "Create Batch",
    href: "/dashboard/batches/new",
    icon: Layers,
    className: "bg-secondary-soft text-secondary-foreground",
  },
  {
    label: "Mark Attendance",
    href: "/dashboard/attendance/mark",
    icon: CalendarCheck,
    className: "bg-accent-soft text-accent",
  },
  {
    label: "Record Payment",
    href: "/dashboard/fees",
    icon: Wallet,
    className: "bg-success-soft text-success",
  },
  {
    label: "Create Test",
    href: "/dashboard/marks/new",
    icon: ClipboardList,
    className: "bg-warning-soft text-warning",
  },
];

export default function QuickActions() {
  return (
    <DashboardCard title="Quick Actions" description="Jump straight into common tasks">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border px-3 py-4 text-center transition-colors hover:bg-muted/40"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${action.className}`}
            >
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-foreground">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}
