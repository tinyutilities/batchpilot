"use client";

import { useSyncExternalStore } from "react";
import {
  getTeacherSettingsSnapshot,
  subscribeTeacherSettings,
} from "@/lib/mock/teacher";
import type { TeacherSettings } from "@/types/teacher";

export function useTeacherSettings(): TeacherSettings {
  return useSyncExternalStore(
    subscribeTeacherSettings,
    getTeacherSettingsSnapshot,
    getTeacherSettingsSnapshot,
  );
}
