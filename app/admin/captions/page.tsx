import { createClient } from '@/lib/supabase/server'

export default async function CaptionsPage() {
  const supabase = await createClient()
  const { data: captions } = await supabase
    .from('captions')
    .select('id, content, created_datetime_utc, images(url)')
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Captions ({captions?.length ?? 0})</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        {captions?.map((c: any) => (
          <div key={c.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
            {c.images?.url && <img src={c.images.url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: '#f0ede8', marginBottom: 4 }}>{c.content}</p>
              <p style={{ fontSize: 11, color: '#666' }}>{new Date(c.created_datetime_utc).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}