"use client";

import useSWR from "swr";
import { fetchStudents } from "@/server/students/actions";
import type { Student } from "@/types/student";

export function useStudents(fallbackData: Student[]) {
  const { data, mutate, isLoading } = useSWR<Student[]>("students", fetchStudents, {
    fallbackData,
  });

  return { students: data ?? fallbackData, mutate, isLoading };
}
