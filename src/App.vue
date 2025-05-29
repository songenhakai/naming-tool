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
  <div class="app-grid">
    <!-- ヘッダ -->
    <header class="header">
      <div class="header-content">
        <h1 class="header-title">ひまりヘルパー（キャラクター命名ツール）</h1>
      </div>
    </header>
    
    <!-- メインマップエリア -->
    <main class="main-area">
      <NameMap 
        :names="filteredNames" 
        :selected-name="selectedName"
        @select-name="handleSelectName"
      />
    </main>
    
    <!-- サイドパネル -->
    <aside class="sidebar">
      <div v-if="!selectedName" class="sidebar-content">
        <NameList 
          :names="allNames"
          :selected-name="selectedName"
          @select-name="handleSelectName"
          @update-filter="handleUpdateFilter"
        />
      </div>
      <div v-else class="sidebar-content">
        <NameDetail 
          :selected-name="selectedName"
          :all-names="allNames"
          @select-name="handleSelectName"
        />
      </div>
    </aside>
  </div>
</template>

<style>
#app {
  font-family: system-ui, -apple-system, sans-serif;
}

.app-grid {
  display: grid;
  grid-template-areas: 
    "header header"
    "main sidebar";
  grid-template-rows: auto 1fr;
  grid-template-columns: 3fr 1fr;
  height: 100vh;
  background-color: #f3f4f6;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
}

.header {
  grid-area: header;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header-content {
  padding: 12px 20px;
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.main-area {
  grid-area: main;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  min-height: 0;
}

.sidebar {
  grid-area: sidebar;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  min-height: 0;
  min-width: 300px;
}

.sidebar-content {
  height: 100%;
  overflow: hidden;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .app-grid {
    grid-template-areas: 
      "header"
      "main"
      "sidebar";
    grid-template-rows: auto 2fr 1fr;
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    min-width: unset;
  }
}
</style>
