import { KANJI_TO_READING, READING_TO_KANJI } from '../src/data/name-dictionaries'
import { scores } from '../src/data/scores'
import { db } from '../src/db'
import { readings, kanjiReadings } from '../src/db/schema'

async function importData() {
  console.log('Importing readings with scores...')
  
  const readingsData = Object.entries(scores).map(([reading, score]) => ({
    reading,
    masculinity: score.masculinity,
    femininity: score.femininity,
    softness: score.softness,
    traditional: score.traditional,
    rarity: score.rarity,
  }))
  
  await db.insert(readings).values(readingsData)
  console.log(`Imported ${readingsData.length} readings`)

  console.log('Importing kanji-readings pairs...')
  
  const kanjiReadingData: { kanji: string; readingId: number }[] = []
  
  for (const [kanji, readingsList] of Object.entries(KANJI_TO_READING)) {
    for (const reading of readingsList) {
      if (scores[reading]) {
        kanjiReadingData.push({ kanji, readingId: readingsData.findIndex(r => r.reading === reading) + 1 })
      }
    }
  }
  
  await db.insert(kanjiReadings).values(kanjiReadingData)
  console.log(`Imported ${kanjiReadingData.length} kanji-reading pairs`)
  
  console.log('Done!')
}

importData().catch(console.error)