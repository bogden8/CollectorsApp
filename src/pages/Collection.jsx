import { useState, useEffect } from 'react'
import { db } from '../db'

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

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>
  if (!collection) return <div style={{ padding: 16 }}>Collection not found</div>

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

  const statusColors = {
    owned:    '#1D9E75',
    wishlist: '#7F77DD',
    sold:     '#888',
    borrowed: '#F5A623'
  }

  const chip = (label, value, current, setter) => (
    <button
      key={value}
      onClick={() => setter(value)}
      style={{
        padding: '6px 12px', borderRadius: 20, border: '1px solid',
        borderColor: current === value ? '#7F77DD' : '#ddd',
        background: current === value ? '#EEEDFE' : 'white',
        color: current === value ? '#534AB7' : '#666',
        cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap'
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 28 }}>{collection.icon}</span>
        <h1 style={{ fontSize: 20, fontWeight: 500, flex: 1 }}>{collection.name}</h1>
        <button
          onClick={() => onNavigate('editCollection', collection.id)}
          style={{ background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#666' }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          style={{ background: 'none', border: '1px solid #ffcccc', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#e74c3c' }}
        >
          🗑
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>OWNED</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{owned.length}</div>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>WISHLIST</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{wishlist.length}</div>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>TOTAL PAID</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{totalPaid.toFixed(2)}{collection.currency}</div>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>EST. VALUE</div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{totalValue.toFixed(2)}{collection.currency}</div>
        </div>
        {sold.length > 0 && (
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>SOLD FOR</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{totalSold.toFixed(2)}{collection.currency}</div>
          </div>
        )}
        {borrowed.length > 0 && (
          <div style={{ background: '#FFF3CD', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>BORROWED OUT</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{borrowed.length}</div>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by name, platform, location, tag..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: 10, fontSize: 14, borderRadius: 8,
          border: '1px solid #ddd', marginBottom: 10, boxSizing: 'border-box'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {chip('All', 'all', filterStatus, setFilterStatus)}
          {chip('Owned', 'owned', filterStatus, setFilterStatus)}
          {chip('Wishlist', 'wishlist', filterStatus, setFilterStatus)}
          {chip('Sold', 'sold', filterStatus, setFilterStatus)}
          {chip('Borrowed', 'borrowed', filterStatus, setFilterStatus)}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          style={{
            marginLeft: 8, padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd',
            background: showFilters ? '#EEEDFE' : 'white', color: showFilters ? '#534AB7' : '#666',
            cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap'
          }}
        >
          Sort ↕
        </button>
      </div>

      {showFilters && (
        <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Sort by</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {chip('Date Added', 'createdAt', sortBy, setSortBy)}
            {chip('Name', 'name', sortBy, setSortBy)}
            {chip('Price Paid', 'pricePaid', sortBy, setSortBy)}
            {chip('Est. Value', 'estimatedValue', sortBy, setSortBy)}
          </div>
        </div>
      )}

      {displayed.length === 0 && items.length > 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
          <p>No items match your search or filter</p>
        </div>
      )}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
          <p style={{ marginBottom: 4 }}>No items yet</p>
          <p style={{ fontSize: 13 }}>Tap + to get started</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
        {displayed.map(item => (
          <div
            key={item.id}
            onClick={() => onNavigate('item', item.id)}
            style={{
              background: 'white', border: '1px solid #eee', borderRadius: 10,
              padding: 14, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 12,
              borderLeft: `4px solid ${statusColors[item.status] || '#ddd'}`
            }}
          >
            {item.photo && (
              <img src={item.photo} alt={item.name}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.isFavorite && '⭐ '}{item.name}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {item.platform && <span>{item.platform} · </span>}
                <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                {item.pricePaid != null && <span> · {item.pricePaid}{collection.currency}</span>}
              </div>
              {item.location && (
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>📍 {item.location}</div>
              )}
            </div>
            <span style={{ color: '#ccc' }}>›</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigate('addItem', collectionId)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#534AB7', color: 'white', border: 'none',
          borderRadius: 50, width: 56, height: 56,
          fontSize: 28, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        +
      </button>

    </div>
  )
}

export default Collection