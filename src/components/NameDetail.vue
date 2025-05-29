<template>
  <div class="w-full h-full p-4">
    <div v-if="!selectedName && !selectedKanji" class="text-center text-gray-500 mt-8">
      名前を選択してください
    </div>
    
    <!-- 読み方詳細 -->
    <div v-else-if="selectedName && !selectedKanji">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ selectedName.reading }}</h2>
        <button 
          @click="clearSelection"
          class="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕ 選択解除
        </button>
      </div>
      
      <!-- スコア表示 -->
      <div class="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 class="text-lg font-medium mb-3">スコア</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex justify-between">
            <span>男性らしさ:</span>
            <span class="font-medium">{{ selectedName.masculinity.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>女性らしさ:</span>
            <span class="font-medium">{{ selectedName.femininity.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>柔らかさ:</span>
            <span class="font-medium">{{ selectedName.softness.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>伝統性:</span>
            <span class="font-medium">{{ selectedName.traditional.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>珍しさ:</span>
            <span class="font-medium">{{ selectedName.rarity.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 漢字候補 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-3">漢字候補</h3>
        <div v-if="kanjiCandidates.length === 0" class="text-gray-500">
          漢字候補がありません
        </div>
        <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          <button
            v-for="kanji in kanjiCandidates"
            :key="kanji"
            @click="selectKanji(kanji)"
            class="p-3 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-center font-medium"
          >
            {{ kanji }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 漢字詳細 -->
    <div v-else-if="selectedKanji">
      <div class="mb-4">
        <button 
          @click="goBackToReading"
          class="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← {{ selectedName?.reading }}に戻る
        </button>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">{{ selectedKanji }}</h2>
      
      <!-- 読み方候補 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-3">読み方候補</h3>
        <div v-if="kanjiReadings.length === 0" class="text-gray-500">
          読み方候補がありません
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <span
            v-for="reading in kanjiReadings"
            :key="reading"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
            @click="selectReadingFromKanji(reading)"
          >
            {{ reading }}
          </span>
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

// 全名前データの参照
const allNames = computed(() => props.allNames);
</script>

<style scoped>
/* 追加のスタイルがあれば記述 */
</style> 