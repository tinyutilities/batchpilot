"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bug,
  Settings,
  Menu,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/branding/logo";
import { cn } from "@/lib/utils";

// Structurally mirrors app/dashboard/layout.tsx (same primitives, spacing
// and active-state styling) so the admin section reads as part of the same
// product, not a bolted-on tool — but is kept as its own file rather than
// sharing that component, since the two shells' nav items and footer
// content are permanently different and dashboard/layout.tsx is
// load-bearing for the whole teacher-facing app.
const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Teachers", href: "/admin/teachers", icon: Users },
  { label: "Bug Reports", href: "/admin/bug-reports", icon: Bug },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const navItemBaseStyles =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200";
const navItemActiveStyles =
  "bg-primary-soft text-primary";
const navItemInactiveStyles =
  "text-muted-foreground hover:bg-muted hover:text-foreground";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname?.startsWith(item.href));
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

function AdminFooter() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="truncate text-sm font-medium text-foreground">
            Admin Panel
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Platform owner tools
          </p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full justify-start gap-2 rounded-xl"
      >
        <Link href="/dashboard">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 py-6">
        <Link href="/admin" onClick={onNavigate}>
          <Logo size={32} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 px-3 pb-4">
        <Separator className="mb-4" />
        <AdminFooter />
      </div>
    </div>
  );
}

function MobileHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle admin navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <Link href="/admin">
        <Logo size={28} />
      </Link>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-[280px]">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
