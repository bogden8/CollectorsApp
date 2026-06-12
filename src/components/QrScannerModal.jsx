import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import Icon from '../icons'

function QrScannerModal({ onClose, onResult }) {
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        scan()
      } catch (e) {
        if (!cancelled) setError('Camera access denied. Please allow camera access in your browser settings.')
      }
    }

    function scan() {
      function tick() {
        if (cancelled) return
        const video = videoRef.current
        const canvas = canvasRef.current
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(img.data, img.width, img.height)
          if (code) { onResult(code.data); return }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [onResult])

  return (
    <div className="qrscan-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="qrscan-modal">
        <div className="qrscan-header">
          <span className="kicker">scan</span>
          <h2 className="title title--sm grow">QR Scanner</h2>
          <button className="iconbtn iconbtn--bare" onClick={onClose}><Icon.x /></button>
        </div>

        {error ? (
          <div className="alert alert--error">{error}</div>
        ) : (
          <div className="qrscan-viewport">
            <video ref={videoRef} className="qrscan-video" muted playsInline />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="qrscan-frame">
              <div className="qrscan-corner qrscan-corner--tl" />
              <div className="qrscan-corner qrscan-corner--tr" />
              <div className="qrscan-corner qrscan-corner--bl" />
              <div className="qrscan-corner qrscan-corner--br" />
            </div>
          </div>
        )}

        <p className="note center">Point at a collector item QR code</p>
      </div>
    </div>
  )
}

export default QrScannerModal
