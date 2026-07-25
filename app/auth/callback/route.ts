import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { provisionTeacher } from '@/server/auth/provision-teacher'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  // Google redirects here with `?error=` (e.g. access_denied) instead of
  // `?code=` when the user cancels consent or the provider rejects the request.
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (data.user) {
        await provisionTeacher(data.user)
      }

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