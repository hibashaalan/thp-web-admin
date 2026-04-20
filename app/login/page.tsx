'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) setAuthError(error)
  }, [])

  const signIn = async () => {
    setLoading(true)
    // Clear stale local auth state before starting OAuth to avoid refresh token errors.
    await supabase.auth.signOut({ scope: 'local' })

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.4,
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(232,197,71,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Left — branding */}
      <div style={{
        flex: '0 0 50%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '4rem',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-dim)', border: '1px solid rgba(232,197,71,0.2)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', animation: 'pulse 2s ease infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em' }}>RESTRICTED ACCESS</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            Almost<span style={{ color: 'var(--accent)' }}>Crackd</span><br />
            <span style={{ color: 'var(--text-muted)', fontWeight: 300, fontSize: '0.6em' }}>Admin Panel</span>
          </h1>
          <p style={{ color: 'var(--text-mid)', fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
            Internal tools for managing users, images, captions, and platform analytics.
          </p>

          {/* Stats preview */}
          <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
            {[
              { label: 'Users', value: '2,160+' },
              { label: 'Captions', value: '93K+' },
              { label: 'Votes', value: '22K+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login card */}
      <div style={{
        flex: '0 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 400,
          animation: 'fadeUp 0.5s ease 0.15s both',
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '2.5rem',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
              Sign in to continue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
              Only superadmin accounts can access this panel
            </p>

            {authError && (
              <div style={{
                background: 'var(--danger-dim)',
                border: '1px solid rgba(224,92,92,0.25)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 12, color: 'var(--danger)', lineHeight: 1.45 }}>
                  Sign-in failed: {authError}
                </p>
              </div>
            )}

            <div style={{
              background: 'var(--accent-dim)', border: '1px solid rgba(232,197,71,0.15)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 24,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>🔐</span>
              <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.5 }}>
                Your account must have <code style={{ fontFamily: 'DM Mono', color: 'var(--accent)', fontSize: 11 }}>is_superadmin = true</code> in the profiles table
              </p>
            </div>

            <button
              onClick={signIn}
              disabled={loading}
              style={{
                width: '100%', padding: '13px 16px',
                background: loading ? 'var(--surface2)' : 'var(--text)',
                color: loading ? 'var(--text-muted)' : '#080809',
                border: 'none', borderRadius: 9,
                fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >
              {loading ? (
                <><Spinner /> Redirecting to Google…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return <div style={{ width: 14, height: 14, border: '2px solid #333', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
}
