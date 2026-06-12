import { useState, useEffect, useRef } from 'react'
import { db } from '../db'

function PlatformInput({ value, onChange, placeholder, field = 'platform' }) {
  const [known, setKnown]   = useState([])
  const [open, setOpen]     = useState(false)
  const wrapRef             = useRef(null)

  useEffect(() => {
    db.items.toArray().then(items => {
      const seen = [...new Set(items.map(i => i[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b))
      setKnown(seen)
    })
  }, [field])

  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const filtered = known.filter(p => {
    if (!value.trim()) return true
    return p.toLowerCase().includes(value.trim().toLowerCase())
  })

  const showList = open && filtered.length > 0

  return (
    <div ref={wrapRef} className="combobox">
      <input
        className="input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />
      {showList && (
        <div className="combobox__list">
          {filtered.map(p => (
            <div
              key={p}
              className={'combobox__item' + (value === p ? ' combobox__item--on' : '')}
              onMouseDown={e => { e.preventDefault(); onChange(p); setOpen(false) }}
            >
              {p}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlatformInput
