import { useState, useEffect } from 'react'
import { db } from '../db'

function Trash({ onNavigate }) {
  const [deletedCollections, setDeletedCollections] = useState([])
  const [deletedItems, setDeletedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const cols = await db.collections.toArray()
      const items = await db.items.toArray()
      setDeletedCollections(cols.filter(c => c.isDeleted))
      setDeletedItems(items.filter(i => i.isDeleted))
      setLoading(false)
    }
    load()
  }, [])

  async function restoreCollection(col) {
    await db.collections.update(col.id, { isDeleted: false, deletedAt: null })
    const allItems = await db.items.where('collectionId').equals(col.id).toArray()
    for (const item of allItems) {
      await db.items.update(item.id, { isDeleted: false, deletedAt: null })
    }
    setDeletedCollections(prev => prev.filter(c => c.id !== col.id))
    setDeletedItems(prev => prev.filter(i => i.collectionId !== col.id))
  }

  async function restoreItem(item) {
    await db.items.update(item.id, { isDeleted: false, deletedAt: null })
    setDeletedItems(prev => prev.filter(i => i.id !== item.id))
  }

  async function permanentlyDeleteCollection(col) {
    if (!confirm(`Permanently delete "${col.name}"? This cannot be undone.`)) return
    const allItems = await db.items.where('collectionId').equals(col.id).toArray()
    for (const item of allItems) {
      await db.items.delete(item.id)
    }
    await db.collections.delete(col.id)
    setDeletedCollections(prev => prev.filter(c => c.id !== col.id))
    setDeletedItems(prev => prev.filter(i => i.collectionId !== col.id))
  }

  async function permanentlyDeleteItem(item) {
    if (!confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) return
    await db.items.delete(item.id)
    setDeletedItems(prev => prev.filter(i => i.id !== item.id))
  }

  async function emptyTrash() {
    if (!confirm('Permanently delete everything in trash? This cannot be undone.')) return
    for (const col of deletedCollections) {
      const allItems = await db.items.where('collectionId').equals(col.id).toArray()
      for (const item of allItems) await db.items.delete(item.id)
      await db.collections.delete(col.id)
    }
    for (const item of deletedItems) {
      await db.items.delete(item.id)
    }
    setDeletedCollections([])
    setDeletedItems([])
  }

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>

  const isEmpty = deletedCollections.length === 0 && deletedItems.length === 0

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, paddingBottom: 80 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >←</button>
        <h1 style={{ fontSize: 20, fontWeight: 500, flex: 1 }}>🗑 Trash</h1>
        {!isEmpty && (
          <button
            onClick={emptyTrash}
            style={{ background: 'none', border: '1px solid #ffcccc', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#e74c3c' }}
          >
            Empty Trash
          </button>
        )}
      </div>

      {isEmpty && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <p style={{ fontSize: 16 }}>Trash is empty</p>
        </div>
      )}

      {deletedCollections.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Deleted Collections
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {deletedCollections.map(col => (
              <div key={col.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{col.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{col.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>Collection</div>
                </div>
                <button
                  onClick={() => restoreCollection(col)}
                  style={{ padding: '6px 10px', background: '#E1F5EE', color: '#0F6E56', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 4 }}
                >
                  Restore
                </button>
                <button
                  onClick={() => permanentlyDeleteCollection(col)}
                  style={{ padding: '6px 10px', background: '#fff0f0', color: '#e74c3c', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {deletedItems.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Deleted Items
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deletedItems.map(item => (
              <div key={item.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                {item.photo && (
                  <img src={item.photo} alt={item.name}
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#999', textTransform: 'capitalize' }}>{item.status}</div>
                </div>
                <button
                  onClick={() => restoreItem(item)}
                  style={{ padding: '6px 10px', background: '#E1F5EE', color: '#0F6E56', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 4 }}
                >
                  Restore
                </button>
                <button
                  onClick={() => permanentlyDeleteItem(item)}
                  style={{ padding: '6px 10px', background: '#fff0f0', color: '#e74c3c', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

export default Trash