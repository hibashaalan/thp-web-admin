'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotAuthorized() {
  const supabase = createClient()

  useEffect(() => {
    // Sign them out immediately so they can try a different account
    supabase.auth.signOut()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <h1>Access Denied</h1>
        <p style={{ color: '#888', margin: '12px 0 24px' }}>
          Your account does not have superadmin privileges.
        </p>
        <a href="/login" style={{ padding: '10px 20px', background: '#1a1a1e', border: '1px solid #333', borderRadius: 8, color: '#f0ede8' }}>
          Try a different account →
        </a>
      </div>
    </div>
  )
}