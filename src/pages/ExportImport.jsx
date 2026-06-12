import { useState } from 'react'
import { db } from '../db'
import Icon from '../icons'

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
    <div className="app" data-screen-label="Export / Import">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('home')}><Icon.back /></button>
        <div className="topbar__titles">
          <span className="kicker">keep it safe</span>
          <h1 className="title title--sm">Backup &amp; restore</h1>
        </div>
      </header>

      {message && (
        <div className={'alert ' + (message.type === 'success' ? 'alert--success' : 'alert--error')}>
          {message.type === 'success' ? <Icon.check className="ic--sm" /> : <Icon.x className="ic--sm" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="card card--pad card--stack">
        <div className="card-head">
          <Icon.download />
          <span className="help-h">Export backup</span>
        </div>
        <p className="note">Downloads a JSON file with all your collections and items. Save it somewhere safe — your phone’s Downloads folder, Google Drive, or email it to yourself.</p>
        <button className="btn btn--primary btn--block" onClick={handleExport}>Download backup</button>
      </div>

      <div className="card card--pad card--stack">
        <div className="card-head">
          <Icon.upload />
          <span className="help-h">Import backup</span>
        </div>
        <p className="note">Restore from a previously exported backup file.</p>
        <div className="alert alert--warn">
          <span>⚠️ This will replace all current data. Export first if you want to keep it.</span>
        </div>
        <label className="btn btn--outline btn--block">
          {importing ? 'Importing…' : 'Choose backup file'}
          <input type="file" accept=".json" onChange={handleImport} disabled={importing} hidden />
        </label>
      </div>

      <div className="tip-card">
        <span className="help-h">💡 Tips</span>
        <ul className="tip-list">
          <li>Export regularly so you never lose your data</li>
          <li>Use export to move your collection to a new device</li>
          <li>Keep backups in Google Drive or Dropbox for safety</li>
          <li>The backup file is plain JSON — open it in any text editor</li>
        </ul>
      </div>

    </div>
  )
}

export default ExportImport
