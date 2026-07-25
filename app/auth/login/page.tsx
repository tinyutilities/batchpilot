"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/branding/logo";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.44 3.58v2.98h3.94c2.31-2.13 3.52-5.27 3.52-8.8z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.94-2.98c-1.09.73-2.5 1.16-3.99 1.16-3.07 0-5.66-2.07-6.59-4.85H1.36v3.04C3.33 21.3 7.36 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.41 14.41c-.24-.73-.38-1.5-.38-2.41s.14-1.68.38-2.41V6.55H1.36A11.96 11.96 0 0 0 0 12c0 1.93.46 3.75 1.36 5.45l4.05-3.04z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.36 0 3.33 2.7 1.36 6.55l4.05 3.04C6.34 6.82 8.93 4.75 12 4.75z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Backend authentication to be added later
  }

  async function handleGoogleSignIn() {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Logo size={40} />

        <PageHeader
          className="text-center sm:flex-col sm:items-center sm:text-center"
          title="Welcome back"
          description="Welcome back! Sign in to manage your classes."
        />

        <Card className="w-full rounded-2xl border-slate-200 shadow-lg transition-shadow duration-200 hover:shadow-xl dark:border-slate-800">
          <CardContent className="p-6 sm:p-8">
            {oauthError && (
              <p className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                {oauthError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl transition-transform duration-200 hover:scale-[1.02]"
              >
                Sign In
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase text-muted-foreground">
                or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl transition-transform duration-200 hover:scale-[1.02]"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon />
              <span className="ml-2">Google Sign In</span>
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
