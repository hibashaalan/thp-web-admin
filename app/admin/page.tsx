import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalImages },
    { count: totalCaptions },
    { count: totalVotes },
    { data: recentVotes },
    { data: topCaptionVotes },
    { data: votesByDay },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('vote_value, created_datetime_utc, captions(content)').order('created_datetime_utc', { ascending: false }).limit(6),
    supabase.from('caption_votes').select('caption_id, vote_value, captions(content, images(url))').eq('vote_value', 1).limit(300),
    supabase.from('caption_votes').select('created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(500),
  ])

  const captionMap: Record<string, { content: string, url: string | null, count: number }> = {}
  topCaptionVotes?.forEach((v: any) => {
    const id = v.caption_id
    if (!captionMap[id]) captionMap[id] = { content: v.captions?.content || '', url: v.captions?.images?.url || null, count: 0 }
    captionMap[id].count++
  })
  const top5 = Object.values(captionMap).sort((a, b) => b.count - a.count).slice(0, 5)

  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  votesByDay?.forEach((v: any) => {
    const day = v.created_datetime_utc?.slice(0, 10)
    if (day && dayMap[day] !== undefined) dayMap[day]++
  })
  const days = Object.entries(dayMap)
  const maxDay = Math.max(...days.map(([, c]) => c), 1)

  const funnyCount = recentVotes?.filter((v: any) => v.vote_value === 1).length ?? 0
  const mehCount = recentVotes?.filter((v: any) => v.vote_value === -1).length ?? 0

  const stats = [
    { label: 'Users', value: totalUsers ?? 0, icon: '◉', color: 'var(--blue)', bg: 'var(--blue-dim)', href: '/admin/users' },
    { label: 'Images', value: totalImages ?? 0, icon: '◧', color: 'var(--accent)', bg: 'var(--accent-dim)', href: '/admin/images' },
    { label: 'Captions', value: totalCaptions ?? 0, icon: '◫', color: 'var(--purple)', bg: 'var(--purple-dim)', href: '/admin/captions' },
    { label: 'Total Votes', value: totalVotes ?? 0, icon: '♥', color: 'var(--success)', bg: 'var(--success-dim)', href: '/admin' },
  ]

  return (
    <div style={{ padding: '32px', animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(({ label, value, icon, color, bg, href }) => (
          <Link key={label} href={href} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px', display: 'block', textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color }}>{icon}</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>
              {value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>View all →</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Vote Activity</h2>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>Last 7 days</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
            {days.map(([day, count]) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, color: count > 0 ? 'var(--text-mid)' : 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{count || ''}</div>
                <div style={{
                  width: '100%', borderRadius: 5,
                  height: `${Math.max((count / maxDay) * 64, 3)}px`,
                  background: count > 0 ? 'linear-gradient(to top, var(--accent), rgba(232,197,71,0.5))' : 'var(--surface3)',
                }} />
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                  {new Date(day + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Sentiment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(232,197,71,0.15)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>{funnyCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>♥ Funny</div>
            </div>
            <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(224,92,92,0.15)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--danger)', fontFamily: 'DM Mono, monospace' }}>{mehCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>✕ Meh</div>
            </div>
          </div>
          <div style={{ height: 5, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${funnyCount + mehCount > 0 ? (funnyCount / (funnyCount + mehCount)) * 100 : 50}%`,
              background: 'linear-gradient(90deg, var(--accent), rgba(232,197,71,0.6))',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--text-muted)' }}>
            <span>♥ funny</span><span>✕ meh</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Top Voted Captions</h2>
          {top5.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No data yet</p>}
          {top5.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < top5.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'DM Mono, monospace', minWidth: 20, fontWeight: 700 }}>#{i + 1}</span>
              {c.url && <img src={c.url} alt="" style={{ width: 30, height: 30, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />}
              <p style={{ fontSize: 12, flex: 1, color: 'var(--text-mid)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{c.content}</p>
              <span style={{ fontSize: 11, color: 'var(--success)', fontFamily: 'DM Mono, monospace', fontWeight: 700, flexShrink: 0 }}>{c.count}♥</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h2>
          <div style={{ display: 'grid', gap: 6 }}>
            {recentVotes?.map((v: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 7 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                  background: v.vote_value === 1 ? 'var(--accent-dim)' : 'var(--danger-dim)',
                  color: v.vote_value === 1 ? 'var(--accent)' : 'var(--danger)',
                }}>
                  {v.vote_value === 1 ? '♥' : '✕'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-mid)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(v.captions as any)?.content}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>
                  {v.created_datetime_utc ? new Date(v.created_datetime_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
