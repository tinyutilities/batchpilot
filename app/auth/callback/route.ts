import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  // Google redirects here with `?error=` (e.g. access_denied) instead of
  // `?code=` when the user cancels consent or the provider rejects the request.
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error')

  // TEMP DEBUG LOGGING — remove after diagnosing SSL redirect issue
  console.log('[auth/callback DEBUG] request.url:', request.url)
  console.log('[auth/callback DEBUG] origin:', origin)
  console.log('[auth/callback DEBUG] NODE_ENV:', process.env.NODE_ENV)
  console.log('[auth/callback DEBUG] forwardedHost (raw header):', request.headers.get('x-forwarded-host'))
  console.log('[auth/callback DEBUG] next:', next)
  // END TEMP DEBUG LOGGING

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let finalUrl: string
      if (isLocalEnv) {
        finalUrl = `${origin}${next}`
      } else if (forwardedHost) {
        finalUrl = `https://${forwardedHost}${next}`
      } else {
        finalUrl = `${origin}${next}`
      }
      // TEMP DEBUG LOGGING — remove after diagnosing SSL redirect issue
      console.log('[auth/callback DEBUG] final redirect URL:', finalUrl)
      // END TEMP DEBUG LOGGING
      return NextResponse.redirect(finalUrl)
    }

    // exchangeCodeForSession() returns an AuthError (often an AuthApiError),
    // which carries `name`/`code`/`status` alongside `message` — surface all
    // of them instead of just `message`, which GoTrue truncates/summarizes.
    const errorDetails = `${error.name} (status: ${error.status ?? 'n/a'}, code: ${error.code ?? 'n/a'}): ${error.message}`

    console.error('[auth/callback] exchangeCodeForSession failed:', {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
    })

    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDetails)}`
    )
  }

  return NextResponse.redirect(
    `${origin}/auth/login${oauthError ? `?error=${encodeURIComponent(oauthError)}` : ''}`
  )
}