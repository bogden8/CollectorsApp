import { useState, useEffect } from 'react'
import { db } from '../db'
import Icon from '../icons'
import CurrencyPicker from '../components/CurrencyPicker'

const EMOJI_OPTIONS = ['🎮', '👟', '📀', '🎵', '📚', '🃏', '🏆', '🎨', '🧸', '⌚', '📷', '🎸']

const AVAILABLE_FIELDS = [
  { key: 'photo',            label: 'Photo' },
  { key: 'condition',        label: 'Condition' },
  { key: 'platform',         label: 'Platform / Variant' },
  { key: 'pricePaid',        label: 'Price Paid' },
  { key: 'priceSold',        label: 'Price Sold' },
  { key: 'estimatedValue',   label: 'Estimated Value' },
  { key: 'location',         label: 'Location' },
  { key: 'storageUnit',      label: 'Storage Unit' },
  { key: 'purchaseDate',     label: 'Purchase Date' },
  { key: 'purchasedFrom',    label: 'Purchased From' },
  { key: 'soldDate',         label: 'Sold Date' },
  { key: 'soldOn',           label: 'Sold On' },
  { key: 'borrowedTo',       label: 'Borrowed To' },
  { key: 'borrowedDate',     label: 'Borrowed Date' },
  { key: 'borrowReturnDate', label: 'Return Date' },
  { key: 'borrowNotes',      label: 'Borrow Notes' },
  { key: 'isFavorite',       label: 'Favorite' },
  { key: 'tags',             label: 'Tags' },
  { key: 'quantity',         label: 'Quantity' },
  { key: 'notes',            label: 'Notes' },
  { key: 'barcode',          label: 'Barcode' },
]

const CF_TYPES = [
  { value: 'text',    label: 'Text' },
  { value: 'number',  label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'date',    label: 'Date' },
]

function EditCollection({ collectionId, onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎮')
  const [currency, setCurrency] = useState('€')
  const [enabledFields, setEnabledFields] = useState([])
  const [customFields, setCustomFields] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const col = await db.collections.get(collectionId)
      setName(col.name)
      setIcon(col.icon)
      setCurrency(col.currency)
      setEnabledFields(col.enabledFields || [])
      setCustomFields(col.customFields || [])
      setLoading(false)
    }
    load()
  }, [collectionId])

  function toggleField(key) {
    setEnabledFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await db.collections.update(collectionId, {
      name: name.trim(),
      icon,
      currency,
      enabledFields,
      customFields,
      updatedAt: Date.now()
    })
    onNavigate('collection', collectionId)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${name}" and all its items? This cannot be undone.`)) return
    await db.collections.update(collectionId, { isDeleted: true, deletedAt: Date.now() })
    const allItems = await db.items.where('collectionId').equals(collectionId).toArray()
    for (const item of allItems) {
      await db.items.update(item.id, { isDeleted: true, deletedAt: Date.now() })
    }
    onNavigate('home')
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <div className="app" data-screen-label="Edit Collection">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('collection', collectionId)}><Icon.back /></button>
        <h1 className="title title--sm">Edit collection</h1>
      </header>

      <div className="field-block">
        <label className="label">Icon</label>
        <div className="emoji-grid">
          {EMOJI_OPTIONS.map(e => (
            <button key={e} className={'emoji-btn' + (icon === e ? ' emoji-btn--on' : '')} onClick={() => setIcon(e)}>{e}</button>
          ))}
        </div>
      </div>

      <div className="field-block">
        <label className="label">Name</label>
        <input className="input" placeholder="e.g. My PS2 Games" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="field-block">
        <label className="label">Currency</label>
        <CurrencyPicker value={currency} onChange={setCurrency} />
      </div>

      <div className="field-block">
        <label className="label">Enabled fields</label>
        <p className="note note--tight">Turning off a field hides it but never deletes existing data.</p>
      </div>

      <div className="locked"><Icon.check className="ic--sm" /><span>Name — always on</span></div>
      <div className="locked"><Icon.check className="ic--sm" /><span>Status — always on</span></div>

      <div className="list">
        {AVAILABLE_FIELDS.map(field => {
          const on = enabledFields.includes(field.key)
          return (
            <div key={field.key} className={'toggle' + (on ? ' toggle--on' : '')} onClick={() => toggleField(field.key)}>
              <span className="toggle__label">{field.label}</span>
              <span className="toggle__box"><Icon.check className="ic--sm" /></span>
            </div>
          )
        })}
      </div>

      <div className="topbar">
        <span className="help-h grow">Custom fields</span>
        <button className="btn btn--ghost btn--sm" onClick={() => setCustomFields(prev => [...prev, { id: 'cf' + Date.now(), label: '', type: 'text' }])}>
          <Icon.plus /><span>Add field</span>
        </button>
      </div>

      {customFields.length === 0 && (
        <p className="note center">No custom fields yet</p>
      )}

      <div className="list">
        {customFields.map(cf => (
          <div key={cf.id} className="cf-card">
            <div className="cf-row">
              <input
                className="input grow"
                placeholder="Field label e.g. Region"
                value={cf.label}
                onChange={e => setCustomFields(prev => prev.map(f => f.id === cf.id ? { ...f, label: e.target.value } : f))}
              />
              <button className="iconbtn" onClick={() => setCustomFields(prev => prev.filter(f => f.id !== cf.id))}><Icon.x className="ic--sm" /></button>
            </div>
            <div className="cf-types">
              {CF_TYPES.map(t => (
                <button
                  key={t.value}
                  className={'seg-btn' + (cf.type === t.value ? ' seg-btn--on' : '')}
                  onClick={() => setCustomFields(prev => prev.map(f => f.id === cf.id ? { ...f, type: t.value } : f))}
                >{t.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn--primary btn--block" disabled={saving || !name.trim()} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      <div className="card card--pad">
        <p className="alert alert--warn">Deleting this collection also removes all its items and cannot be undone.</p>
        <button className="btn btn--danger btn--block" onClick={handleDelete}>Delete collection</button>
      </div>

    </div>
  )
}

export default EditCollection
