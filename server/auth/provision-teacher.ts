import type { User } from "@supabase/supabase-js";
import { prisma } from "@/server/db/prisma";
import type { Teacher } from "@prisma/client";

// Creates the Postgres Teacher row for a Supabase-authenticated user the
// first time we see them, keyed by the Supabase auth user id so every
// downstream query can filter by `teacherId` directly with no email lookup.
// Idempotent — safe to call on every login, not just the first one.
export async function provisionTeacher(user: User): Promise<Teacher> {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  return prisma.teacher.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? "",
      fullName,
    },
  });
}
