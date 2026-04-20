'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ResourceMode = 'read' | 'crud' | 'single-update'

type ResourceDataPageProps = {
  title: string
  table: string
  tableCandidates?: string[]
  mode: ResourceMode
  idField?: string
  description?: string
  limit?: number
}

type RowRecord = Record<string, unknown>

function inferIdentity(row: RowRecord, explicitIdField?: string): { key: string, value: string | number } | null {
  const candidates = [
    explicitIdField,
    'id',
    'uuid',
    'email',
    'domain',
    ...Object.keys(row).filter((k) => k.endsWith('_id')),
  ].filter(Boolean) as string[]

  for (const key of candidates) {
    const value = row[key]
    if (typeof value === 'string' || typeof value === 'number') {
      return { key, value }
    }
  }

  return null
}

function parseJsonObject(value: string): RowRecord {
  const parsed = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON must be an object.')
  }
  return parsed as RowRecord
}

function toPreview(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function isMissingTableError(error: { message?: string, code?: string } | null): boolean {
  if (!error) return false
  if (error.code === 'PGRST205') return true
  return (error.message || '').toLowerCase().includes('could not find the table')
}

export default function ResourceDataPage({
  title,
  table,
  tableCandidates,
  mode,
  idField,
  description,
  limit = 200,
}: ResourceDataPageProps) {
  const supabase = createClient()

  const [rows, setRows] = useState<RowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createJson, setCreateJson] = useState('{}')
  const [editKey, setEditKey] = useState<string | null>(null)
  const [editJson, setEditJson] = useState('{}')
  const [singleJson, setSingleJson] = useState('{}')
  const [activeTable, setActiveTable] = useState(table)
  const [tableOverrideInput, setTableOverrideInput] = useState('')
  const [tableOverride, setTableOverride] = useState<string | null>(null)

  const candidateTables = useMemo(
    () => Array.from(new Set([tableOverride, table, ...(tableCandidates || [])].filter(Boolean) as string[])),
    [table, tableCandidates, tableOverride],
  )

  const canCreate = mode === 'crud'
  const canUpdate = mode === 'crud' || mode === 'single-update'
  const canDelete = mode === 'crud'

  const load = async () => {
    setLoading(true)
    setError(null)

    for (const tableName of candidateTables) {
      const { data, error: loadError } = await supabase
        .from(tableName)
        .select('*')
        .limit(limit)

      if (!loadError) {
        const nextRows = (data as RowRecord[]) || []
        setActiveTable(tableName)
        setRows(nextRows)
        if (mode === 'single-update' && nextRows[0]) {
          setSingleJson(JSON.stringify(nextRows[0], null, 2))
        }

        setLoading(false)
        return
      }

      if (!isMissingTableError(loadError)) {
        setRows([])
        setActiveTable(tableName)
        setError(loadError.message)
        setLoading(false)
        return
      }

    }

    setRows([])
    setActiveTable(table)
    setError(`No matching table found. Tried: ${candidateTables.join(', ')}`)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [table, candidateTables.join('|')])

  const rowColumns = useMemo(() => {
    const keys = new Set<string>()
    rows.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)))
    return Array.from(keys)
  }, [rows])

  const createRow = async () => {
    try {
      setWorking(true)
      setError(null)
      const payload = parseJsonObject(createJson)
      const { error: createError } = await supabase.from(activeTable).insert(payload)
      if (createError) throw createError
      setCreateJson('{}')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create row.')
    } finally {
      setWorking(false)
    }
  }

  const saveEdit = async (row: RowRecord) => {
    try {
      setWorking(true)
      setError(null)
      const identity = inferIdentity(row, idField)
      if (!identity) throw new Error('Could not infer an id field for update.')

      const payload = parseJsonObject(editJson)
      delete payload[identity.key]

      const { error: updateError } = await supabase
        .from(activeTable)
        .update(payload)
        .eq(identity.key, identity.value)

      if (updateError) throw updateError

      setEditKey(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update row.')
    } finally {
      setWorking(false)
    }
  }

  const removeRow = async (row: RowRecord) => {
    if (!confirm('Delete this row?')) return

    try {
      setWorking(true)
      setError(null)
      const identity = inferIdentity(row, idField)
      if (!identity) throw new Error('Could not infer an id field for delete.')

      const { error: deleteError } = await supabase
        .from(activeTable)
        .delete()
        .eq(identity.key, identity.value)

      if (deleteError) throw deleteError
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete row.')
    } finally {
      setWorking(false)
    }
  }

  const updateSingleRow = async () => {
    if (!rows[0]) {
      setError('No row found to update.')
      return
    }

    try {
      setWorking(true)
      setError(null)

      const identity = inferIdentity(rows[0], idField)
      if (!identity) throw new Error('Could not infer an id field for update.')

      const payload = parseJsonObject(singleJson)
      delete payload[identity.key]

      const { error: updateError } = await supabase
        .from(activeTable)
        .update(payload)
        .eq(identity.key, identity.value)

      if (updateError) throw updateError
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update row.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div style={{ padding: 24, display: 'grid', gap: 14 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Table: {activeTable} • {rows.length} loaded
        </p>
        {activeTable !== table && (
          <p style={{ fontSize: 11, color: 'var(--blue)', marginTop: 4 }}>
            Resolved from fallback list. Requested table was {table}.
          </p>
        )}
        {description && <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 6 }}>{description}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={tableOverrideInput}
          onChange={(e) => setTableOverrideInput(e.target.value)}
          placeholder="Optional table override (e.g. humor_settings)"
          style={{
            minWidth: 280,
            padding: '7px 10px',
            borderRadius: 8,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 12,
          }}
        />
        <button
          type="button"
          onClick={() => {
            const next = tableOverrideInput.trim()
            setTableOverride(next || null)
          }}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 12,
          }}
        >
          Apply override
        </button>
        {tableOverride && (
          <button
            type="button"
            onClick={() => {
              setTableOverride(null)
              setTableOverrideInput('')
            }}
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-mid)',
              fontSize: 12,
            }}
          >
            Clear override
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={load}
          disabled={loading || working}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 12,
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <Link
          href="/admin"
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-mid)',
            fontSize: 12,
          }}
        >
          Back to dashboard
        </Link>
      </div>

      {error && (
        <div style={{
          border: '1px solid rgba(224,92,92,0.4)',
          background: 'var(--danger-dim)',
          color: 'var(--danger)',
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {canCreate && (
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Create row</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            Enter a JSON object with the columns you want to create.
          </p>
          <textarea
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid var(--border-light)',
              color: 'var(--text)',
              borderRadius: 8,
              padding: 10,
              fontFamily: 'DM Mono, monospace',
              fontSize: 12,
            }}
          />
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={createRow}
              disabled={loading || working}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                background: 'var(--accent)',
                border: 'none',
                color: '#000',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {working ? 'Working...' : 'Create'}
            </button>
          </div>
        </section>
      )}

      {mode === 'single-update' && (
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Update configuration row</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            This section updates the first row returned from {activeTable}.
          </p>
          <textarea
            value={singleJson}
            onChange={(e) => setSingleJson(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid var(--border-light)',
              color: 'var(--text)',
              borderRadius: 8,
              padding: 10,
              fontFamily: 'DM Mono, monospace',
              fontSize: 12,
            }}
          />
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={updateSingleRow}
              disabled={loading || working || rows.length === 0}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                background: 'var(--accent)',
                border: 'none',
                color: '#000',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {working ? 'Working...' : 'Update'}
            </button>
          </div>
        </section>
      )}

      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>Rows</h2>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
          Columns detected: {rowColumns.length > 0 ? rowColumns.join(', ') : 'none yet'}
        </p>

        {rows.length === 0 && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No rows found or inaccessible for this table.</p>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((row, index) => {
            const identity = inferIdentity(row, idField)
            const identityLabel = identity ? `${identity.key}: ${String(identity.value)}` : `row-${index + 1}`
            const currentEditKey = identity ? `${identity.key}:${String(identity.value)}` : null
            const editing = !!currentEditKey && currentEditKey === editKey

            return (
              <div key={currentEditKey || index} style={{ border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface2)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 10px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text-mid)' }}>
                    {identityLabel}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {canUpdate && mode === 'crud' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditKey(currentEditKey)
                          setEditJson(JSON.stringify(row, null, 2))
                        }}
                        disabled={working || !identity}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 7,
                          border: '1px solid var(--border-light)',
                          background: 'transparent',
                          color: 'var(--text-mid)',
                          fontSize: 11,
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => removeRow(row)}
                        disabled={working || !identity}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 7,
                          border: '1px solid rgba(224,92,92,0.4)',
                          background: 'transparent',
                          color: 'var(--danger)',
                          fontSize: 11,
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {editing ? (
                  <div style={{ padding: 10 }}>
                    <textarea
                      value={editJson}
                      onChange={(e) => setEditJson(e.target.value)}
                      rows={9}
                      style={{
                        width: '100%',
                        background: '#0d0d10',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text)',
                        borderRadius: 8,
                        padding: 10,
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 12,
                      }}
                    />
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => saveEdit(row)}
                        disabled={working}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 7,
                          border: 'none',
                          background: 'var(--accent)',
                          color: '#000',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {working ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditKey(null)}
                        disabled={working}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 7,
                          border: '1px solid var(--border-light)',
                          background: 'transparent',
                          color: 'var(--text-mid)',
                          fontSize: 12,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 10, fontSize: 12, color: 'var(--text-mid)' }}>
                    <div style={{ marginBottom: 7 }}>
                      {Object.entries(row).slice(0, 4).map(([key, value]) => (
                        <div key={key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{key}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toPreview(value)}</span>
                        </div>
                      ))}
                    </div>
                    <details>
                      <summary style={{ cursor: 'pointer', color: 'var(--blue)' }}>View full row JSON</summary>
                      <pre style={{
                        marginTop: 8,
                        background: '#0d0d10',
                        border: '1px solid var(--border-light)',
                        borderRadius: 8,
                        padding: 10,
                        overflowX: 'auto',
                        fontSize: 11,
                      }}>
                        {JSON.stringify(row, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
