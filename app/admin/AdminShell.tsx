'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▦', exact: true },
  { href: '/admin/users', label: 'Users', icon: '◉' },
  { href: '/admin/images', label: 'Images', icon: '◧' },
  { href: '/admin/captions', label: 'Captions', icon: '◫' },
  { href: '/admin/caption-requests', label: 'Caption Requests', icon: '◬' },
  { href: '/admin/humor-flavors', label: 'Humor Flavors', icon: '◍' },
  { href: '/admin/humor-flavor-steps', label: 'Humor Flavor Steps', icon: '◎' },
  { href: '/admin/humor-mix', label: 'Humor Mix', icon: '◌' },
  { href: '/admin/terms', label: 'Terms', icon: '◪' },
  { href: '/admin/caption-examples', label: 'Caption Examples', icon: '◨' },
  { href: '/admin/llm-providers', label: 'LLM Providers', icon: '◔' },
  { href: '/admin/llm-models', label: 'LLM Models', icon: '◕' },
  { href: '/admin/llm-prompt-chains', label: 'LLM Prompt Chains', icon: '◠' },
  { href: '/admin/llm-responses', label: 'LLM Responses', icon: '◡' },
  { href: '/admin/allowed-signup-domains', label: 'Allowed Domains', icon: '◒' },
  { href: '/admin/whitelisted-emails', label: 'Whitelisted Emails', icon: '◓' },
]

export default function AdminShell({ children, user }: { children: React.ReactNode, user: any }) {
  const pathname = usePathname()
  const supabase = createClient()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 'var(--sidebar-w)', flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', lineHeight: 1.2 }}>AlmostCrackd</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>admin panel</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '10px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '6px 8px 8px', textTransform: 'uppercase' }}>Navigation</div>
          {NAV.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 7, marginBottom: 1,
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-mid)',
                fontWeight: active ? 600 : 400, fontSize: 13,
                border: `1px solid ${active ? 'rgba(232,197,71,0.15)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--surface2)'; el.style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--text-mid)' } }}
              >
                <span style={{ fontSize: 15, lineHeight: 1, opacity: active ? 1 : 0.6 }}>{icon}</span>
                {label}
                {active && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />}
              </Link>
            )
          })}
        </nav>

        {/* Profile — no sign out here, it's in the top bar */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0 }} />
              : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface3)', flexShrink: 0 }} />
            }
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em' }}>SUPERADMIN</div>
            </div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 52, borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            thp-web-admin.vercel.app
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface3)' }} />
              }
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em' }}>⚡SUPER</span>
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
              style={{
                padding: '6px 14px', background: 'transparent',
                border: '1px solid var(--border)', color: 'var(--text-muted)',
                borderRadius: 7, fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--danger)'; el.style.color = 'var(--danger)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-muted)' }}
            >
              Sign out
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
