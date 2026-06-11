import { useState } from 'react'
import { db } from '../db'

const EMOJI_OPTIONS = ['🎮', '👟', '📀', '🎵', '📚', '🃏', '🏆', '🎨', '🧸', '⌚', '📷', '🎸']

const AVAILABLE_FIELDS = [
  { key: 'photo',           label: 'Photo' },
  { key: 'condition',       label: 'Condition' },
  { key: 'platform',        label: 'Platform / Variant' },
  { key: 'pricePaid',       label: 'Price Paid' },
  { key: 'priceSold',       label: 'Price Sold' },
  { key: 'estimatedValue',  label: 'Estimated Value' },
  { key: 'location',        label: 'Location' },
  { key: 'storageUnit',     label: 'Storage Unit' },
  { key: 'purchaseDate',    label: 'Purchase Date' },
  { key: 'purchasedFrom',   label: 'Purchased From' },
  { key: 'soldDate',        label: 'Sold Date' },
  { key: 'soldOn',          label: 'Sold On' },
  { key: 'borrowedTo',      label: 'Borrowed To' },
  { key: 'borrowedDate',    label: 'Borrowed Date' },
  { key: 'borrowReturnDate',label: 'Return Date' },
  { key: 'borrowNotes',     label: 'Borrow Notes' },
  { key: 'isFavorite',      label: 'Favorite' },
  { key: 'tags',            label: 'Tags' },
  { key: 'quantity',        label: 'Quantity' },
  { key: 'notes',           label: 'Notes' },
  { key: 'barcode',         label: 'Barcode' },
]

function CreateCollection({ onNavigate }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎮')
  const [currency, setCurrency] = useState('€')
  const [enabledFields, setEnabledFields] = useState(
    ['photo', 'condition', 'pricePaid', 'estimatedValue', 'location', 'tags', 'notes']
  )
  const [saving, setSaving] = useState(false)

  function toggleField(key) {
    setEnabledFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await db.collections.add({
      name: name.trim(),
      icon,
      currency,
      enabledFields,
      fieldLabels: {},
      customFields: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false
    })
    onNavigate('home')
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

      {step === 1 && (
        <div>
          <button onClick={() => onNavigate('home')}>← Back</button>
          <h2 style={{ margin: '16px 0 8px' }}>Name your collection</h2>

          <p style={{ marginBottom: 16, color: '#666' }}>Pick an icon</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                style={{
                  fontSize: 28,
                  padding: 8,
                  border: icon === e ? '2px solid #7F77DD' : '1px solid #ddd',
                  borderRadius: 8,
                  background: icon === e ? '#EEEDFE' : 'white',
                  cursor: 'pointer'
                }}
              >
                {e}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="e.g. My PS2 Games"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ddd', marginBottom: 12 }}
          />

          <input
            type="text"
            placeholder="Currency symbol e.g. € $ RON"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ddd', marginBottom: 24 }}
          />

          <button
            onClick={() => name.trim() && setStep(2)}
            style={{
              width: '100%', padding: 14, background: '#534AB7', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer',
              opacity: name.trim() ? 1 : 0.5
            }}
          >
            Next → Choose Fields
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)}>← Back</button>
          <h2 style={{ margin: '16px 0 4px' }}>Choose your fields</h2>
          <p style={{ color: '#666', marginBottom: 16 }}>
            You can change these later. Name and Status are always on.
          </p>

          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
            <span style={{ color: '#999' }}>✅ Name — always on</span>
          </div>
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <span style={{ color: '#999' }}>✅ Status (owned / wishlist / sold / borrowed) — always on</span>
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

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: 14, background: '#534AB7', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer',
              marginTop: 16
            }}
          >
            {saving ? 'Creating...' : `Create "${name}" ${icon}`}
          </button>
        </div>
      )}

    </div>
  )
}

export default CreateCollection