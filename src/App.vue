<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SimpleListView from './components/SimpleListView.vue';
import NameDetail from './components/NameDetail.vue';
import type { NameScore } from './utils/nameData';
import { getNameScores } from './utils/nameData';

const allNames = ref<NameScore[]>([]);
const selectedName = ref<NameScore | null>(null);

onMounted(() => {
  allNames.value = getNameScores();
});

const handleSelectName = (name: NameScore | null) => {
  selectedName.value = name;
};
</script>

<template>
  <div class="app-grid">
    <header class="header">
      <div class="header-content">
        <h1 class="header-title">キャラクター命名支援ツール</h1>
      </div>
    </header>
    
    <main class="main-area">
      <SimpleListView 
        :names="allNames"
        :selected-name="selectedName"
        @select-name="handleSelectName"
      />
    </main>
    
    <aside class="sidebar">
      <div v-if="!selectedName" class="sidebar-content">
        <div class="placeholder">
          <p>名前を選択すると詳細が表示されます</p>
        </div>
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

.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.875rem;
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