import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const providerError = searchParams.get('error')
  const providerErrorDescription = searchParams.get('error_description')

  if (providerError) {
    const message = providerErrorDescription || providerError
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Missing OAuth code.')}`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  } catch {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not complete sign in. Please try again.')}`)
  }

  return NextResponse.redirect(`${origin}/admin`)
}