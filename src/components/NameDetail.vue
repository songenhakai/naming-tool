<template>
  <div class="w-full h-full p-2 flex flex-col overflow-hidden">
    <div v-if="!selectedName && !selectedKanji" class="text-center text-gray-500 mt-8">
      名前を選択してください
    </div>
    
    <!-- 読み方詳細 -->
    <div v-else-if="selectedName && !selectedKanji" class="flex flex-col h-full overflow-hidden">
      <div class="flex justify-between items-center mb-3 flex-shrink-0">
        <h2 class="text-xl font-bold">{{ selectedName.reading }}</h2>
        <button 
          @click="clearSelection"
          class="text-gray-500 hover:text-gray-700 text-xs"
        >
          ✕ 解除
        </button>
      </div>
      
      <!-- スコア表示 -->
      <div class="mb-4 p-3 border border-gray-200 rounded bg-gray-50 flex-shrink-0">
        <h3 class="text-sm font-medium mb-2">スコア</h3>
        <div class="grid grid-cols-1 gap-1 text-xs">
          <div class="flex justify-between">
            <span>男性:</span>
            <span class="font-medium">{{ selectedName.masculinity.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>女性:</span>
            <span class="font-medium">{{ selectedName.femininity.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>柔らか:</span>
            <span class="font-medium">{{ selectedName.softness.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>伝統:</span>
            <span class="font-medium">{{ selectedName.traditional.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>珍しさ:</span>
            <span class="font-medium">{{ selectedName.rarity.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 漢字候補 -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <h3 class="text-sm font-medium mb-2 flex-shrink-0">漢字候補</h3>
        <div v-if="kanjiCandidates.length === 0" class="text-gray-500 text-xs">
          漢字候補がありません
        </div>
        <div v-else class="grid grid-cols-2 gap-1 overflow-y-auto">
          <button
            v-for="kanji in kanjiCandidates"
            :key="kanji"
            @click="selectKanji(kanji)"
            class="p-2 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-center font-medium text-sm"
          >
            {{ kanji }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 漢字詳細 -->
    <div v-else-if="selectedKanji" class="flex flex-col h-full overflow-hidden">
      <div class="mb-3 flex-shrink-0">
        <button 
          @click="goBackToReading"
          class="text-blue-600 hover:text-blue-800 text-xs"
        >
          ← {{ selectedName?.reading }}に戻る
        </button>
      </div>
      
      <h2 class="text-xl font-bold mb-3 flex-shrink-0">{{ selectedKanji }}</h2>
      
      <!-- 読み方候補 -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <h3 class="text-sm font-medium mb-2 flex-shrink-0">読み方候補</h3>
        <div v-if="kanjiReadings.length === 0" class="text-gray-500 text-xs">
          読み方候補がありません
        </div>
        <div v-else class="flex flex-wrap gap-1 overflow-y-auto">
          <span
            v-for="reading in kanjiReadings"
            :key="reading"
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs cursor-pointer hover:bg-blue-200 transition-colors"
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