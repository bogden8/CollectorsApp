import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'

function Collection({ collectionId, onNavigate }) {
  const [collection, setCollection] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function loadData() {
      const col = await db.collections.get(collectionId)
      const allItems = await db.items
        .where('collectionId')
        .equals(collectionId)
        .toArray()
      const filtered = allItems.filter(i => !i.isDeleted)
      setCollection(col)
      setItems(filtered)
      setLoading(false)
    }
    loadData()
  }, [collectionId])

  async function handleDelete() {
    if (!confirm(`Delete "${collection.name}" and all its items?`)) return
    await db.collections.update(collectionId, { isDeleted: true, deletedAt: Date.now() })
    const allItems = await db.items.where('collectionId').equals(collectionId).toArray()
    for (const item of allItems) {
      await db.items.update(item.id, { isDeleted: true, deletedAt: Date.now() })
    }
    onNavigate('home')
  }

  if (loading) return <div className="loading">Loading…</div>
  if (!collection) return <div className="loading">Collection not found</div>

  const owned    = items.filter(i => i.status === 'owned')
  const wishlist = items.filter(i => i.status === 'wishlist')
  const sold     = items.filter(i => i.status === 'sold')
  const borrowed = items.filter(i => i.status === 'borrowed')

  const totalPaid  = owned.reduce((sum, i) => sum + (i.pricePaid || 0), 0)
  const totalValue = owned.reduce((sum, i) => sum + (i.estimatedValue || 0), 0)
  const totalSold  = sold.reduce((sum, i) => sum + (i.priceSold || 0), 0)

  let displayed = [...items]

  if (filterStatus !== 'all') {
    displayed = displayed.filter(i => i.status === filterStatus)
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

  const chip = (label, value, current, setter) => (
    <button
      key={value}
      className={'chip' + (current === value ? ' chip--on' : '')}
      onClick={() => setter(value)}
    >
      {label}
    </button>
  )

  const money = n => `${n.toFixed(2)}${collection.currency}`

  return (
    <div className="app" data-screen-label="Collection">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('home')}><Icon.back /></button>
        <span className="crumb-emoji">{collection.icon}</span>
        <h1 className="title title--sm grow">{collection.name}</h1>
        <div className="topbar__actions">
          <button className="iconbtn" title="Edit" onClick={() => onNavigate('editCollection', collection.id)}><Icon.edit /></button>
          <button className="iconbtn iconbtn--danger" title="Delete" onClick={handleDelete}><Icon.trash /></button>
        </div>
      </header>

      <div className="statgrid">
        <div className="stat"><div className="stat__l">Owned</div><div className="stat__n">{owned.length}</div></div>
        <div className="stat"><div className="stat__l">Wishlist</div><div className="stat__n">{wishlist.length}</div></div>
        <div className="stat"><div className="stat__l">Total Paid</div><div className="stat__n">{money(totalPaid)}</div></div>
        <div className="stat"><div className="stat__l">Est. Value</div><div className="stat__n">{money(totalValue)}</div></div>
        {sold.length > 0 && (
          <div className="stat"><div className="stat__l">Sold For</div><div className="stat__n">{money(totalSold)}</div></div>
        )}
        {borrowed.length > 0 && (
          <div className="stat stat--accent"><div className="stat__l">Borrowed Out</div><div className="stat__n">{borrowed.length}</div></div>
        )}
      </div>

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
          {chip('All', 'all', filterStatus, setFilterStatus)}
          {chip('Owned', 'owned', filterStatus, setFilterStatus)}
          {chip('Wishlist', 'wishlist', filterStatus, setFilterStatus)}
          {chip('Sold', 'sold', filterStatus, setFilterStatus)}
          {chip('Borrowed', 'borrowed', filterStatus, setFilterStatus)}
        </div>
        <button
          className={'iconbtn' + (showFilters ? ' toggle--on' : '')}
          title="Sort"
          onClick={() => setShowFilters(f => !f)}
        >
          <Icon.sort />
        </button>
      </div>

      {showFilters && (
        <div className="card card--pad">
          <p className="section-label">Sort by</p>
          <div className="chips chips--wrap">
            {chip('Date Added', 'createdAt', sortBy, setSortBy)}
            {chip('Name', 'name', sortBy, setSortBy)}
            {chip('Price Paid', 'pricePaid', sortBy, setSortBy)}
            {chip('Est. Value', 'estimatedValue', sortBy, setSortBy)}
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
        {displayed.map(item => (
          <div key={item.id} className="item" data-status={item.status} onClick={() => onNavigate('item', item.id)}>
            {item.photo
              ? <img className="item__thumb" src={item.photo} alt={item.name} />
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
            <Icon.chev className="chev" />
          </div>
        ))}
      </div>


    </div>
  )
}

export default Collection
