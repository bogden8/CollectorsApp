import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'

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

  if (loading) return <div className="loading">Loading…</div>

  const isEmpty = deletedCollections.length === 0 && deletedItems.length === 0

  return (
    <div className="app" data-screen-label="Trash">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('home')}><Icon.back /></button>
        <h1 className="title title--sm grow">Trash</h1>
        {!isEmpty && <button className="btn btn--danger btn--sm" onClick={emptyTrash}><Icon.trash /><span>Empty</span></button>}
      </header>

      {isEmpty && (
        <div className="empty">
          <div className="empty__emoji">✨</div>
          <p className="empty__title">Trash is empty</p>
          <p className="empty__sub">Deleted collections and items show up here</p>
        </div>
      )}

      {deletedCollections.length > 0 && (
        <>
          <p className="section-label">Deleted Collections</p>
          <div className="list">
            {deletedCollections.map(col => (
              <div key={col.id} className="card trash-row">
                <span className="crumb-emoji">{col.icon}</span>
                <div className="trash-row__body">
                  <div className="trash-row__name">{col.name}</div>
                  <div className="trash-row__meta">Collection</div>
                </div>
                <div className="trash-actions">
                  <button className="btn btn--restore btn--sm" onClick={() => restoreCollection(col)}><Icon.undo className="ic--sm" /><span>Restore</span></button>
                  <button className="iconbtn iconbtn--danger" onClick={() => permanentlyDeleteCollection(col)}><Icon.trash className="ic--sm" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {deletedItems.length > 0 && (
        <>
          <p className="section-label">Deleted Items</p>
          <div className="list">
            {deletedItems.map(item => (
              <div key={item.id} className="card trash-row">
                {item.photo
                  ? <img className="item__thumb" src={item.photo} alt={item.name} />
                  : <div className="item__thumb item__thumb--ph"><Icon.box className="ic--sm" /></div>}
                <div className="trash-row__body">
                  <div className="trash-row__name">{item.name}</div>
                  <div className="trash-row__meta cap">{item.status}</div>
                </div>
                <div className="trash-actions">
                  <button className="btn btn--restore btn--sm" onClick={() => restoreItem(item)}><Icon.undo className="ic--sm" /><span>Restore</span></button>
                  <button className="iconbtn iconbtn--danger" onClick={() => permanentlyDeleteItem(item)}><Icon.trash className="ic--sm" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

export default Trash
