import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'

function Home({ onNavigate }) {
  const [collections, setCollections] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [reorderMode, setReorderMode] = useState(false)

  useEffect(() => {
    async function load() {
      const result = await db.collections.toArray()
      const filtered = result
        .filter(col => !col.isDeleted)
        .sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt))
      const allItems = await db.items.toArray()
      const live = allItems.filter(i => !i.isDeleted)
      const byCol = {}
      for (const it of live) byCol[it.collectionId] = (byCol[it.collectionId] || 0) + 1
      setCollections(filtered)
      setCounts(byCol)
      setLoading(false)
    }
    load()
  }, [])

  async function moveCollection(idx, dir) {
    const target = idx + dir
    if (target < 0 || target >= collections.length) return
    const next = [...collections]
    const [moved] = next.splice(idx, 1)
    next.splice(target, 0, moved)
    setCollections(next)
    for (let i = 0; i < next.length; i++) {
      await db.collections.update(next[i].id, { order: i })
    }
  }

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
          <button className="iconbtn" title="Stats" onClick={() => onNavigate('stats')}><Icon.chart /></button>
          <button className="iconbtn" title="Tags" onClick={() => onNavigate('tags')}><Icon.tag /></button>
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

      {collections.length > 1 && (
        <div className="filterbar">
          <span className="spacer" />
          <button
            className={'iconbtn' + (reorderMode ? ' toggle--on' : '')}
            title="Reorder collections"
            onClick={() => setReorderMode(r => !r)}
          >
            <Icon.grip />
          </button>
        </div>
      )}

      <div className="list">
        {collections.map((col, idx) => (
          <div
            key={col.id}
            className="collection-card"
            onClick={() => !reorderMode && onNavigate('collection', col.id)}
          >
            <span className="collection-card__icon">{col.icon}</span>
            <div className="collection-card__body">
              <div className="collection-card__name">{col.name}</div>
              <div className="collection-card__meta">
                {counts[col.id] || 0} {counts[col.id] === 1 ? 'item' : 'items'} · {col.currency}
              </div>
            </div>
            {reorderMode ? (
              <div className="reorder-controls">
                <button className="iconbtn iconbtn--bare" disabled={idx === 0} onClick={() => moveCollection(idx, -1)}><Icon.up className="ic--sm" /></button>
                <button className="iconbtn iconbtn--bare" disabled={idx === collections.length - 1} onClick={() => moveCollection(idx, 1)}><Icon.down className="ic--sm" /></button>
              </div>
            ) : (
              <Icon.chev className="chev" />
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

export default Home
