<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NameMap from './components/NameMap.vue';
import NameList from './components/NameList.vue';
import NameDetail from './components/NameDetail.vue';
import type { NameScore } from './utils/nameData';
import { getNameScores } from './utils/nameData';

const allNames = ref<NameScore[]>([]);
const filteredNames = ref<NameScore[]>([]);
const selectedName = ref<NameScore | null>(null);

// データ初期化
onMounted(() => {
  allNames.value = getNameScores();
  filteredNames.value = allNames.value;
});

// 名前選択処理
const handleSelectName = (name: NameScore | null) => {
  selectedName.value = name;
};

// フィルタ更新処理
const handleUpdateFilter = (names: NameScore[]) => {
  filteredNames.value = names;
};
</script>

<template>
  <div class="h-screen bg-gray-100 flex flex-col">
    <!-- さらにコンパクトなヘッダ -->
    <header class="bg-white shadow-sm border-b flex-shrink-0" style="height: 50px;">
      <div class="px-3 py-1 h-full flex flex-col justify-center">
        <h1 class="text-lg font-bold text-gray-900 leading-tight">日本人名前検索ツール</h1>
        <p class="text-xs text-gray-600 leading-tight">現代的な日本人の名前を探索・分析</p>
      </div>
    </header>
    
    <!-- メインコンテンツ - 残りの高さを使用 -->
    <main class="flex flex-1 min-h-0" style="height: calc(100vh - 50px);">
      <!-- 左側: 2Dマップ - 幅を大幅に拡大 -->
      <div class="w-3/4 bg-white border-r flex-shrink-0 h-full">
        <NameMap 
          :names="filteredNames" 
          :selected-name="selectedName"
          @select-name="handleSelectName"
        />
      </div>
      
      <!-- 右側: 名前一覧 or 詳細 - 幅を狭く -->
      <div class="w-1/4 bg-white flex-shrink-0 min-w-0 h-full overflow-hidden">
        <div v-if="!selectedName" class="h-full">
          <NameList 
            :names="allNames"
            :selected-name="selectedName"
            @select-name="handleSelectName"
            @update-filter="handleUpdateFilter"
          />
        </div>
        <div v-else class="h-full">
          <NameDetail 
            :selected-name="selectedName"
            :all-names="allNames"
            @select-name="handleSelectName"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
#app {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
