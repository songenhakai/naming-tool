import { scores } from '../data/scores';
import { KANJI_TO_READING } from '../data/name-dictionaries';

export interface NameScore {
  reading: string;
  masculinity: number;
  femininity: number;
  softness: number;
  traditional: number;
  rarity: number;
}

export interface KanjiInfo {
  kanji: string;
  readings: string[];
}

// スコアデータを配列形式で取得
export const getNameScores = (): NameScore[] => {
  return Object.entries(scores).map(([reading, score]) => ({
    reading,
    ...score
  }));
};

// 読み方から漢字候補を取得
export const getKanjiByReading = (reading: string): string[] => {
  // KANJI_TO_READINGから逆引きで漢字を取得
  const kanjiList: string[] = [];
  
  Object.entries(KANJI_TO_READING).forEach(([kanji, readings]) => {
    if (readings.includes(reading)) {
      kanjiList.push(kanji);
    }
  });
  
  return kanjiList;
};

// 漢字から読み方を取得
export const getReadingsByKanji = (kanji: string): string[] => {
  return KANJI_TO_READING[kanji] || [];
};

// 軸の選択肢
export const axisOptions = [
  { value: 'masculinity', label: '男性らしさ' },
  { value: 'femininity', label: '女性らしさ' },
  { value: 'softness', label: '柔らかさ' },
  { value: 'traditional', label: '伝統性' },
  { value: 'rarity', label: '珍しさ' }
] as const;

export type AxisType = typeof axisOptions[number]['value'];

// フィルタ条件
export interface FilterCondition {
  search: string;
  minMasculinity?: number;
  maxMasculinity?: number;
  minFemininity?: number;
  maxFemininity?: number;
  minSoftness?: number;
  maxSoftness?: number;
  minTraditional?: number;
  maxTraditional?: number;
  minRarity?: number;
  maxRarity?: number;
}

// フィルタ適用
export const applyFilter = (names: NameScore[], filter: FilterCondition): NameScore[] => {
  return names.filter(name => {
    // 検索文字列でフィルタ
    if (filter.search && !name.reading.includes(filter.search)) {
      return false;
    }
    
    // 各スコアでフィルタ
    if (filter.minMasculinity !== undefined && name.masculinity < filter.minMasculinity) return false;
    if (filter.maxMasculinity !== undefined && name.masculinity > filter.maxMasculinity) return false;
    if (filter.minFemininity !== undefined && name.femininity < filter.minFemininity) return false;
    if (filter.maxFemininity !== undefined && name.femininity > filter.maxFemininity) return false;
    if (filter.minSoftness !== undefined && name.softness < filter.minSoftness) return false;
    if (filter.maxSoftness !== undefined && name.softness > filter.maxSoftness) return false;
    if (filter.minTraditional !== undefined && name.traditional < filter.minTraditional) return false;
    if (filter.maxTraditional !== undefined && name.traditional > filter.maxTraditional) return false;
    if (filter.minRarity !== undefined && name.rarity < filter.minRarity) return false;
    if (filter.maxRarity !== undefined && name.rarity > filter.maxRarity) return false;
    
    return true;
  });
}; 