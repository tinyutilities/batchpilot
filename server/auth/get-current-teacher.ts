import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db/prisma";
import { provisionTeacher } from "@/server/auth/provision-teacher";
import type { Teacher } from "@prisma/client";

// Cached per request so every Server Component in the tree that needs the
// current teacher shares one Supabase + Prisma lookup instead of repeating
// it. Falls back to provisioning if no Teacher row exists yet — this is the
// safety net for the email/password sign-in path, which never passes
// through /auth/callback (where provisioning normally happens).
export const getCurrentTeacher = cache(async (): Promise<Teacher | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: user.id },
  });

  return teacher ?? provisionTeacher(user);
});
