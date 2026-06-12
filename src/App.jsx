import { useState, useCallback } from 'react'
import Home from './pages/Home'
import CreateCollection from './pages/CreateCollection'
import Collection from './pages/Collection'
import AddItem from './pages/AddItem'
import ItemDetail from './pages/ItemDetail'
import EditItem from './pages/EditItem'
import EditCollection from './pages/EditCollection'
import Trash from './pages/Trash'
import ExportImport from './pages/ExportImport'
import QrScannerModal from './components/QrScannerModal'
import Icon from './icons'

function BottomNav({ page, pageParam, onNavigate, onScanOpen }) {
  const isHome = page === 'home'
  const isCollection = page === 'collection'

  if (isHome) {
    return (
      <nav className="bottom-nav">
        <div className="bottom-nav__side">
          <button
            className="bottom-nav__btn bottom-nav__btn--active"
            onClick={() => onNavigate('home')}
          >
            <Icon.home />
            <span>Home</span>
          </button>
        </div>
        <div className="bottom-nav__side">
          <button className="bottom-nav__btn" onClick={onScanOpen} title="Scan QR">
            <Icon.camera />
            <span>Camera</span>
          </button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__side">
        <button className="bottom-nav__btn" onClick={() => onNavigate('home')}>
          <Icon.home />
          <span>Home</span>
        </button>
      </div>
      <div className="bottom-nav__side">
        <button className="bottom-nav__btn" onClick={onScanOpen} title="Scan QR">
          <Icon.camera />
          <span>Camera</span>
        </button>
      </div>
      <div className="bottom-nav__side">
        {isCollection && (
          <button
            className="bottom-nav__btn bottom-nav__btn--active"
            onClick={() => onNavigate('addItem', pageParam)}
          >
            <Icon.plus />
            <span>Add</span>
          </button>
        )}
      </div>
    </nav>
  )
}

function App() {
  const [page, setPage] = useState('home')
  const [pageParam, setPageParam] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState(null)

  function handleNavigate(newPage, param = null) {
    setPage(newPage)
    setPageParam(param)
  }

  const handleScanResult = useCallback((text) => {
    setScannerOpen(false)
    // QR format: collector-item:{id}:{name}
    const match = text.match(/^collector-item:(\d+):/)
    if (match) {
      handleNavigate('item', parseInt(match[1], 10))
    } else {
      setScanError('QR code not recognised as a collector item.')
      setTimeout(() => setScanError(null), 3500)
    }
  }, [])

  function renderPage() {
    if (page === 'home')             return <Home onNavigate={handleNavigate} />
    if (page === 'createCollection') return <CreateCollection onNavigate={handleNavigate} />
    if (page === 'collection')       return <Collection collectionId={pageParam} onNavigate={handleNavigate} />
    if (page === 'addItem')          return <AddItem collectionId={pageParam} onNavigate={handleNavigate} />
    if (page === 'item')             return <ItemDetail itemId={pageParam} onNavigate={handleNavigate} />
    if (page === 'editItem')         return <EditItem itemId={pageParam} onNavigate={handleNavigate} />
    if (page === 'editCollection')   return <EditCollection collectionId={pageParam} onNavigate={handleNavigate} />
    if (page === 'trash')            return <Trash onNavigate={handleNavigate} />
    if (page === 'exportImport')     return <ExportImport onNavigate={handleNavigate} />
    return <div className="loading">Page not found</div>
  }

  return (
    <>
      {renderPage()}

      <BottomNav
        page={page}
        pageParam={pageParam}
        onNavigate={handleNavigate}
        onScanOpen={() => setScannerOpen(true)}
      />

      {scanError && (
        <div className="cam-toast">
          <Icon.x className="ic--sm" />
          {scanError}
        </div>
      )}

      {scannerOpen && (
        <QrScannerModal
          onClose={() => setScannerOpen(false)}
          onResult={handleScanResult}
        />
      )}
    </>
  )
}

export default App