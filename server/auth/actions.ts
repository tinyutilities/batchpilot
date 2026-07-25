'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// Returns a result object instead of throwing/redirecting — this is called
// directly from a client event handler, and `redirect()` thrown from a
// server action invoked that way needs to unwind back through the client's
// try/catch untouched for Next.js to actually perform the navigation. The
// client does its own `router.push()` on success instead.
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { error: error?.message ?? null }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  return { error: error?.message ?? null }
}

export async function signOut(): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  return { error: error?.message ?? null }
}