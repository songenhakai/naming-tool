<template>
  <div class="w-full h-full p-4">
    <h2 class="text-lg font-bold mb-4">名前一覧</h2>
    
    <!-- 検索フィルタ -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="読み方で検索..."
        class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
    </div>
    
    <!-- 名前一覧 -->
    <div class="border border-gray-300 rounded max-h-96 overflow-y-auto">
      <div class="text-sm text-gray-600 p-2 border-b bg-gray-50">
        {{ filteredNames.length }} 件の名前
      </div>
      <div 
        v-for="name in filteredNames" 
        :key="name.reading"
        class="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
        :class="{ 'bg-blue-100': selectedName?.reading === name.reading }"
        @click="selectName(name)"
      >
        <div class="font-medium text-base">{{ name.reading }}</div>
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
/* 追加のスタイルがあれば記述 */
</style> 