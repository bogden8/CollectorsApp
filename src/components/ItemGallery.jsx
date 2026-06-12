import { useState, useRef } from 'react'

/**
 * Swipeable photo gallery for item detail view.
 * photos: array of dataURL strings
 */
function ItemGallery({ photos = [], name }) {
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)

  if (!photos || photos.length === 0) {
    return <div className="hero-ph">no photo</div>
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    const idx = Math.round(track.scrollLeft / track.clientWidth)
    setActive(idx)
  }

  return (
    <div className="gallery">
      <div className="gallery__track" ref={trackRef} onScroll={handleScroll}>
        {photos.map((p, idx) => (
          <div className="gallery__slide" key={idx}>
            <img className="gallery__img" src={p} alt={`${name} photo ${idx + 1}`} />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="gallery__dots">
          {photos.map((_, idx) => (
            <span key={idx} className={'gallery__dot' + (idx === active ? ' gallery__dot--on' : '')} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemGallery
