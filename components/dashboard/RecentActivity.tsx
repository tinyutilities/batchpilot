import { formatDistanceToNow } from "date-fns";
import {
  CalendarCheck,
  ClipboardList,
  ClipboardPen,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/types/dashboard";

// Same token set as QuickActions/StatCard's icon circles, kept in the same
// order as that action originates from (e.g. attendance_marked matches
// QuickActions' "Mark Attendance") for a consistent icon language.
const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: typeof UserPlus; className: string }
> = {
  student_added: {
    icon: UserPlus,
    className: "bg-primary-soft text-primary",
  },
  attendance_marked: {
    icon: CalendarCheck,
    className: "bg-accent-soft text-accent",
  },
  payment_recorded: {
    icon: Wallet,
    className: "bg-success-soft text-success",
  },
  test_created: {
    icon: ClipboardList,
    className: "bg-secondary-soft text-secondary-foreground",
  },
  marks_entered: {
    icon: ClipboardPen,
    className: "bg-warning-soft text-warning",
  },
};

interface RecentActivityProps {
  activity: ActivityItem[];
}

export default function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <DashboardCard
      title="Recent Activity"
      description="Latest updates across your tuition"
    >
      {activity.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No activity yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {activity.map((item, index) => {
            const config = ACTIVITY_CONFIG[item.type];
            const Icon = config.icon;
            return (
              <div key={item.id}>
                <div className="flex items-start gap-3 py-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      config.className
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {index < activity.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
