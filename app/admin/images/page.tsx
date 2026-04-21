'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const load = async () => {
    setError(null)

    const sortCandidates = ['created_at', 'created_datetime_utc', 'updated_at', 'id']
    for (const column of sortCandidates) {
      const { data, error: loadError } = await supabase
        .from('images')
        .select('*')
        .order(column, { ascending: false })
        .limit(100)

      if (!loadError) {
        setImages(data || [])
        return
      }

      const missingColumn = loadError.message.toLowerCase().includes('does not exist')
      if (!missingColumn) {
        setError(`Could not load images: ${loadError.message}`)
        setImages([])
        return
      }
    }

    const { data, error: fallbackLoadError } = await supabase.from('images').select('*').limit(100)
    if (fallbackLoadError) {
      setError(`Could not load images: ${fallbackLoadError.message}`)
      setImages([])
      return
    }

    setImages(data || [])
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    const url = newUrl.trim()
    if (!url) {
      setError('Please enter an image URL.')
      return
    }
    if (!isValidUrl(url)) {
      setError('Please enter a valid http/https URL.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error: createError } = await supabase.from('images').insert({ url })
    if (createError) {
      setLoading(false)
      setError(`Could not add image: ${createError.message}`)
      return
    }

    setNewUrl('')
    setSuccess('Image added successfully.')
    await load()
    setLoading(false)
  }

  const update = async (id: string) => {
    const url = editUrl.trim()
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid http/https URL before saving.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error: updateError } = await supabase.from('images').update({ url }).eq('id', id)
    if (updateError) {
      setLoading(false)
      setError(`Could not update image: ${updateError.message}`)
      return
    }

    setEditId(null)
    setSuccess('Image updated successfully.')
    await load()
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this image?')) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error: deleteError } = await supabase.from('images').delete().eq('id', id)
    if (deleteError) {
      setLoading(false)
      setError(`Could not delete image: ${deleteError.message}`)
      return
    }

    setSuccess('Image deleted successfully.')
    await load()
    setLoading(false)
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Images ({images.length})</h1>

      {error && (
        <div style={{ marginBottom: 12, padding: '10px 12px', border: '1px solid rgba(224,92,92,0.45)', borderRadius: 8, background: 'rgba(224,92,92,0.1)', color: '#e05c5c', fontSize: 12 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 12, padding: '10px 12px', border: '1px solid rgba(82,214,138,0.45)', borderRadius: 8, background: 'rgba(82,214,138,0.1)', color: '#52d68a', fontSize: 12 }}>
          {success}
        </div>
      )}

      {/* Create */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={newUrl} onChange={e => setNewUrl(e.target.value)}
          placeholder="Image URL..."
          style={{ flex: 1, padding: '8px 12px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#f0ede8', fontSize: 13 }}
        />
        <button disabled={loading} onClick={create} style={{ padding: '8px 16px', background: '#e8c547', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Working...' : 'Add Image'}
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
                <button disabled={loading} onClick={() => update(img.id)} style={{ padding: '6px 12px', background: '#e8c547', color: '#000', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12, opacity: loading ? 0.7 : 1 }}>Save</button>
                <button onClick={() => setEditId(null)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#888', fontSize: 12 }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.url}</span>
                <button onClick={() => { setEditId(img.id); setEditUrl(img.url) }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: 6, color: '#aaa', fontSize: 12 }}>Edit</button>
                <button disabled={loading} onClick={() => remove(img.id)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(224,92,92,0.4)', borderRadius: 6, color: '#e05c5c', fontSize: 12, opacity: loading ? 0.7 : 1 }}>Delete</button>
              </>
            )}
          </div>
        ))}

        {!loading && images.length === 0 && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '14px 16px', color: '#888', fontSize: 12 }}>
            No images yet. Add one with a full URL (example: https://example.com/image.jpg).
          </div>
        )}
      </div>
    </div>
  )
}