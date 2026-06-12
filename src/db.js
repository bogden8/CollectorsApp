import Dexie from 'dexie'

export const db = new Dexie('CollectorDB')

db.version(1).stores({
  collections: '++id, name, createdAt, updatedAt, isDeleted',
  items: '++id, collectionId, name, status, platform, pricePaid, priceSold, estimatedValue, location, isFavorite, isDeleted, createdAt, updatedAt',
  settings: '++id'
})

// v2: multi-photo support, manual collection ordering, tag index for fast lookups
db.version(2).stores({
  collections: '++id, name, createdAt, updatedAt, isDeleted, order',
  items: '++id, collectionId, name, status, platform, pricePaid, priceSold, estimatedValue, location, isFavorite, isDeleted, createdAt, updatedAt, *tags',
  settings: '++id'
}).upgrade(async tx => {
  // Migrate single `photo` into `photos` array
  await tx.table('items').toCollection().modify(item => {
    if (item.photo && (!item.photos || item.photos.length === 0)) {
      item.photos = [item.photo]
    } else if (!item.photos) {
      item.photos = []
    }
  })

  // Assign incremental order to existing collections (by createdAt)
  const cols = await tx.table('collections').toCollection().sortBy('createdAt')
  for (let i = 0; i < cols.length; i++) {
    await tx.table('collections').update(cols[i].id, { order: i })
  }
})
