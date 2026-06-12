import { useState } from 'react'
import { db } from '../db'
import Icon from '../icons'

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
    <div className="app" data-screen-label="Create Collection">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => step === 1 ? onNavigate('home') : setStep(1)}><Icon.back /></button>
        <div className="topbar__titles">
          <span className="kicker">step {step} of 2</span>
          <h1 className="title title--sm">{step === 1 ? 'New collection' : 'Choose fields'}</h1>
        </div>
      </header>

      {step === 1 && (
        <>
          <div className="field-block">
            <label className="label">Pick an icon</label>
            <div className="emoji-grid">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} className={'emoji-btn' + (icon === e ? ' emoji-btn--on' : '')} onClick={() => setIcon(e)}>{e}</button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <label className="label">Name</label>
            <input className="input" type="text" placeholder="e.g. My PS2 Games" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="field-block">
            <label className="label">Currency symbol</label>
            <input className="input" type="text" placeholder="€  $  RON" value={currency} onChange={e => setCurrency(e.target.value)} />
          </div>

          <button className="btn btn--primary btn--block" disabled={!name.trim()} onClick={() => name.trim() && setStep(2)}>
            Next — choose fields
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="note note--tight">You can change these later. Name and Status are always on.</p>

          <div className="locked"><Icon.check className="ic--sm" /><span>Name — always on</span></div>
          <div className="locked"><Icon.check className="ic--sm" /><span>Status (owned / wishlist / sold / borrowed) — always on</span></div>

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

          <button className="btn btn--primary btn--block" disabled={saving} onClick={handleSave}>
            {saving ? 'Creating…' : `Create “${name}” ${icon}`}
          </button>
        </>
      )}

    </div>
  )
}

export default CreateCollection
