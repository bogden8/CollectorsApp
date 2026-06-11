import { useState } from 'react'
import Home from './pages/Home'
import CreateCollection from './pages/CreateCollection'
import Collection from './pages/Collection'
import AddItem from './pages/AddItem'
import ItemDetail from './pages/ItemDetail'
import EditItem from './pages/EditItem'
import EditCollection from './pages/EditCollection'
import Trash from './pages/Trash'
import ExportImport from './pages/ExportImport'

function App() {
  const [page, setPage] = useState('home')
  const [pageParam, setPageParam] = useState(null)

  function handleNavigate(newPage, param = null) {
    setPage(newPage)
    setPageParam(param)
  }

  if (page === 'home')             return <Home onNavigate={handleNavigate} />
  if (page === 'createCollection') return <CreateCollection onNavigate={handleNavigate} />
  if (page === 'collection')       return <Collection collectionId={pageParam} onNavigate={handleNavigate} />
  if (page === 'addItem')          return <AddItem collectionId={pageParam} onNavigate={handleNavigate} />
  if (page === 'item')             return <ItemDetail itemId={pageParam} onNavigate={handleNavigate} />
  if (page === 'editItem')         return <EditItem itemId={pageParam} onNavigate={handleNavigate} />
  if (page === 'editCollection')   return <EditCollection collectionId={pageParam} onNavigate={handleNavigate} />
  if (page === 'trash')            return <Trash onNavigate={handleNavigate} />
  if (page === 'exportImport')     return <ExportImport onNavigate={handleNavigate} />

  return <div style={{ padding: 16 }}>Page not found</div>
}

export default App