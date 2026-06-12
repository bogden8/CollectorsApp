import { useState, useEffect, useMemo } from 'react'
import { db } from '../db'
import Icon from '../icons'

function Collection({ collectionId, onNavigate }) {
  const [collection, setCollection] = useState(null)
  const [items, setItems] = useState([])
  const [allCollections, setAllCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTag, setFilterTag] = useState(null)
  const [filterPlatform, setFilterPlatform] = useState(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [showFilters, setShowFilters] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showPlatforms, setShowPlatforms] = useState(false)

  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [showMoveTo, setShowMoveTo] = useState(false)

  useEffect(() => {
    async function loadData() {
      const col = await db.collections.get(collectionId)
      const allItems = await db.items
        .where('collectionId')
        .equals(collectionId)
        .toArray()
      const filtered = allItems.filter(i => !i.isDeleted)
      const cols = await db.collections.toArray()
      setCollection(col)
      setItems(filtered)
      setAllCollections(cols.filter(c => !c.isDeleted))
      setLoading(false)
    }
    loadData()
  }, [collectionId])

  function toggleSelected(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelected(new Set())
    setShowMoveTo(false)
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} item${selected.size === 1 ? '' : 's'}?`)) return
    const now = Date.now()
    for (const id of selected) {
      await db.items.update(id, { isDeleted: true, deletedAt: now })
    }
    setItems(prev => prev.filter(i => !selected.has(i.id)))
    exitSelectMode()
  }

  async function handleBulkMove(targetId) {
    if (selected.size === 0) return
    // Date.now() runs inside an async event handler, never during render;
    // this triggers a false positive from eslint-plugin-react-hooks 7.x's
    // purity analysis, hence the disable below.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    for (const id of selected) {
      await db.items.update(id, { collectionId: targetId, updatedAt: now })
    }
    setItems(prev => prev.filter(i => !selected.has(i.id)))
    exitSelectMode()
  }

  const allTags      = useMemoTags(items)
  const allPlatforms = useMemo(() => {
    const counts = {}
    for (const item of items) {
      if (item.platform) counts[item.platform] = (counts[item.platform] || 0) + 1
    }
    return Object.entries(counts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count || a.platform.localeCompare(b.platform))
  }, [items])

  if (loading) return <div className="loading">Loading…</div>
  if (!collection) return <div className="loading">Collection not found</div>

  const owned    = items.filter(i => i.status === 'owned')
  const wishlist = items.filter(i => i.status === 'wishlist')
  const sold     = items.filter(i => i.status === 'sold')
  const borrowed = items.filter(i => i.status === 'borrowed')

  const totalPaid  = items.reduce((sum, i) => sum + (i.pricePaid || 0), 0)
  const totalValue = owned.reduce((sum, i) => sum + (i.estimatedValue || 0), 0)
  const totalSold  = sold.reduce((sum, i) => sum + (i.priceSold || 0), 0)

  const soldWithBothPrices = sold.filter(i => i.pricePaid != null && i.priceSold != null)
  const soldMissingPaid    = sold.filter(i => i.priceSold != null && i.pricePaid == null)
  const realizedPL         = soldWithBothPrices.reduce((sum, i) => sum + (i.priceSold - i.pricePaid), 0)

  let displayed = [...items]

  if (filterStatus !== 'all') {
    displayed = displayed.filter(i => i.status === filterStatus)
  }

  if (filterTag) {
    displayed = displayed.filter(i => i.tags?.includes(filterTag))
  }

  if (filterPlatform) {
    displayed = displayed.filter(i => i.platform === filterPlatform)
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    displayed = displayed.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.platform?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q) ||
      i.tags?.some(t => t.toLowerCase().includes(q))
    )
  }

  displayed.sort((a, b) => {
    if (sortBy === 'name')           return a.name.localeCompare(b.name)
    if (sortBy === 'pricePaid')      return (b.pricePaid || 0) - (a.pricePaid || 0)
    if (sortBy === 'estimatedValue') return (b.estimatedValue || 0) - (a.estimatedValue || 0)
    if (sortBy === 'createdAt')      return b.createdAt - a.createdAt
    return 0
  })

  const money = n => `${(n || 0).toFixed(2)}${collection.currency}`

  const moveTargets = allCollections.filter(c => c.id !== collectionId)

  return (
    <div className="app" data-screen-label="Collection">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => selectMode ? exitSelectMode() : onNavigate('home')}>
          {selectMode ? <Icon.x /> : <Icon.back />}
        </button>
        {!selectMode && <span className="crumb-emoji">{collection.icon}</span>}
        <h1 className="title title--sm grow">
          {selectMode ? `${selected.size} selected` : collection.name}
        </h1>
        <div className="topbar__actions">
          {selectMode ? (
            <>
              <button className="iconbtn" title="Move to…" disabled={selected.size === 0} onClick={() => setShowMoveTo(s => !s)}><Icon.upload /></button>
              <button className="iconbtn iconbtn--danger" title="Delete selected" disabled={selected.size === 0} onClick={handleBulkDelete}><Icon.trash /></button>
            </>
          ) : (
            <>
              <button className="iconbtn" title="Select" onClick={() => setSelectMode(true)}><Icon.check /></button>
              <button className="iconbtn" title="Edit" onClick={() => onNavigate('editCollection', collection.id)}><Icon.edit /></button>
            </>
          )}
        </div>
      </header>

      {selectMode && showMoveTo && (
        <div className="card card--pad">
          <p className="section-label">Move {selected.size} item{selected.size === 1 ? '' : 's'} to…</p>
          {moveTargets.length === 0 && <p className="note">No other collections available</p>}
          <div className="list">
            {moveTargets.map(c => (
              <div key={c.id} className="collection-card" onClick={() => handleBulkMove(c.id)}>
                <span className="collection-card__icon">{c.icon}</span>
                <div className="collection-card__body">
                  <div className="collection-card__name">{c.name}</div>
                </div>
                <Icon.chev className="chev" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectMode && (
        <>
          <div className="statgrid">
            <div className="stat"><div className="stat__l">Owned</div><div className="stat__n">{owned.length}</div></div>
            <div className="stat"><div className="stat__l">Wishlist</div><div className="stat__n">{wishlist.length}</div></div>
            <div className="stat"><div className="stat__l">Total Paid</div><div className="stat__n">{money(totalPaid)}</div></div>
            <div className="stat"><div className="stat__l">Est. Value</div><div className="stat__n">{money(totalValue)}</div></div>
            {sold.length > 0 && (
              <div className="stat"><div className="stat__l">Sold For</div><div className="stat__n">{money(totalSold)}</div></div>
            )}
            {soldWithBothPrices.length > 0 && (
              <div className="stat">
                <div className="stat__l">Realized P/L</div>
                <div className="stat__n" style={{ color: realizedPL >= 0 ? 'var(--owned)' : 'var(--danger)' }}>
                  {realizedPL > 0 ? '+' : ''}{money(realizedPL)}
                </div>
              </div>
            )}
            {borrowed.length > 0 && (
              <div className="stat stat--accent"><div className="stat__l">Borrowed Out</div><div className="stat__n">{borrowed.length}</div></div>
            )}
          </div>
          {soldMissingPaid.length > 0 && (
            <p className="note" style={{ paddingInline: 'var(--pad-page)', marginTop: '-4px' }}>
              {soldMissingPaid.length} item{soldMissingPaid.length > 1 ? 's' : ''} excluded from Realized P/L — missing purchase price
            </p>
          )}
        </>
      )}

      <div className="search">
        <Icon.search className="ic--sm" />
        <input
          className="input"
          type="text"
          placeholder="Search name, platform, location, tag…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filterbar">
        <div className="chips noscroll grow">
          {['all', 'owned', 'wishlist', 'sold', 'borrowed'].map(v => (
            <button
              key={v}
              className={'chip' + (filterStatus === v ? ' chip--on' : '')}
              onClick={() => setFilterStatus(v)}
            >
              {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {allPlatforms.length > 0 && (
          <button
            className={'iconbtn' + (showPlatforms ? ' toggle--on' : '')}
            title="Platform"
            onClick={() => setShowPlatforms(p => !p)}
          >
            <Icon.grip />
          </button>
        )}
        {allTags.length > 0 && (
          <button
            className={'iconbtn' + (showTags ? ' toggle--on' : '')}
            title="Tags"
            onClick={() => setShowTags(t => !t)}
          >
            <Icon.tag />
          </button>
        )}
        <button
          className={'iconbtn' + (showFilters ? ' toggle--on' : '')}
          title="Sort"
          onClick={() => setShowFilters(f => !f)}
        >
          <Icon.sort />
        </button>
      </div>

      {showPlatforms && allPlatforms.length > 0 && (
        <div className="card card--pad">
          <p className="section-label">Filter by platform</p>
          <div className="chips chips--wrap">
            {allPlatforms.map(({ platform, count }) => (
              <button
                key={platform}
                className={'chip' + (filterPlatform === platform ? ' chip--on' : '')}
                onClick={() => setFilterPlatform(prev => prev === platform ? null : platform)}
              >
                {platform} <span className="chip__count">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showTags && allTags.length > 0 && (
        <div className="card card--pad">
          <p className="section-label">Filter by tag</p>
          <div className="chips chips--wrap">
            {allTags.map(({ tag, count }) => (
              <button
                key={tag}
                className={'chip' + (filterTag === tag ? ' chip--on' : '')}
                onClick={() => setFilterTag(prev => prev === tag ? null : tag)}
              >
                {tag} <span className="chip__count">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="card card--pad">
          <p className="section-label">Sort by</p>
          <div className="chips chips--wrap">
            {[
              ['createdAt', 'Date Added'],
              ['name', 'Name'],
              ['pricePaid', 'Price Paid'],
              ['estimatedValue', 'Est. Value'],
            ].map(([v, label]) => (
              <button
                key={v}
                className={'chip' + (sortBy === v ? ' chip--on' : '')}
                onClick={() => setSortBy(v)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayed.length === 0 && items.length > 0 && (
        <div className="empty"><p className="empty__sub">No items match your search or filter</p></div>
      )}

      {items.length === 0 && (
        <div className="empty">
          <div className="empty__emoji">🎁</div>
          <p className="empty__title">No items yet</p>
          <p className="empty__sub">Tap + to add your first one</p>
        </div>
      )}

      <div className="list">
        {displayed.map(item => {
          const thumb = item.photos?.[0] || item.photo
          const isSel = selected.has(item.id)
          return (
            <div
              key={item.id}
              className={'item' + (isSel ? ' item--selected' : '')}
              data-status={item.status}
              onClick={() => selectMode ? toggleSelected(item.id) : onNavigate('item', item.id)}
            >
              {selectMode && (
                <div className={'select-box' + (isSel ? ' select-box--on' : '')}>
                  {isSel && <Icon.check className="ic--sm" />}
                </div>
              )}
              {thumb
                ? <img className="item__thumb" src={thumb} alt={item.name} />
                : <div className="item__thumb item__thumb--ph"><Icon.box className="ic--sm" /></div>}
              <div className="item__body">
                <div className="item__name">
                  {item.isFavorite && <span className="fav"><Icon.star /></span>}
                  {item.name}
                </div>
                <div className="item__meta">
                  {item.platform && <span>{item.platform} · </span>}
                  <span className="cap">{item.status}</span>
                  {item.pricePaid != null && <span> · {item.pricePaid}{collection.currency}</span>}
                </div>
                {item.location && <div className="item__loc">📍 {item.location}</div>}
              </div>
              {!selectMode && <Icon.chev className="chev" />}
            </div>
          )
        })}
      </div>


    </div>
  )
}

// Compute distinct tags with counts across the visible (non-deleted) items
function useMemoTags(items) {
  return useMemo(() => {
    const counts = {}
    for (const item of items) {
      for (const tag of item.tags || []) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
  }, [items])
}

export default Collection
