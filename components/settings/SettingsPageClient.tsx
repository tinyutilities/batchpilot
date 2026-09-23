"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Building2,
  SlidersHorizontal,
  Bell,
  ShieldCheck,
  Download,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/branding/logo";
import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import { getTeacherInitials } from "@/lib/calculations/teacher";
import {
  updateInstituteProfile,
  updateTeacherPreferences,
  updateTeacherProfile,
} from "@/server/teacher/actions";
import { signOut } from "@/server/auth/actions";
import type {
  InstituteProfile,
  TeacherPreferences,
  TeacherProfile,
  TeacherSettings,
} from "@/types/teacher";

type SettingsSection =
  | "profile"
  | "institute"
  | "preferences"
  | "notifications"
  | "security"
  | "about";

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "institute", label: "Institute", icon: Building2 },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "about", label: "About", icon: Info },
];

interface SettingsPageClientProps {
  initialSettings: TeacherSettings;
}

export default function SettingsPageClient({
  initialSettings,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [settings, setSettings] = useState<TeacherSettings>(initialSettings);
  const showInstitute = settings.preferences.teachesUnderInstitute;
  const visibleNavItems = navItems.filter(
    (item) => item.id !== "institute" || showInstitute,
  );

  // resolvedTheme is undefined until after hydration, so the Switch simply
  // renders unchecked for that one frame instead of guessing — no separate
  // "mounted" flag needed.
  const { resolvedTheme, setTheme } = useTheme();
  const { canInstall, promptInstall } = useInstallPrompt();

  const [profile, setProfile] = useState<TeacherProfile>(settings.profile);
  const [institute, setInstitute] = useState<InstituteProfile>(
    settings.institute,
  );
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function togglePreference(key: keyof TeacherPreferences) {
    const nextValue = !settings.preferences[key];
    const nextPreferences = { ...settings.preferences, [key]: nextValue };
    setSettings((prev) => ({ ...prev, preferences: nextPreferences }));
    await updateTeacherPreferences({ [key]: nextValue });
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateTeacherProfile(profile);
    setSettings((prev) => ({ ...prev, profile }));
    toast.success("Profile updated.");
  }

  async function handleInstituteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateInstituteProfile(institute);
    setSettings((prev) => ({ ...prev, institute }));
    toast.success("Institute details updated.");
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    const { error } = await signOut();

    if (error) {
      toast.error(error);
      setIsSigningOut(false);
      return;
    }

    router.push("/auth/login");
    router.refresh();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <DashboardCard title="Settings" className="h-fit p-2">
          <nav
            aria-label="Settings sections"
            className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
          >
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    const targetId =
                      item.id === "notifications" ? "preferences" : item.id;
                    document
                      .getElementById(targetId)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </DashboardCard>

        <div className="flex flex-col gap-6">
          <div id="profile" className="scroll-mt-6">
            <DashboardCard
              title="Profile Information"
              description="Update your personal details."
              className="p-6"
            >
              <form
                onSubmit={handleProfileSubmit}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary-soft text-lg font-medium text-primary">
                      {getTeacherInitials(profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      Profile photo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Shown as your initials until a photo upload is added.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      className="h-11 rounded-xl"
                      value={profile.fullName}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="h-11 rounded-xl"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="h-11 rounded-xl"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      name="designation"
                      autoComplete="organization-title"
                      className="h-11 rounded-xl"
                      value={profile.designation}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          designation: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setProfile(settings.profile)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl">
                    Save Changes
                  </Button>
                </div>
              </form>
            </DashboardCard>
          </div>

          {showInstitute && (
          <div id="institute" className="scroll-mt-6">
            <DashboardCard
              title="Institute Information"
              description="Details shown on receipts and reports."
              className="p-6"
            >
              <form
                onSubmit={handleInstituteSubmit}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input
                      id="instituteName"
                      name="instituteName"
                      autoComplete="organization"
                      className="h-11 rounded-xl"
                      value={institute.name}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      autoComplete="street-address"
                      className="h-11 rounded-xl"
                      value={institute.address}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      autoComplete="address-level2"
                      className="h-11 rounded-xl"
                      value={institute.city}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      autoComplete="address-level1"
                      className="h-11 rounded-xl"
                      value={institute.state}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      autoComplete="postal-code"
                      className="h-11 rounded-xl"
                      value={institute.pincode}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      autoComplete="tel"
                      className="h-11 rounded-xl"
                      value={institute.contactNumber}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          contactNumber: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      autoComplete="url"
                      className="h-11 rounded-xl"
                      value={institute.website}
                      onChange={(e) =>
                        setInstitute((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setInstitute(settings.institute)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl">
                    Save Changes
                  </Button>
                </div>
              </form>
            </DashboardCard>
          </div>
          )}

          <div id="preferences" className="scroll-mt-6">
            <DashboardCard
              title="Preferences"
              description="Control how the application looks and notifies you."
              className="p-6"
            >
              <div className="flex flex-col divide-y divide-border">
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a dark theme across the application.
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={resolvedTheme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="emailNotifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates by email.
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.preferences.emailNotifications}
                    onCheckedChange={() =>
                      togglePreference("emailNotifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="autoReports">
                      Automatic Report Generation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Generate monthly reports automatically.
                    </p>
                  </div>
                  <Switch
                    id="autoReports"
                    checked={settings.preferences.autoReports}
                    onCheckedChange={() => togglePreference("autoReports")}
                  />
                </div>

                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="teachesUnderInstitute">
                      I teach under an institute
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show Institute Information in Settings, for details
                      shown on receipts and reports.
                    </p>
                  </div>
                  <Switch
                    id="teachesUnderInstitute"
                    checked={settings.preferences.teachesUnderInstitute}
                    onCheckedChange={() =>
                      togglePreference("teachesUnderInstitute")
                    }
                  />
                </div>

                {canInstall && (
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-0.5">
                      <Label>Install BatchPilot</Label>
                      <p className="text-sm text-muted-foreground">
                        Add BatchPilot to this device for quick, full-screen
                        access.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 rounded-xl"
                      onClick={promptInstall}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Install
                    </Button>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

          <div id="security" className="scroll-mt-6">
            <DashboardCard
              title="Security"
              description="Manage your password and session."
              className="p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="rounded-xl">
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                  className="rounded-xl"
                >
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </DashboardCard>
          </div>

          <div id="about" className="scroll-mt-6">
            <DashboardCard title="About BatchPilot" className="p-6">
              <div className="flex flex-col items-center gap-6 py-2 text-center">
                <Logo size={40} />

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    Version 1.0
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Made with ❤️ by Anushka Kar
                  </p>
                  <p className="text-sm text-muted-foreground">© 2026</p>
                </div>

                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Designed and developed by Anushka Kar. BatchPilot is a
                  lightweight tuition management platform built for tutors,
                  coaching centres and educators. The application focuses on
                  simplicity, speed and ease of use.
                </p>

                <p className="text-xs text-muted-foreground">
                  TinyUtility © 2026
                </p>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
