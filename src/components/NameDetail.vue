<template>
  <div class="name-detail-container">
    <div v-if="!selectedName && !selectedKanji" class="empty-state">
      名前を選択してください
    </div>
    
    <!-- 読み方詳細 -->
    <div v-else-if="selectedName && !selectedKanji" class="reading-detail">
      <div class="detail-header">
        <h2 class="detail-title">{{ selectedName.reading }}</h2>
        <button 
          @click="clearSelection"
          class="close-button"
        >
          ✕ 解除
        </button>
      </div>
      
      <!-- スコア表示 -->
      <div class="score-section">
        <h3 class="section-title">スコア</h3>
        <div class="score-grid">
          <div class="score-item">
            <span>男性:</span>
            <span class="score-value">{{ selectedName.masculinity.toFixed(2) }}</span>
          </div>
          <div class="score-item">
            <span>女性:</span>
            <span class="score-value">{{ selectedName.femininity.toFixed(2) }}</span>
          </div>
          <div class="score-item">
            <span>柔らか:</span>
            <span class="score-value">{{ selectedName.softness.toFixed(2) }}</span>
          </div>
          <div class="score-item">
            <span>伝統:</span>
            <span class="score-value">{{ selectedName.traditional.toFixed(2) }}</span>
          </div>
          <div class="score-item">
            <span>珍しさ:</span>
            <span class="score-value">{{ selectedName.rarity.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 漢字候補 -->
      <div class="kanji-section">
        <h3 class="section-title">漢字候補</h3>
        <div class="kanji-content">
          <div v-if="kanjiCandidates.length === 0" class="empty-message">
            漢字候補がありません
          </div>
          <div v-else class="kanji-grid">
            <button
              v-for="kanji in kanjiCandidates"
              :key="kanji"
              @click="selectKanji(kanji)"
              class="kanji-button"
            >
              {{ kanji }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 漢字詳細 -->
    <div v-else-if="selectedKanji" class="kanji-detail">
      <div class="back-section">
        <button 
          @click="goBackToReading"
          class="back-button"
        >
          ← {{ selectedName?.reading }}に戻る
        </button>
      </div>
      
      <h2 class="detail-title">{{ selectedKanji }}</h2>
      
      <!-- 読み方候補 -->
      <div class="readings-section">
        <h3 class="section-title">読み方候補</h3>
        <div class="readings-content">
          <div v-if="kanjiReadings.length === 0" class="empty-message">
            読み方候補がありません
          </div>
          <div v-else class="readings-grid">
            <span
              v-for="reading in kanjiReadings"
              :key="reading"
              class="reading-tag"
              @click="selectReadingFromKanji(reading)"
            >
              {{ reading }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { NameScore } from '../utils/nameData';
import { getKanjiByReading, getReadingsByKanji } from '../utils/nameData';

const props = defineProps<{
  selectedName: NameScore | null;
  allNames: NameScore[];
}>();

const emit = defineEmits<{
  selectName: [name: NameScore | null];
}>();

const selectedKanji = ref<string | null>(null);

const kanjiCandidates = computed(() => {
  if (!props.selectedName) return [];
  return getKanjiByReading(props.selectedName.reading);
});

const kanjiReadings = computed(() => {
  if (!selectedKanji.value) return [];
  return getReadingsByKanji(selectedKanji.value);
});

const selectKanji = (kanji: string) => {
  selectedKanji.value = kanji;
};

const goBackToReading = () => {
  selectedKanji.value = null;
};

const clearSelection = () => {
  emit('selectName', null);
};

const selectReadingFromKanji = (reading: string) => {
  // 読み方に対応するNameScoreを検索
  const targetName = props.allNames.find(name => name.reading === reading);
  if (targetName) {
    selectedKanji.value = null; // 漢字選択をリセット
    emit('selectName', targetName); // その読み方の詳細に遷移
  } else {
    console.warn('Reading not found in names list:', reading);
  }
};

// selectedNameが変更されたときにselectedKanjiをリセット
watch(() => props.selectedName, () => {
  selectedKanji.value = null;
});
</script>

<style scoped>
.name-detail-container {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;
}

.reading-detail,
.kanji-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.detail-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-button {
  color: #6b7280;
  font-size: 0.75rem;
  padding: 4px 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #374151;
}

.score-section {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #f9fafb;
  flex-shrink: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.score-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #374151;
}

.score-value {
  font-weight: 600;
  color: #111827;
}

.kanji-section,
.readings-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.kanji-content,
.readings-content {
  flex: 1;
  overflow-y: auto;
}

.kanji-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.kanji-button {
  padding: 12px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.kanji-button:hover {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}

.readings-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reading-tag {
  padding: 6px 12px;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 20px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reading-tag:hover {
  background-color: #bfdbfe;
}

.back-section {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.back-button {
  color: #2563eb;
  font-size: 0.75rem;
  padding: 4px 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.2s;
}

.back-button:hover {
  color: #1d4ed8;
}

.empty-message {
  color: #6b7280;
  font-size: 0.75rem;
  text-align: center;
  padding: 20px;
}
</style> 