'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase.from('images').select('*').order('created_at', { ascending: false }).limit(100)
    setImages(data || [])
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newUrl.trim()) return
    await supabase.from('images').insert({ url: newUrl.trim() })
    setNewUrl('')
    load()
  }

  const update = async (id: string) => {
    await supabase.from('images').update({ url: editUrl }).eq('id', id)
    setEditId(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this image?')) return
    await supabase.from('images').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Images ({images.length})</h1>

      {/* Create */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newUrl} onChange={e => setNewUrl(e.target.value)}
          placeholder="Image URL..."
          style={{ flex: 1, padding: '8px 12px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#f0ede8', fontSize: 13 }}
        />
        <button onClick={create} style={{ padding: '8px 16px', background: '#e8c547', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Add Image
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gap: 8 }}>
        {images.map((img: any) => (
          <div key={img.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <img src={img.url} alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => (e.currentTarget.style.display = 'none')} />
            {editId === img.id ? (
              <>
                <input value={editUrl} onChange={e => setEditUrl(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', background: '#1a1a1e', border: '1px solid #444', borderRadius: 6, color: '#f0ede8', fontSize: 12 }} />
                <button onClick={() => update(img.id)} style={{ padding: '6px 12px', background: '#e8c547', color: '#000', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>Save</button>
                <button onClick={() => setEditId(null)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#888', fontSize: 12 }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.url}</span>
                <button onClick={() => { setEditId(img.id); setEditUrl(img.url) }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#aaa', fontSize: 12 }}>Edit</button>
                <button onClick={() => remove(img.id)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(224,92,92,0.4)', borderRadius: 6, color: '#e05c5c', fontSize: 12 }}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}