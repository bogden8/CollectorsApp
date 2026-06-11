import Dexie from 'dexie'

export const db = new Dexie('CollectorDB')

db.version(1).stores({
  collections: '++id, name, createdAt, updatedAt, isDeleted',
  items: '++id, collectionId, name, status, platform, pricePaid, priceSold, estimatedValue, location, isFavorite, isDeleted, createdAt, updatedAt',
  settings: '++id'
})