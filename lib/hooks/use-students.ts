"use client";

import useSWR from "swr";
import { fetchStudents } from "@/server/students/actions";
import type { Student } from "@/types/student";

export function useStudents(fallbackData: Student[]) {
  const { data, mutate, isLoading } = useSWR<Student[]>("students", fetchStudents, {
    // fallbackData is this request's server-rendered result — trust it
    // instead of immediately re-fetching on mount. Explicit mutate() calls
    // still work; this only disables automatic mount/focus/reconnect refetch.
    fallbackData,
    revalidateIfStale: false,
  });

  return { students: data ?? fallbackData, mutate, isLoading };
}
