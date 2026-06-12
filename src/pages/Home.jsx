import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'

function Home({ onNavigate }) {
  const [collections, setCollections] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCollections() {
      const result = await db.collections.toArray()
      const filtered = result.filter(col => !col.isDeleted)
      const allItems = await db.items.toArray()
      const live = allItems.filter(i => !i.isDeleted)
      const byCol = {}
      for (const it of live) byCol[it.collectionId] = (byCol[it.collectionId] || 0) + 1
      setCollections(filtered)
      setCounts(byCol)
      setLoading(false)
    }
    loadCollections()
  }, [])

  if (loading) return <div className="loading">Loading…</div>

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="app" data-screen-label="Home">

      <header className="topbar">
        <div className="topbar__titles">
          <span className="kicker">your shelf</span>
          <h1 className="title">Collections</h1>
        </div>
        <div className="topbar__actions">
          <button className="iconbtn" title="Backup" onClick={() => onNavigate('exportImport')}><Icon.save /></button>
          <button className="iconbtn" title="Trash" onClick={() => onNavigate('trash')}><Icon.trash /></button>
          <button className="btn btn--primary btn--sm" onClick={() => onNavigate('createCollection')}>
            <Icon.plus /><span>New</span>
          </button>
        </div>
      </header>

      {collections.length > 0 && (
        <div className="summary">
          <div className="summary__cell">
            <div className="summary__n">{collections.length}</div>
            <div className="summary__l">Collections</div>
          </div>
          <div className="summary__cell">
            <div className="summary__n">{totalItems}</div>
            <div className="summary__l">Items tracked</div>
          </div>
        </div>
      )}

      {collections.length === 0 && (
        <div className="empty">
          <div className="empty__emoji">📦</div>
          <p className="empty__title">No collections yet</p>
          <p className="empty__sub">Tap “New” to start your first one</p>
        </div>
      )}

      <div className="list">
        {collections.map(col => (
          <div key={col.id} className="collection-card" onClick={() => onNavigate('collection', col.id)}>
            <span className="collection-card__icon">{col.icon}</span>
            <div className="collection-card__body">
              <div className="collection-card__name">{col.name}</div>
              <div className="collection-card__meta">
                {counts[col.id] || 0} {counts[col.id] === 1 ? 'item' : 'items'} · {col.currency}
              </div>
            </div>
            <Icon.chev className="chev" />
          </div>
        ))}
      </div>

    </div>
  )
}

export default Home
