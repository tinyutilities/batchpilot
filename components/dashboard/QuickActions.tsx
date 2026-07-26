import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  Layers,
  UserPlus,
  Wallet,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

const ACTIONS = [
  {
    label: "Add Student",
    href: "/dashboard/students?addStudent=1",
    icon: UserPlus,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    label: "Create Batch",
    href: "/dashboard/batches/new",
    icon: Layers,
    className:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  {
    label: "Mark Attendance",
    href: "/dashboard/attendance/mark",
    icon: CalendarCheck,
    className:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    label: "Record Payment",
    href: "/dashboard/fees",
    icon: Wallet,
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    label: "Create Test",
    href: "/dashboard/marks/new",
    icon: ClipboardList,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
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
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 px-3 py-4 text-center transition-colors hover:bg-muted/40 dark:border-slate-800"
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
