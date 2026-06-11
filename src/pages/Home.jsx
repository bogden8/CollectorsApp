import { useState, useEffect } from 'react'
import { db } from '../db'

function Home({ onNavigate }) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCollections() {
      const result = await db.collections.toArray()
      const filtered = result.filter(col => !col.isDeleted)
      setCollections(filtered)
      setLoading(false)
    }
    loadCollections()
  }, [])

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
  <h1 style={{ fontSize: 22, fontWeight: 500 }}>My Collections</h1>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <button
      onClick={() => onNavigate('exportImport')}
      style={{ background: 'none', border: 'none', fontSize: 13, color: '#999', cursor: 'pointer' }}
    >
      💾 Backup
    </button>
    <button
      onClick={() => onNavigate('trash')}
      style={{ background: 'none', border: 'none', fontSize: 13, color: '#999', cursor: 'pointer' }}
    >
      🗑 Trash
    </button>
    <button
      onClick={() => onNavigate('createCollection')}
      style={{
        background: '#534AB7', color: 'white', border: 'none',
        borderRadius: 8, padding: '8px 14px', fontSize: 14, cursor: 'pointer'
      }}
    >
      + New
    </button>
  </div>
</div>

      {collections.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No collections yet</p>
          <p style={{ fontSize: 14 }}>Tap + New to create your first one</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {collections.map(col => (
          <div
            key={col.id}
            onClick={() => onNavigate('collection', col.id)}
            style={{
              background: 'white', border: '1px solid #eee', borderRadius: 12,
              padding: '16px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 14
            }}
          >

            <span style={{ fontSize: 36 }}>{col.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{col.name}</div>
              <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
                {col.enabledFields.length} fields enabled · {col.currency}
              </div>
            </div>
            <span style={{ color: '#ccc', fontSize: 20 }}>›</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Home