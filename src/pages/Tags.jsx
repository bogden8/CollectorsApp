import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'

function Tags({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [collections, setCollections] = useState([])
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    async function load() {
      const allItems = await db.items.toArray()
      const cols = await db.collections.toArray()
      setItems(allItems.filter(i => !i.isDeleted))
      setCollections(cols.filter(c => !c.isDeleted))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">Loading…</div>

  const counts = {}
  for (const item of items) {
    for (const tag of item.tags || []) {
      counts[tag] = (counts[tag] || 0) + 1
    }
  }
  const allTags = Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

  const matching = activeTag
    ? items.filter(i => i.tags?.includes(activeTag))
        .map(i => ({ ...i, collection: collections.find(c => c.id === i.collectionId) }))
    : []

  return (
    <div className="app" data-screen-label="Tags">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => activeTag ? setActiveTag(null) : onNavigate('home')}><Icon.back /></button>
        <h1 className="title title--sm grow">{activeTag ? `#${activeTag}` : 'Tags'}</h1>
      </header>

      {!activeTag && (
        <>
          {allTags.length === 0 ? (
            <div className="empty">
              <div className="empty__emoji">🏷️</div>
              <p className="empty__title">No tags yet</p>
              <p className="empty__sub">Add tags to items to organise and find them quickly</p>
            </div>
          ) : (
            <div className="chips chips--wrap">
              {allTags.map(({ tag, count }) => (
                <button key={tag} className="chip" onClick={() => setActiveTag(tag)}>
                  {tag} <span className="chip__count">{count}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {activeTag && (
        <div className="list">
          {matching.map(item => (
            <div key={item.id} className="item" data-status={item.status} onClick={() => onNavigate('item', item.id)}>
              {(item.photos?.[0] || item.photo)
                ? <img className="item__thumb" src={item.photos?.[0] || item.photo} alt={item.name} />
                : <div className="item__thumb item__thumb--ph"><Icon.box className="ic--sm" /></div>}
              <div className="item__body">
                <div className="item__name">
                  {item.isFavorite && <span className="fav"><Icon.star /></span>}
                  {item.name}
                </div>
                <div className="item__meta">
                  {item.collection?.icon} {item.collection?.name} · <span className="cap">{item.status}</span>
                </div>
              </div>
              <Icon.chev className="chev" />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Tags
