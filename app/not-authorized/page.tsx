'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotAuthorized() {
  const supabase = createClient()
  useEffect(() => { supabase.auth.signOut() }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: '40px 40px', opacity: 0.3,
      }} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.4s ease both' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--danger-dim)', border: '1px solid rgba(224,92,92,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 20px',
        }}>🚫</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          Your account doesn't have superadmin privileges.<br />
          Signing you out automatically…
        </p>
        <a href="/api/signout" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text)', fontSize: 13, fontWeight: 600,
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
        >
          ← Try a different account
        </a>
      </div>
    </div>
  )
}
