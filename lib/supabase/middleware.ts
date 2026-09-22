import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedAdminEmail } from "@/lib/admin/access";

export async function updateSession(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );

            supabaseResponse = NextResponse.next({
              request,
            });

            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth"];

    const isPublicRoute = publicRoutes.some(
      (route) =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith(`${route}/`)
    );

    // TEMP DIAGNOSTIC — names only, never values. Shows exactly what
    // arrived on this request and whether Supabase considers it a valid
    // session, specifically for the request immediately following the
    // /auth/callback redirect (e.g. the first /dashboard request).
    if (!isPublicRoute) {
      const incomingCookieNames = request.cookies.getAll().map((c) => c.name);
      console.log("[middleware] session check", {
        pathname: request.nextUrl.pathname,
        cookieNames: incomingCookieNames,
        hasSbAuthCookie: incomingCookieNames.some((n) => n.startsWith("sb-")),
        hasUser: Boolean(user),
        getUserError: getUserError
          ? { name: getUserError.name, status: getUserError.status, message: getUserError.message }
          : null,
      });
    }

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    const isAdminRoute =
      request.nextUrl.pathname === "/admin" ||
      request.nextUrl.pathname.startsWith("/admin/");

    if (user && isAdminRoute && !isAuthorizedAdminEmail(user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
}