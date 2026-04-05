import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [
    { count: users },
    { count: images },
    { count: captions },
    { count: votes },
    { data: recentVotes },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('vote_value, captions(content)').order('created_datetime_utc', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Users', value: users ?? 0 },
    { label: 'Images', value: images ?? 0 },
    { label: 'Captions', value: captions ?? 0 },
    { label: 'Total Votes', value: votes ?? 0 },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{value.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recent Votes</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {recentVotes?.map((v: any, i: number) => (
          <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: v.vote_value === 1 ? 'rgba(232,197,71,0.15)' : 'rgba(224,92,92,0.12)', color: v.vote_value === 1 ? '#e8c547' : '#e05c5c' }}>
              {v.vote_value === 1 ? '♥ FUNNY' : '✕ MEH'}
            </span>
            <span style={{ fontSize: 12, color: '#ccc' }}>{(v.captions as any)?.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}