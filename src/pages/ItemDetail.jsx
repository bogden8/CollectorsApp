import { useState, useEffect, useRef } from 'react'
import { db } from '../db'
import QRCode from 'qrcode'

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
        width: 180,
        margin: 2,
        color: { dark: '#534AB7', light: '#ffffff' }
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

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>
  if (!item) return <div style={{ padding: 16 }}>Item not found</div>

  const statusColor = {
    owned:    '#1D9E75',
    wishlist: '#7F77DD',
    sold:     '#888',
    borrowed: '#F5A623'
  }

  const field = (label, value) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontSize: 13, color: '#999' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
    </div>
  ) : null

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, paddingBottom: 80 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => onNavigate('collection', item.collectionId)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >←</button>
        <h1 style={{ fontSize: 20, fontWeight: 500, flex: 1 }}>{item.name}</h1>
        {item.isFavorite && <span style={{ fontSize: 20 }}>⭐</span>}
      </div>

      {item.photo && (
        <img src={item.photo} alt={item.name}
          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500,
          background: statusColor[item.status] + '20',
          color: statusColor[item.status],
          textTransform: 'capitalize'
        }}>
          {item.status}
        </span>
        {item.condition && (
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 13,
            background: '#FFF3CD', color: '#856404'
          }}>
            {item.condition}
          </span>
        )}
        {item.platform && (
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 13,
            background: '#E6F1FB', color: '#185FA5'
          }}>
            {item.platform}
          </span>
        )}
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 10, padding: '0 14px', marginBottom: 16 }}>
        {field('Price Paid', item.pricePaid != null ? `${item.pricePaid}${collection.currency}` : null)}
        {field('Estimated Value', item.estimatedValue != null ? `${item.estimatedValue}${collection.currency}` : null)}
        {field('Price Sold', item.priceSold != null ? `${item.priceSold}${collection.currency}` : null)}
        {item.pricePaid && item.priceSold && field(
          'Profit / Loss',
          `${item.priceSold - item.pricePaid > 0 ? '+' : ''}${(item.priceSold - item.pricePaid).toFixed(2)}${collection.currency}`
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
          return field(cf.label || 'Custom Field', display)
        })}
      </div>

      <div style={{
        background: 'white', border: '1px solid #eee', borderRadius: 10,
        padding: 16, marginBottom: 16, textAlign: 'center'
      }}>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>QR Code</p>
        <canvas ref={qrRef} style={{ borderRadius: 8 }} />
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '8px 20px', background: '#534AB7', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer'
            }}
          >
            🖨 Print QR Label
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onNavigate('editItem', item.id)}
          style={{
            flex: 1, padding: 12, background: 'white', color: '#534AB7',
            border: '1px solid #534AB7', borderRadius: 8, fontSize: 15, cursor: 'pointer'
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          style={{
            flex: 1, padding: 12, background: 'white', color: '#e74c3c',
            border: '1px solid #e74c3c', borderRadius: 8, fontSize: 15, cursor: 'pointer'
          }}
        >
          🗑 Delete
        </button>
      </div>

    </div>
  )
}

export default ItemDetail