import { useRef } from 'react'
import Icon from '../icons'

const MAX_PHOTOS = 8
const MAX_DIM = 1600 // px, longest side
const JPEG_QUALITY = 0.82

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = ev => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round(height * (MAX_DIM / width))
            width = MAX_DIM
          } else {
            width = Math.round(width * (MAX_DIM / height))
            height = MAX_DIM
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Multi-photo picker / gallery editor.
 * photos: array of dataURL strings
 * onChange: (newPhotos[]) => void
 */
function PhotoPicker({ photos = [], onChange, label = 'Photos' }) {
  const inputRef = useRef(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const room = MAX_PHOTOS - photos.length
    const toProcess = files.slice(0, room)
    const compressed = await Promise.all(toProcess.map(compressImage))
    onChange([...photos, ...compressed])
    e.target.value = ''
  }

  function removeAt(idx) {
    onChange(photos.filter((_, i) => i !== idx))
  }

  function moveTo(idx, dir) {
    const target = idx + dir
    if (target < 0 || target >= photos.length) return
    const next = [...photos]
    const [moved] = next.splice(idx, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className="field-block">
      <label className="label">{label}{photos.length > 0 ? ` (${photos.length}/${MAX_PHOTOS})` : ''}</label>

      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((p, idx) => (
            <div key={idx} className="photo-grid__cell">
              <img className="photo-grid__img" src={p} alt={`Photo ${idx + 1}`} />
              {idx === 0 && <span className="photo-grid__badge">Cover</span>}
              <div className="photo-grid__actions">
                {idx > 0 && (
                  <button type="button" className="photo-grid__btn" title="Move left" onClick={() => moveTo(idx, -1)}>
                    <Icon.back className="ic--sm" />
                  </button>
                )}
                <button type="button" className="photo-grid__btn photo-grid__btn--danger" title="Remove" onClick={() => removeAt(idx)}>
                  <Icon.x className="ic--sm" />
                </button>
                {idx < photos.length - 1 && (
                  <button type="button" className="photo-grid__btn" title="Move right" onClick={() => moveTo(idx, 1)}>
                    <Icon.chev className="ic--sm" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length < MAX_PHOTOS && (
        <label className="file-input">
          {photos.length > 0 ? 'Add more photos' : 'Take or choose photos'}
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} hidden />
        </label>
      )}
    </div>
  )
}

export default PhotoPicker
