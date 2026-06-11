import { useState, useEffect, useRef } from 'react'
import { db } from '../db'

const CONDITION_OPTIONS = ['Sealed', 'Complete', 'Loose', 'Damaged']
const STATUS_OPTIONS = ['owned', 'wishlist', 'sold', 'borrowed']

function EditItem({ itemId, onNavigate }) {
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const collectionIdRef = useRef(null)

  const [name, setName] = useState('')
  const [status, setStatus] = useState('owned')
  const [condition, setCondition] = useState('')
  const [platform, setPlatform] = useState('')
  const [pricePaid, setPricePaid] = useState('')
  const [priceSold, setPriceSold] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [location, setLocation] = useState('')
  const [storageUnit, setStorageUnit] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchasedFrom, setPurchasedFrom] = useState('')
  const [soldDate, setSoldDate] = useState('')
  const [soldOn, setSoldOn] = useState('')
  const [borrowedTo, setBorrowedTo] = useState('')
  const [borrowedDate, setBorrowedDate] = useState('')
  const [borrowReturnDate, setBorrowReturnDate] = useState('')
  const [borrowNotes, setBorrowNotes] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [tags, setTags] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)
  const [customFieldValues, setCustomFieldValues] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const item = await db.items.get(itemId)
      const col = await db.collections.get(item.collectionId)
      collectionIdRef.current = item.collectionId
      setCollection(col)
      setName(item.name || '')
      setStatus(item.status || 'owned')
      setCondition(item.condition || '')
      setPlatform(item.platform || '')
      setPricePaid(item.pricePaid ?? '')
      setPriceSold(item.priceSold ?? '')
      setEstimatedValue(item.estimatedValue ?? '')
      setLocation(item.location || '')
      setStorageUnit(item.storageUnit || '')
      setPurchaseDate(item.purchaseDate || '')
      setPurchasedFrom(item.purchasedFrom || '')
      setSoldDate(item.soldDate || '')
      setSoldOn(item.soldOn || '')
      setBorrowedTo(item.borrowedTo || '')
      setBorrowedDate(item.borrowedDate || '')
      setBorrowReturnDate(item.borrowReturnDate || '')
      setBorrowNotes(item.borrowNotes || '')
      setIsFavorite(item.isFavorite || false)
      setTags(item.tags ? item.tags.join(', ') : '')
      setQuantity(item.quantity ?? '')
      setNotes(item.notes || '')
      setPhoto(item.photo || null)
      setCustomFieldValues(item.customFieldValues || {})
      setLoading(false)
    }
    load()
  }, [itemId])

  function has(field) {
    return collection?.enabledFields?.includes(field)
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await db.items.update(itemId, {
      name:             name.trim(),
      status,
      condition:        condition || null,
      platform:         platform || null,
      pricePaid:        pricePaid !== '' ? parseFloat(pricePaid) : null,
      priceSold:        priceSold !== '' ? parseFloat(priceSold) : null,
      estimatedValue:   estimatedValue !== '' ? parseFloat(estimatedValue) : null,
      location:         location || null,
      storageUnit:      storageUnit || null,
      purchaseDate:     purchaseDate || null,
      purchasedFrom:    purchasedFrom || null,
      soldDate:         soldDate || null,
      soldOn:           soldOn || null,
      borrowedTo:       borrowedTo || null,
      borrowedDate:     borrowedDate || null,
      borrowReturnDate: borrowReturnDate || null,
      borrowNotes:      borrowNotes || null,
      isFavorite,
      tags:             tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      quantity:         quantity !== '' ? parseInt(quantity) : null,
      notes:            notes || null,
      photo:            photo || null,
      customFieldValues,
      updatedAt:        Date.now()
    })
    onNavigate('item', itemId)
  }

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>

  const input = {
    width: '100%', padding: 12, fontSize: 15,
    borderRadius: 8, border: '1px solid #ddd',
    marginBottom: 14, boxSizing: 'border-box'
  }

  const label = {
    fontSize: 13, color: '#666', marginBottom: 4, display: 'block'
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, paddingBottom: 80 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => onNavigate('item', itemId)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >←</button>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>Edit Item</h1>
      </div>

      <label style={label}>Name *</label>
      <input
        style={input}
        placeholder="e.g. Halo Reach"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <label style={label}>Status *</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '8px 14px', borderRadius: 20, border: '1px solid',
              borderColor: status === s ? '#7F77DD' : '#ddd',
              background: status === s ? '#EEEDFE' : 'white',
              color: status === s ? '#534AB7' : '#666',
              cursor: 'pointer', fontSize: 13, textTransform: 'capitalize'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {has('photo') && (
        <>
          <label style={label}>Photo</label>
          {photo && (
            <div style={{ marginBottom: 8 }}>
              <img src={photo} alt="current"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
              <button
                onClick={() => setPhoto(null)}
                style={{ marginTop: 6, fontSize: 13, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Remove photo
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            style={{ marginBottom: 14, fontSize: 14 }}
          />
        </>
      )}

      {has('condition') && (
        <>
          <label style={label}>Condition</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {CONDITION_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setCondition(condition === c ? '' : c)}
                style={{
                  padding: '8px 14px', borderRadius: 20, border: '1px solid',
                  borderColor: condition === c ? '#7F77DD' : '#ddd',
                  background: condition === c ? '#EEEDFE' : 'white',
                  color: condition === c ? '#534AB7' : '#666',
                  cursor: 'pointer', fontSize: 13
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {has('platform') && (
        <>
          <label style={label}>Platform / Variant</label>
          <input style={input} placeholder="e.g. PS2, Xbox 360"
            value={platform} onChange={e => setPlatform(e.target.value)} />
        </>
      )}

      {has('pricePaid') && (
        <>
          <label style={label}>Price Paid ({collection.currency})</label>
          <input style={input} type="number" placeholder="0"
            value={pricePaid} onChange={e => setPricePaid(e.target.value)} />
        </>
      )}

      {has('estimatedValue') && (
        <>
          <label style={label}>Estimated Value ({collection.currency})</label>
          <input style={input} type="number" placeholder="0"
            value={estimatedValue} onChange={e => setEstimatedValue(e.target.value)} />
        </>
      )}

      {has('priceSold') && status === 'sold' && (
        <>
          <label style={label}>Price Sold ({collection.currency})</label>
          <input style={input} type="number" placeholder="0"
            value={priceSold} onChange={e => setPriceSold(e.target.value)} />
        </>
      )}

      {has('location') && (
        <>
          <label style={label}>Location</label>
          <input style={input} placeholder="e.g. Shelf A2, Box B1"
            value={location} onChange={e => setLocation(e.target.value)} />
        </>
      )}

      {has('storageUnit') && (
        <>
          <label style={label}>Storage Unit</label>
          <input style={input} placeholder="e.g. Bedroom shelf, Garage"
            value={storageUnit} onChange={e => setStorageUnit(e.target.value)} />
        </>
      )}

      {has('purchaseDate') && (
        <>
          <label style={label}>Purchase Date</label>
          <input style={input} type="date"
            value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
        </>
      )}

      {has('purchasedFrom') && (
        <>
          <label style={label}>Purchased From</label>
          <input style={input} placeholder="e.g. OLX, eBay"
            value={purchasedFrom} onChange={e => setPurchasedFrom(e.target.value)} />
        </>
      )}

      {has('soldDate') && status === 'sold' && (
        <>
          <label style={label}>Sold Date</label>
          <input style={input} type="date"
            value={soldDate} onChange={e => setSoldDate(e.target.value)} />
        </>
      )}

      {has('soldOn') && status === 'sold' && (
        <>
          <label style={label}>Sold On</label>
          <input style={input} placeholder="e.g. OLX, Facebook Marketplace"
            value={soldOn} onChange={e => setSoldOn(e.target.value)} />
        </>
      )}

      {has('borrowedTo') && status === 'borrowed' && (
        <>
          <label style={label}>Borrowed To</label>
          <input style={input} placeholder="e.g. Andrei"
            value={borrowedTo} onChange={e => setBorrowedTo(e.target.value)} />
        </>
      )}

      {has('borrowedDate') && status === 'borrowed' && (
        <>
          <label style={label}>Borrowed Date</label>
          <input style={input} type="date"
            value={borrowedDate} onChange={e => setBorrowedDate(e.target.value)} />
        </>
      )}

      {has('borrowReturnDate') && status === 'borrowed' && (
        <>
          <label style={label}>Expected Return Date</label>
          <input style={input} type="date"
            value={borrowReturnDate} onChange={e => setBorrowReturnDate(e.target.value)} />
        </>
      )}

      {has('borrowNotes') && status === 'borrowed' && (
        <>
          <label style={label}>Borrow Notes</label>
          <input style={input} placeholder="e.g. Lent at school"
            value={borrowNotes} onChange={e => setBorrowNotes(e.target.value)} />
        </>
      )}

      {has('tags') && (
        <>
          <label style={label}>Tags (comma separated)</label>
          <input style={input} placeholder="e.g. rare, complete, signed"
            value={tags} onChange={e => setTags(e.target.value)} />
        </>
      )}

      {has('quantity') && (
        <>
          <label style={label}>Quantity</label>
          <input style={input} type="number" placeholder="1"
            value={quantity} onChange={e => setQuantity(e.target.value)} />
        </>
      )}

      {has('isFavorite') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <input type="checkbox" id="fav" checked={isFavorite}
            onChange={e => setIsFavorite(e.target.checked)}
            style={{ width: 18, height: 18 }} />
          <label htmlFor="fav" style={{ fontSize: 15, cursor: 'pointer' }}>Mark as Favorite ⭐</label>
        </div>
      )}

      {has('notes') && (
        <>
          <label style={label}>Notes</label>
          <textarea style={{ ...input, height: 80, resize: 'vertical' }}
            placeholder="Any extra info..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </>
      )}

      {(collection.customFields || []).map(cf => (
        <div key={cf.id}>
          <label style={label}>{cf.label || 'Custom Field'}</label>
          {cf.type === 'boolean' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <input
                type="checkbox"
                id={`cf_${cf.id}`}
                checked={!!customFieldValues[cf.id]}
                onChange={e => setCustomFieldValues(prev => ({ ...prev, [cf.id]: e.target.checked }))}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor={`cf_${cf.id}`} style={{ fontSize: 15, cursor: 'pointer' }}>{cf.label}</label>
            </div>
          ) : (
            <input
              style={input}
              type={cf.type === 'number' ? 'number' : cf.type === 'date' ? 'date' : 'text'}
              value={customFieldValues[cf.id] ?? ''}
              onChange={e => setCustomFieldValues(prev => ({ ...prev, [cf.id]: e.target.value }))}
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        style={{
          width: '100%', padding: 14, background: '#534AB7', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer',
          opacity: name.trim() ? 1 : 0.5
        }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

    </div>
  )
}

export default EditItem