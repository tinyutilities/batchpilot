// lib/mock/teacher.ts

import { USE_DEMO_DATA } from "@/lib/config";
import type { TeacherSettings } from "@/types/teacher";

const DEMO_TEACHER_SETTINGS: TeacherSettings = {
  profile: {
    fullName: "Kavita Sharma",
    email: "kavita.sharma@example.com",
    phone: "9876543200",
    designation: "Founder & Tutor",
  },
  institute: {
    name: "Bright Minds Tuition Center",
    address: "12 MG Road",
    city: "Bhubaneswar",
    state: "Odisha",
    pincode: "751001",
    contactNumber: "9876543200",
    website: "",
  },
  preferences: {
    emailNotifications: true,
    autoReports: false,
    teachesUnderInstitute: true,
  },
};

const EMPTY_TEACHER_SETTINGS: TeacherSettings = {
  profile: { fullName: "", email: "", phone: "", designation: "" },
  institute: {
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactNumber: "",
    website: "",
  },
  preferences: {
    emailNotifications: true,
    autoReports: false,
    teachesUnderInstitute: false,
  },
};

let teacherSettings: TeacherSettings = USE_DEMO_DATA
  ? DEMO_TEACHER_SETTINGS
  : EMPTY_TEACHER_SETTINGS;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

// React's useSyncExternalStore subscription API — lets components outside
// the Settings page (dashboard greeting, sidebar) re-render live when
// settings are saved, without pulling in a state-management dependency.
export function subscribeTeacherSettings(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTeacherSettingsSnapshot(): TeacherSettings {
  return teacherSettings;
}

export function updateTeacherProfile(
  patch: Partial<TeacherSettings["profile"]>,
) {
  teacherSettings = {
    ...teacherSettings,
    profile: { ...teacherSettings.profile, ...patch },
  };
  notify();
}

export function updateInstituteProfile(
  patch: Partial<TeacherSettings["institute"]>,
) {
  teacherSettings = {
    ...teacherSettings,
    institute: { ...teacherSettings.institute, ...patch },
  };
  notify();
}

export function updateTeacherPreferences(
  patch: Partial<TeacherSettings["preferences"]>,
) {
  teacherSettings = {
    ...teacherSettings,
    preferences: { ...teacherSettings.preferences, ...patch },
  };
  notify();
}

export function getTeacherInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function getTeacherFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
