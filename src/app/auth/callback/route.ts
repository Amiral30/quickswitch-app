import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (err) {
              // The setAll method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Build the redirect URL
  const origin = requestUrl.origin

  // We pass the redirect path as a query param from the client
  // It was stored in the localStorage before initiating OAuth
  // Since server-side can't read localStorage, we redirect to a client page
  // that reads localStorage and redirects to the right page
  return NextResponse.redirect(`${origin}/auth/redirect`)
}
