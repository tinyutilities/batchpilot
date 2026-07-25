// lib/admin/access.ts
//
// Admin route protection.
//
// TEMPORARY: until `Teacher.role` (see `prisma/schema.prisma`) is wired up
// to the authenticated Supabase user, admin access is gated by a single
// hardcoded email rather than a real role lookup. This is enforced in
// `lib/supabase/middleware.ts`'s `updateSession`, which calls
// `isAuthorizedAdminEmail` for any request under `/admin` once a user is
// known to be authenticated.
//
// This is intentionally isolated to one function so the swap to real
// role-based authorization is a one-line change at the call site: replace
// `isAuthorizedAdminEmail(user.email)` with `isAdminRole(teacher.role)`
// once Prisma/Supabase are wired together and the authenticated user's
// `Teacher` record (and its `role: Role` field) can be looked up.

const TEMP_ADMIN_EMAIL = "anushkakar9305@gmail.com";

/**
 * Temporary stand-in for role-based admin authorization. Returns true only
 * for the single hardcoded owner email above.
 */
export function isAuthorizedAdminEmail(
  email: string | null | undefined
): boolean {
  return email === TEMP_ADMIN_EMAIL;
}

/**
 * Future check, once `Teacher.role` is queryable for the authenticated
 * user. Not called anywhere yet — see the module comment above.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN";
}
