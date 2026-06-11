import { useState } from 'react'
import { db } from '../db'

function ExportImport({ onNavigate }) {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleExport() {
    const collections = await db.collections.toArray()
    const items = await db.items.toArray()
    const settings = await db.settings.toArray()

    const data = {
      version: 1,
      exportedAt: Date.now(),
      collections,
      items,
      settings
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `collector-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    setMessage({ type: 'success', text: 'Backup downloaded successfully' })
  }

  async function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.version || !data.collections || !data.items) {
        throw new Error('Invalid backup file')
      }

      if (!confirm(`This will replace ALL your current data with the backup from ${new Date(data.exportedAt).toLocaleDateString()}. Are you sure?`)) {
        setImporting(false)
        return
      }

      await db.collections.clear()
      await db.items.clear()
      await db.settings.clear()

      for (const col of data.collections) {
        await db.collections.put(col)
      }
      for (const item of data.items) {
        await db.items.put(item)
      }
      for (const setting of data.settings) {
        await db.settings.put(setting)
      }

      setMessage({ type: 'success', text: `Restored ${data.collections.length} collections and ${data.items.length} items` })

    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to import backup' })
    }

    setImporting(false)
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >←</button>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>Export / Import</h1>
      </div>

      {message && (
        <div style={{
          padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14,
          background: message.type === 'success' ? '#E1F5EE' : '#fff0f0',
          color: message.type === 'success' ? '#0F6E56' : '#e74c3c',
          border: `1px solid ${message.type === 'success' ? '#9FE1CB' : '#ffcccc'}`
        }}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>📤 Export Backup</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
          Downloads a JSON file with all your collections and items. Save it somewhere safe — your phone's Downloads folder, Google Drive, or email it to yourself.
        </p>
        <button
          onClick={handleExport}
          style={{
            width: '100%', padding: 12, background: '#534AB7', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer'
          }}
        >
          Download Backup
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>📥 Import Backup</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 1.5 }}>
          Restore from a previously exported backup file.
        </p>
        <div style={{
          background: '#fff8e6', border: '1px solid #ffe099', borderRadius: 8,
          padding: 10, marginBottom: 16, fontSize: 13, color: '#856404'
        }}>
          ⚠️ This will replace all current data. Export first if you want to keep it.
        </div>
        <label style={{
          display: 'block', width: '100%', padding: 12, background: 'white',
          border: '1px solid #534AB7', borderRadius: 8, fontSize: 15,
          cursor: 'pointer', textAlign: 'center', color: '#534AB7',
          boxSizing: 'border-box'
        }}>
          {importing ? 'Importing...' : 'Choose Backup File'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#666' }}>💡 Tips</h2>
        <ul style={{ fontSize: 13, color: '#888', paddingLeft: 16, lineHeight: 1.8 }}>
          <li>Export regularly so you never lose your data</li>
          <li>Use export to move your collection to a new device</li>
          <li>Keep backups in Google Drive or Dropbox for safety</li>
          <li>The backup file is plain JSON — you can open it in any text editor</li>
        </ul>
      </div>

    </div>
  )
}

export default ExportImport