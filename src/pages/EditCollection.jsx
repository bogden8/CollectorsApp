import { useState, useEffect } from 'react'
import { db } from '../db'

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

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>

  const input = {
    width: '100%', padding: 12, fontSize: 15,
    borderRadius: 8, border: '1px solid #ddd',
    marginBottom: 14, boxSizing: 'border-box'
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, paddingBottom: 80 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => onNavigate('collection', collectionId)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >←</button>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>Edit Collection</h1>
      </div>

      <label style={{ fontSize: 13, color: '#666', marginBottom: 4, display: 'block' }}>Icon</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {EMOJI_OPTIONS.map(e => (
          <button
            key={e}
            onClick={() => setIcon(e)}
            style={{
              fontSize: 28, padding: 8, border: icon === e ? '2px solid #7F77DD' : '1px solid #ddd',
              borderRadius: 8, background: icon === e ? '#EEEDFE' : 'white', cursor: 'pointer'
            }}
          >
            {e}
          </button>
        ))}
      </div>

      <label style={{ fontSize: 13, color: '#666', marginBottom: 4, display: 'block' }}>Name *</label>
      <input
        style={input}
        placeholder="e.g. My PS2 Games"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <label style={{ fontSize: 13, color: '#666', marginBottom: 4, display: 'block' }}>Currency Symbol</label>
      <input
        style={input}
        placeholder="€ $ RON"
        value={currency}
        onChange={e => setCurrency(e.target.value)}
      />

      <label style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'block' }}>
        Enabled Fields
      </label>
      <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
        Turning off a field hides it but never deletes existing data.
      </p>

      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
        <span style={{ color: '#999', fontSize: 14 }}>✅ Name — always on</span>
      </div>
      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
        <span style={{ color: '#999', fontSize: 14 }}>✅ Status — always on</span>
      </div>

      {AVAILABLE_FIELDS.map(field => (
        <div
          key={field.key}
          onClick={() => toggleField(field.key)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', marginBottom: 6, borderRadius: 8, cursor: 'pointer',
            border: '1px solid',
            borderColor: enabledFields.includes(field.key) ? '#7F77DD' : '#ddd',
            background: enabledFields.includes(field.key) ? '#EEEDFE' : 'white',
          }}
        >
          <span style={{ fontSize: 15 }}>{field.label}</span>
          <span style={{ fontSize: 20 }}>
            {enabledFields.includes(field.key) ? '☑' : '☐'}
          </span>
        </div>
      ))}

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Custom Fields</span>
          <button
            onClick={() => setCustomFields(prev => [...prev, { id: 'cf' + Date.now(), label: '', type: 'text' }])}
            style={{
              padding: '6px 12px', background: '#534AB7', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >+ Add Field</button>
        </div>

        {customFields.length === 0 && (
          <p style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '12px 0' }}>
            No custom fields yet
          </p>
        )}

        {customFields.map(cf => (
          <div key={cf.id} style={{
            border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10, background: 'white'
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                style={{
                  flex: 1, padding: '8px 10px', fontSize: 14,
                  borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box'
                }}
                placeholder="Field label e.g. Region"
                value={cf.label}
                onChange={e => setCustomFields(prev =>
                  prev.map(f => f.id === cf.id ? { ...f, label: e.target.value } : f)
                )}
              />
              <button
                onClick={() => setCustomFields(prev => prev.filter(f => f.id !== cf.id))}
                style={{
                  padding: '0 10px', background: 'none', border: '1px solid #ddd',
                  borderRadius: 6, cursor: 'pointer', fontSize: 16, color: '#999'
                }}
              >✕</button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: 'text',    label: 'Text' },
                { value: 'number',  label: 'Number' },
                { value: 'boolean', label: 'Yes/No' },
                { value: 'date',    label: 'Date' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setCustomFields(prev =>
                    prev.map(f => f.id === cf.id ? { ...f, type: t.value } : f)
                  )}
                  style={{
                    padding: '5px 10px', fontSize: 12, borderRadius: 6, border: '1px solid',
                    borderColor: cf.type === t.value ? '#7F77DD' : '#ddd',
                    background: cf.type === t.value ? '#EEEDFE' : 'white',
                    color: cf.type === t.value ? '#534AB7' : '#666',
                    cursor: 'pointer'
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        style={{
          width: '100%', padding: 14, background: '#534AB7', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer',
          marginTop: 16, opacity: name.trim() ? 1 : 0.5
        }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

    </div>
  )
}

export default EditCollection