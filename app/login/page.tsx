'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',  // forces Google to always show account picker
        },
      },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>AlmostCrackd Admin</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>Superadmins only</p>
        <button onClick={signIn} style={{ padding: '10px 24px', background: '#f0ede8', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}