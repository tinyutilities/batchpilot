"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  CalendarCheck,
  Wallet,
  GraduationCap,
  Settings,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/branding/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Batches", href: "/dashboard/batches", icon: Layers },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { label: "Fees", href: "/dashboard/fees", icon: Wallet },
  { label: "Marks", href: "/dashboard/marks", icon: GraduationCap },
];

const navItemBaseStyles =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200";
const navItemActiveStyles =
  "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400";
const navItemInactiveStyles =
  "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              navItemBaseStyles,
              isActive ? navItemActiveStyles : navItemInactiveStyles,
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

interface ProfileSectionProps {
  teacherName: string;
  teacherEmail: string;
  avatarInitials: string;
}

function ProfileSection({
  teacherName,
  teacherEmail,
  avatarInitials,
}: ProfileSectionProps) {
  const pathname = usePathname();
  const isSettingsActive = pathname?.startsWith("/dashboard/settings");

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/dashboard/settings"
        aria-current={isSettingsActive ? "page" : undefined}
        className={cn(
          navItemBaseStyles,
          isSettingsActive ? navItemActiveStyles : navItemInactiveStyles,
        )}
      >
        <Settings className="h-4 w-4 shrink-0" />
        Settings
      </Link>

      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-indigo-100 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <p className="truncate text-sm font-medium text-foreground">
            {teacherName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {teacherEmail}
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  teacherName,
  teacherEmail,
  avatarInitials,
  onNavigate,
}: ProfileSectionProps & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 py-6">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo size={32} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 px-3 pb-4">
        <Separator className="mb-4" />
        <ProfileSection
          teacherName={teacherName}
          teacherEmail={teacherEmail}
          avatarInitials={avatarInitials}
        />
      </div>
    </div>
  );
}

function MobileHeader(props: ProfileSectionProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent {...props} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <Link href="/dashboard">
        <Logo size={28} />
      </Link>
    </header>
  );
}

interface DashboardShellClientProps extends ProfileSectionProps {
  children: React.ReactNode;
}

export function DashboardShellClient({
  teacherName,
  teacherEmail,
  avatarInitials,
  children,
}: DashboardShellClientProps) {
  const profileProps = { teacherName, teacherEmail, avatarInitials };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        <SidebarContent {...profileProps} />
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-[280px]">
        <MobileHeader {...profileProps} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
