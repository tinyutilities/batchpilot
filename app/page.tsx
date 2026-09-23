import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  Wallet,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Smartphone,
  Tablet,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const features = [
  {
    title: "Student Management",
    description:
      "Manage student profiles, contact details and class assignments.",
    icon: Users,
  },
  {
    title: "Attendance Tracking",
    description: "Record attendance quickly for every batch.",
    icon: ClipboardCheck,
  },
  {
    title: "Fee Management",
    description: "Track paid and pending tuition fees.",
    icon: Wallet,
  },
  {
    title: "Marks & Exams",
    description: "Store and review student performance.",
    icon: GraduationCap,
  },
  {
    title: "Batch Management",
    description: "Organize multiple classes with ease.",
    icon: Layers,
  },
  {
    title: "Teacher Dashboard",
    description: "View everything important from one central dashboard.",
    icon: LayoutDashboard,
  },
];

const highlights = [
  { label: "Mobile Friendly", icon: Smartphone },
  { label: "Tablet Optimized", icon: Tablet },
  { label: "Secure Login", icon: ShieldCheck },
  { label: "Designed for Teachers", icon: BookOpen },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-semibold text-foreground">
            BatchPilot
          </span>
          <Link
            href="/auth/login"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Manage Your Tuition Classes Smarter
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Track students, attendance, batches, fees and exam marks from one
            simple dashboard built specifically for teachers.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/auth/login"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/60"
            >
              Explore Features
            </a>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-foreground">
            Everything You Need to Run Your Tuition Classes
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl bg-background p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-center text-3xl font-bold text-foreground">
              Why Choose BatchPilot
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <div
                    key={highlight.label}
                    className="flex flex-col items-center rounded-2xl bg-card p-8 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <span className="mt-4 text-sm font-medium text-foreground">
                      {highlight.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center">
          <span className="text-sm font-semibold text-foreground">
            BatchPilot
          </span>
          <span className="text-sm text-muted-foreground">© 2026</span>
          <span className="text-sm text-muted-foreground">Built by Anushka Kar</span>
        </div>
      </footer>
    </div>
  );
}