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
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b">
      <div class="px-4 py-3">
        <h1 class="text-2xl font-bold text-gray-900">日本人名前検索ツール</h1>
        <p class="text-sm text-gray-600 mt-1">現代的な日本人の名前を探索・分析</p>
      </div>
    </header>
    
    <main class="flex h-screen">
      <!-- 左側: 2Dマップ -->
      <div class="w-1/2 bg-white border-r">
        <NameMap 
          :names="filteredNames" 
          :selected-name="selectedName"
          @select-name="handleSelectName"
        />
      </div>
      
      <!-- 右側: 名前一覧 or 詳細 -->
      <div class="w-1/2 bg-white">
        <div v-if="!selectedName">
          <NameList 
            :names="allNames"
            :selected-name="selectedName"
            @select-name="handleSelectName"
            @update-filter="handleUpdateFilter"
          />
        </div>
        <div v-else>
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
