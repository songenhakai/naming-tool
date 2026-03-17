import Database from 'better-sqlite3'
import { writeFileSync } from 'fs'

const db = new Database('data.db')

function exportData() {
  const readings = db.prepare(`
    SELECT id, reading, masculinity, femininity, softness, traditional, rarity
    FROM readings
    ORDER BY id
  `).all() as { id: number; reading: string; masculinity: number; femininity: number; softness: number; traditional: number; rarity: number }[]

  const kanjiReadings = db.prepare(`
    SELECT kanji, reading_id
    FROM kanji_readings
    ORDER BY kanji, reading_id
  `).all() as { kanji: string; reading_id: number }[]

  const readingIdToReading = new Map(readings.map(r => [r.id, r.reading]))

  const kanjiToReading: Record<string, string[]> = {}
  const readingToKanji: Record<string, string[]> = {}

  for (const { kanji, reading_id } of kanjiReadings) {
    const reading = readingIdToReading.get(reading_id)
    if (!reading) continue

    if (!kanjiToReading[kanji]) kanjiToReading[kanji] = []
    kanjiToReading[kanji].push(reading)

    if (!readingToKanji[reading]) readingToKanji[reading] = []
    readingToKanji[reading].push(kanji)
  }

  const scoresObj: Record<string, { masculinity: number; femininity: number; softness: number; traditional: number; rarity: number }> = {}
  for (const r of readings) {
    scoresObj[r.reading] = {
      masculinity: r.masculinity,
      femininity: r.femininity,
      softness: r.softness,
      traditional: r.traditional,
      rarity: r.rarity,
    }
  }

  const nameDictionariesContent = `// 自動生成された名前辞書
// 生成日時: ${new Date().toLocaleString('ja-JP')}

// 漢字から読み方を検索する辞書
export const KANJI_TO_READING: Record<string, string[]> = ${JSON.stringify(kanjiToReading, null, 2)
    .replace(/"([^"]+)":/g, '"$1":')
    .replace(/^\s{2}/gm, '  ')};

// 読み方から漢字を検索する辞書
export const READING_TO_KANJI: Record<string, string[]> = ${JSON.stringify(readingToKanji, null, 2)
    .replace(/"([^"]+)":/g, '"$1":')
    .replace(/^\s{2}/gm, '  ')};
`

  const scoresContent = `export const scores = ${JSON.stringify(scoresObj, null, 2)
    .replace(/"([^"]+)":/g, '"$1":')
    .replace(/^\s{2}/gm, '  ')};
`

  writeFileSync('src/data/name-dictionaries.ts', nameDictionariesContent)
  writeFileSync('src/data/scores.ts', scoresContent)

  console.log('Exported:')
  console.log(`  - kanji: ${Object.keys(kanjiToReading).length}`)
  console.log(`  - readings: ${readings.length}`)
  console.log(`  - kanji-reading pairs: ${kanjiReadings.length}`)

  db.close()
}

exportData()