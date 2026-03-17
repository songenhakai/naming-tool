import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const readings = sqliteTable('readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reading: text('reading').notNull().unique(),
  masculinity: real('masculinity').notNull(),
  femininity: real('femininity').notNull(),
  softness: real('softness').notNull(),
  traditional: real('traditional').notNull(),
  rarity: real('rarity').notNull(),
})

export const kanjiReadings = sqliteTable('kanji_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  kanji: text('kanji').notNull(),
  readingId: integer('reading_id').notNull().references(() => readings.id),
})