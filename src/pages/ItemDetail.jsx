import { useState, useEffect, useRef } from 'react'
import { db } from '../db'
import QRCode from 'qrcode'
import Icon from '../icons'

function ItemDetail({ itemId, onNavigate }) {
  const [item, setItem] = useState(null)
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const qrRef = useRef(null)

  useEffect(() => {
    async function loadData() {
      const i = await db.items.get(itemId)
      const col = await db.collections.get(i.collectionId)
      setItem(i)
      setCollection(col)
      setLoading(false)
    }
    loadData()
  }, [itemId])

  useEffect(() => {
    if (item && qrRef.current) {
      QRCode.toCanvas(qrRef.current, `collector-item:${item.id}:${item.name}`, {
        width: 200,
        margin: 1,
        color: { dark: '#1b1613', light: '#f2e7d8' }
      })
    }
  }, [item])

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"?`)) return
    await db.items.update(itemId, { isDeleted: true, deletedAt: Date.now() })
    onNavigate('collection', item.collectionId)
  }

  function handlePrint() {
    const canvas = qrRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    const win = window.open('')
    win.document.write(`
      <html><body style="text-align:center; font-family: sans-serif; padding: 40px;">
        <img src="${dataUrl}" style="width:200px;height:200px;" />
        <p style="font-size:18px; font-weight:bold; margin-top:16px;">${item.name}</p>
        ${item.platform ? `<p style="color:#666;">${item.platform}</p>` : ''}
        ${item.location ? `<p style="color:#666;">📍 ${item.location}</p>` : ''}
        <script>window.onload = () => { window.print(); window.close() }<` + `/script>
      </body></html>
    `)
  }

  if (loading) return <div className="loading">Loading…</div>
  if (!item) return <div className="loading">Item not found</div>

  const field = (label, value, mod = '') => value ? (
    <div className={'field' + (mod ? ' ' + mod : '')}>
      <span className="field__l">{label}</span>
      <span className="field__v">{value}</span>
    </div>
  ) : null

  const profit = item.pricePaid && item.priceSold ? (item.priceSold - item.pricePaid) : null

  return (
    <div className="app app--fab" data-screen-label="Item Detail">

      <header className="topbar">
        <button className="iconbtn iconbtn--bare" onClick={() => onNavigate('collection', item.collectionId)}><Icon.back /></button>
        <h1 className="title title--sm grow">{item.name}</h1>
        {item.isFavorite && <span className="fav fav--lg"><Icon.star /></span>}
      </header>

      {item.photo
        ? <img className="hero-img" src={item.photo} alt={item.name} />
        : <div className="hero-ph">no photo</div>}

      <div className="pillrow">
        <span className="pill" data-status={item.status}>{item.status}</span>
        {item.condition && <span className="pill">{item.condition}</span>}
        {item.platform && <span className="pill">{item.platform}</span>}
      </div>

      <div className="card fieldcard">
        {field('Price Paid', item.pricePaid != null ? `${item.pricePaid}${collection.currency}` : null)}
        {field('Estimated Value', item.estimatedValue != null ? `${item.estimatedValue}${collection.currency}` : null)}
        {field('Price Sold', item.priceSold != null ? `${item.priceSold}${collection.currency}` : null)}
        {profit != null && field(
          'Profit / Loss',
          `${profit > 0 ? '+' : ''}${profit.toFixed(2)}${collection.currency}`,
          profit >= 0 ? 'field--profit' : 'field--loss'
        )}
        {field('Location', item.location)}
        {field('Storage Unit', item.storageUnit)}
        {field('Purchased From', item.purchasedFrom)}
        {field('Purchase Date', item.purchaseDate)}
        {field('Sold On', item.soldOn)}
        {field('Sold Date', item.soldDate)}
        {field('Borrowed To', item.borrowedTo)}
        {field('Borrowed Date', item.borrowedDate)}
        {field('Return Date', item.borrowReturnDate)}
        {field('Borrow Notes', item.borrowNotes)}
        {field('Quantity', item.quantity)}
        {item.tags?.length > 0 && field('Tags', item.tags.join(', '))}
        {field('Notes', item.notes)}
        {(collection.customFields || []).map(cf => {
          const val = item.customFieldValues?.[cf.id]
          if (val === undefined || val === null || val === '') return null
          const display = cf.type === 'boolean' ? (val ? 'Yes' : 'No') : String(val)
          return <span key={cf.id}>{field(cf.label || 'Custom Field', display)}</span>
        })}
      </div>

      <div className="card qrcard">
        <span className="qrcard__label">QR label · scan to find</span>
        <div className="qr">
          <canvas ref={qrRef} />
        </div>
        <button className="btn btn--ghost btn--sm" onClick={handlePrint}><Icon.printer /><span>Print</span></button>
      </div>

      <div className="action-row">
        <button className="btn btn--outline" onClick={() => onNavigate('editItem', item.id)}><Icon.edit /><span>Edit</span></button>
        <button className="btn btn--danger" onClick={handleDelete}><Icon.trash /><span>Delete</span></button>
      </div>

    </div>
  )
}

export default ItemDetail
