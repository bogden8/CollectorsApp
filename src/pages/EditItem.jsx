import { useState, useEffect, useRef } from 'react'
import { db } from '../db'
import Icon from '../icons'

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

  if (loading) return <div className="loading">Loading…</div>

  const text = (field, lbl, value, setter, ph, type = 'text') => has(field) && (
    <div className="field-block">
      <label className="label">{lbl}</label>
      <input className="input" type={type} placeholder={ph} value={value} onChange={e => setter(e.target.value)} />
    </div>
  )

  return (
    <div className="app app--fab" data-screen-label="Edit Item">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('item', itemId)}><Icon.back /></button>
        <h1 className="title title--sm">Edit item</h1>
      </header>

      <div className="field-block">
        <label className="label">Name *</label>
        <input className="input" placeholder="e.g. Halo Reach" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="field-block">
        <label className="label">Status *</label>
        <div className="seg">
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={'seg-btn' + (status === s ? ' seg-btn--on' : '')} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      {has('photo') && (
        <div className="field-block">
          <label className="label">Photo</label>
          {photo && (
            <>
              <img className="preview-img" src={photo} alt="current" />
              <button className="btn btn--danger btn--sm" onClick={() => setPhoto(null)}>
                <Icon.x className="ic--sm" /><span>Remove photo</span>
              </button>
            </>
          )}
          <label className="file-input">
            {photo ? 'Replace photo' : 'Take or choose a photo'}
            <input type="file" accept="image/*"  onChange={handlePhoto} hidden />
          </label>
        </div>
      )}

      {has('condition') && (
        <div className="field-block">
          <label className="label">Condition</label>
          <div className="seg">
            {CONDITION_OPTIONS.map(c => (
              <button key={c} className={'seg-btn' + (condition === c ? ' seg-btn--on' : '')} onClick={() => setCondition(condition === c ? '' : c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {text('platform', 'Platform / Variant', platform, setPlatform, 'e.g. PS2, Xbox 360')}
      {text('pricePaid', `Price Paid (${collection.currency})`, pricePaid, setPricePaid, '0', 'number')}
      {text('estimatedValue', `Estimated Value (${collection.currency})`, estimatedValue, setEstimatedValue, '0', 'number')}
      {status === 'sold' && text('priceSold', `Price Sold (${collection.currency})`, priceSold, setPriceSold, '0', 'number')}
      {text('location', 'Location', location, setLocation, 'e.g. Shelf A2, Box B1')}
      {text('storageUnit', 'Storage Unit', storageUnit, setStorageUnit, 'e.g. Bedroom shelf, Garage')}
      {text('purchaseDate', 'Purchase Date', purchaseDate, setPurchaseDate, '', 'date')}
      {text('purchasedFrom', 'Purchased From', purchasedFrom, setPurchasedFrom, 'e.g. OLX, eBay')}
      {status === 'sold' && text('soldDate', 'Sold Date', soldDate, setSoldDate, '', 'date')}
      {status === 'sold' && text('soldOn', 'Sold On', soldOn, setSoldOn, 'e.g. OLX, Facebook Marketplace')}
      {status === 'borrowed' && text('borrowedTo', 'Borrowed To', borrowedTo, setBorrowedTo, 'e.g. Andrei')}
      {status === 'borrowed' && text('borrowedDate', 'Borrowed Date', borrowedDate, setBorrowedDate, '', 'date')}
      {status === 'borrowed' && text('borrowReturnDate', 'Expected Return Date', borrowReturnDate, setBorrowReturnDate, '', 'date')}
      {status === 'borrowed' && text('borrowNotes', 'Borrow Notes', borrowNotes, setBorrowNotes, 'e.g. Lent at school')}
      {text('tags', 'Tags (comma separated)', tags, setTags, 'e.g. rare, complete, signed')}
      {text('quantity', 'Quantity', quantity, setQuantity, '1', 'number')}

      {has('isFavorite') && (
        <div className="checkrow">
          <input type="checkbox" id="fav" checked={isFavorite} onChange={e => setIsFavorite(e.target.checked)} />
          <label htmlFor="fav">Mark as favorite ⭐</label>
        </div>
      )}

      {has('notes') && (
        <div className="field-block">
          <label className="label">Notes</label>
          <textarea className="textarea" placeholder="Any extra info…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      )}

      {(collection.customFields || []).map(cf => (
        <div className="field-block" key={cf.id}>
          {cf.type === 'boolean' ? (
            <div className="checkrow">
              <input type="checkbox" id={`cf_${cf.id}`} checked={!!customFieldValues[cf.id]}
                onChange={e => setCustomFieldValues(prev => ({ ...prev, [cf.id]: e.target.checked }))} />
              <label htmlFor={`cf_${cf.id}`}>{cf.label}</label>
            </div>
          ) : (
            <>
              <label className="label">{cf.label || 'Custom Field'}</label>
              <input
                className="input"
                type={cf.type === 'number' ? 'number' : cf.type === 'date' ? 'date' : 'text'}
                value={customFieldValues[cf.id] ?? ''}
                onChange={e => setCustomFieldValues(prev => ({ ...prev, [cf.id]: e.target.value }))}
              />
            </>
          )}
        </div>
      ))}

      <button className="btn btn--primary btn--block" disabled={saving || !name.trim()} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>

    </div>
  )
}

export default EditItem
