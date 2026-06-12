import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'

function Stats({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState([])
  const [items, setItems] = useState([])

  useEffect(() => {
    async function load() {
      const cols = await db.collections.toArray()
      const allItems = await db.items.toArray()
      setCollections(cols.filter(c => !c.isDeleted))
      setItems(allItems.filter(i => !i.isDeleted))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">Loading…</div>

  const byStatus = {
    owned: items.filter(i => i.status === 'owned'),
    wishlist: items.filter(i => i.status === 'wishlist'),
    sold: items.filter(i => i.status === 'sold'),
    borrowed: items.filter(i => i.status === 'borrowed'),
  }

  const favorites = items.filter(i => i.isFavorite).length

  // Per-collection breakdown (assumes mixed currencies are not summed globally)
  const perCollection = collections.map(col => {
    const colItems = items.filter(i => i.collectionId === col.id)
    const owned = colItems.filter(i => i.status === 'owned')
    const sold = colItems.filter(i => i.status === 'sold')
    const totalPaid = colItems.reduce((s, i) => s + (i.pricePaid || 0), 0)
    const totalValue = owned.reduce((s, i) => s + (i.estimatedValue || 0), 0)
    const totalSold = sold.reduce((s, i) => s + (i.priceSold || 0), 0)
    const soldWithBoth = sold.filter(i => i.pricePaid != null && i.priceSold != null)
    const soldExcluded = sold.filter(i => i.priceSold != null && i.pricePaid == null)
    const realizedPL = soldWithBoth.reduce((s, i) => s + (i.priceSold - i.pricePaid), 0)
    return {
      ...col,
      itemCount: colItems.length,
      totalPaid,
      totalValue,
      totalSold,
      realizedPL,
      soldWithBothCount: soldWithBoth.length,
      soldExcludedCount: soldExcluded.length,
    }
  }).sort((a, b) => b.totalValue - a.totalValue)

  // Top items by estimated value across all collections
  const topItems = items
    .filter(i => i.status === 'owned' && i.estimatedValue != null)
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 5)
    .map(i => ({ ...i, collection: collections.find(c => c.id === i.collectionId) }))

  const money = (n, currency) => `${(n || 0).toFixed(2)}${currency || ''}`

  return (
    <div className="app" data-screen-label="Stats">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('home')}><Icon.back /></button>
        <h1 className="title title--sm grow">Stats</h1>
      </header>

      <div className="statgrid">
        <div className="stat"><div className="stat__l">Collections</div><div className="stat__n">{collections.length}</div></div>
        <div className="stat"><div className="stat__l">Total Items</div><div className="stat__n">{items.length}</div></div>
        <div className="stat"><div className="stat__l">Owned</div><div className="stat__n">{byStatus.owned.length}</div></div>
        <div className="stat"><div className="stat__l">Wishlist</div><div className="stat__n">{byStatus.wishlist.length}</div></div>
        <div className="stat"><div className="stat__l">Sold</div><div className="stat__n">{byStatus.sold.length}</div></div>
        <div className="stat stat--accent"><div className="stat__l">Favorites</div><div className="stat__n">{favorites}</div></div>
        {byStatus.borrowed.length > 0 && (
          <div className="stat stat--accent"><div className="stat__l">Borrowed Out</div><div className="stat__n">{byStatus.borrowed.length}</div></div>
        )}
      </div>

      <p className="section-label">By collection</p>
      {perCollection.length === 0 && (
        <p className="note center">No collections yet</p>
      )}
      <div className="list">
        {perCollection.map(col => (
          <div key={col.id} className="card card--pad stats-row" onClick={() => onNavigate('collection', col.id)}>
            <div className="stats-row__head">
              <span className="crumb-emoji">{col.icon}</span>
              <span className="stats-row__name grow">{col.name}</span>
              <span className="stats-row__count">{col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}</span>
            </div>
            <div className="stats-row__nums">
              <div><span className="field__l">Paid</span> <span className="field__v">{money(col.totalPaid, col.currency)}</span></div>
              <div><span className="field__l">Value</span> <span className="field__v">{money(col.totalValue, col.currency)}</span></div>
              {col.soldWithBothCount > 0 && (
                <div>
                  <span className="field__l">Realized P/L</span>{' '}
                  <span className={'field__v ' + (col.realizedPL >= 0 ? 'field--profit' : 'field--loss')}>
                    {col.realizedPL > 0 ? '+' : ''}{money(col.realizedPL, col.currency)}
                  </span>
                  {col.soldExcludedCount > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '6px' }}>
                      ({col.soldExcludedCount} excl.)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {topItems.length > 0 && (
        <>
          <p className="section-label">Most valuable items</p>
          <div className="list">
            {topItems.map(item => (
              <div key={item.id} className="item" data-status={item.status} onClick={() => onNavigate('item', item.id)}>
                {(item.photos?.[0] || item.photo)
                  ? <img className="item__thumb" src={item.photos?.[0] || item.photo} alt={item.name} />
                  : <div className="item__thumb item__thumb--ph"><Icon.box className="ic--sm" /></div>}
                <div className="item__body">
                  <div className="item__name">{item.name}</div>
                  <div className="item__meta">{item.collection?.icon} {item.collection?.name}</div>
                </div>
                <div className="stats-row__count">{money(item.estimatedValue, item.collection?.currency)}</div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

export default Stats
