<template>
  <div class="name-list-container">
    <h2 class="list-title">名前一覧</h2>
    
    <!-- 検索フィルタ -->
    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="読み方で検索..."
        class="search-input"
      />
    </div>
    
    <!-- 名前一覧 -->
    <div class="list-container">
      <div class="list-header">
        {{ filteredNames.length }} 件
      </div>
      <div class="list-content">
        <div 
          v-for="name in filteredNames" 
          :key="name.reading"
          class="name-item"
          :class="{ 'name-item-selected': selectedName?.reading === name.reading }"
          @click="selectName(name)"
        >
          <div class="name-text">{{ name.reading }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { NameScore } from '../utils/nameData';

const props = defineProps<{
  names: NameScore[];
  selectedName: NameScore | null;
}>();

const emit = defineEmits<{
  selectName: [name: NameScore];
  updateFilter: [names: NameScore[]];
}>();

const searchQuery = ref('');

const filteredNames = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.names;
  }
  
  return props.names.filter(name => 
    name.reading.includes(searchQuery.value.trim())
  );
});

// フィルタ結果を親に通知
watch(filteredNames, (newFilteredNames) => {
  emit('updateFilter', newFilteredNames);
}, { immediate: true });

const selectName = (name: NameScore) => {
  emit('selectName', name);
};
</script>

<style scoped>
.name-list-container {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.list-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  flex-shrink: 0;
}

.search-section {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.75rem;
  color: #374151;
  background: white;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}

.search-input::placeholder {
  color: #9ca3af;
}

.list-container {
  flex: 1;
  min-height: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}

.list-header {
  padding: 12px 16px;
  font-size: 0.75rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.name-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
  background: white;
}

.name-item:hover {
  background-color: #dbeafe;
}

.name-item-selected {
  background-color: #bfdbfe !important;
}

.name-item:last-child {
  border-bottom: none;
}

.name-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
  line-height: 1.4;
}

/* スクロールバーのスタイリング */
.list-content::-webkit-scrollbar {
  width: 6px;
}

.list-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.list-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.list-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 