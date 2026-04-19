import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Users ({users?.length ?? 0})</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #222' }}>
            {['Name', 'ID', 'Superadmin', 'Joined'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#888', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users?.map((u: any) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <td style={{ padding: '10px 12px', fontSize: 13 }}>
                {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : '—'}
              </td>
              <td style={{ padding: '10px 12px', fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
                {u.id?.slice(0, 8)}…
              </td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: u.is_superadmin ? 'rgba(232,197,71,0.15)' : '#1a1a1a', color: u.is_superadmin ? '#e8c547' : '#666' }}>
                  {u.is_superadmin ? 'YES' : 'NO'}
                </span>
              </td>
              <td style={{ padding: '10px 12px', fontSize: 11, color: '#666' }}>
                {u.created_datetime_utc ? new Date(u.created_datetime_utc).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}