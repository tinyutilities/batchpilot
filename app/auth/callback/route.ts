import { NextResponse, type NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { provisionTeacher } from '@/server/auth/provision-teacher'

// TEMP DEBUG LOGGING — instrumentation only, no behavior change. Every step
// is wrapped so the terminal shows exactly which line throws; each catch
// logs full detail then rethrows (does not swallow) so the resulting 500
// (or existing error-redirect behavior) is unchanged.
export async function GET(request: NextRequest) {
  console.log('[auth/callback] START callback')

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  // Google redirects here with `?error=` (e.g. access_denied) instead of
  // `?code=` when the user cancels consent or the provider rejects the request.
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error')

  console.log('[auth/callback] params', {
    hasCode: Boolean(code),
    next,
    oauthError,
    origin,
  })

  if (code) {
    const supabase = await createClient()

    console.log('[auth/callback] -> exchangeCodeForSession()')
    let data: Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>['data']
    let error: Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>['error']
    try {
      const result = await supabase.auth.exchangeCodeForSession(code)
      data = result.data
      error = result.error
      console.log('[auth/callback] SUCCESS exchangeCodeForSession (no throw)', {
        hasUser: Boolean(data.user),
        userId: data.user?.id,
        email: data.user?.email,
        gotrueError: error
          ? { name: error.name, status: error.status, code: error.code, message: error.message }
          : null,
      })
    } catch (err) {
      console.error('[auth/callback] THREW exchangeCodeForSession()')
      console.error('[auth/callback] Supabase/exchangeCodeForSession error object:', err)
      if (err instanceof Error) {
        console.error('[auth/callback] stack:', err.stack)
      }
      throw err // do NOT swallow
    }

    if (!error) {
      if (data.user) {
        console.log('[auth/callback] -> provisionTeacher()', {
          userId: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        })
        try {
          const teacher = await provisionTeacher(data.user)
          console.log('[auth/callback] SUCCESS provisionTeacher', {
            teacherId: teacher.id,
            teacherEmail: teacher.email,
          })
        } catch (err) {
          console.error('[auth/callback] THREW provisionTeacher()')
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('[auth/callback] Prisma known request error:', {
              code: err.code,
              meta: err.meta,
              message: err.message,
              clientVersion: err.clientVersion,
            })
          } else if (err instanceof Prisma.PrismaClientValidationError) {
            console.error('[auth/callback] Prisma validation error:', err.message)
          } else if (err instanceof Prisma.PrismaClientInitializationError) {
            console.error('[auth/callback] Prisma initialization error:', {
              errorCode: err.errorCode,
              message: err.message,
            })
          } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
            console.error('[auth/callback] Prisma unknown request error:', err.message)
          } else {
            console.error('[auth/callback] Non-Prisma error from provisionTeacher:', err)
          }
          if (err instanceof Error) {
            console.error('[auth/callback] stack:', err.stack)
          }
          throw err // do NOT swallow
        }
      } else {
        console.log('[auth/callback] SKIP provisionTeacher (data.user is null)')
      }

      console.log('[auth/callback] -> redirect() generation')
      try {
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

        console.log('[auth/callback] computed finalUrl', {
          isLocalEnv,
          forwardedHost,
          finalUrl,
        })

        const response = NextResponse.redirect(finalUrl)
        console.log('[auth/callback] SUCCESS redirect (response constructed)')
        return response
      } catch (err) {
        console.error('[auth/callback] THREW during redirect() generation')
        console.error('[auth/callback] error object:', err)
        if (err instanceof Error) {
          console.error('[auth/callback] stack:', err.stack)
        }
        throw err // do NOT swallow
      }
    }

    // exchangeCodeForSession() returns an AuthError (often an AuthApiError),
    // which carries `name`/`code`/`status` alongside `message` — surface all
    // of them instead of just `message`, which GoTrue truncates/summarizes.
    const errorDetails = `${error.name} (status: ${error.status ?? 'n/a'}, code: ${error.code ?? 'n/a'}): ${error.message}`

    console.error('[auth/callback] exchangeCodeForSession returned an error (not thrown):', {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
    })

    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDetails)}`
    )
  }

  console.log('[auth/callback] no code param — redirecting to login', { oauthError })

  return NextResponse.redirect(
    `${origin}/auth/login${oauthError ? `?error=${encodeURIComponent(oauthError)}` : ''}`
  )
}
