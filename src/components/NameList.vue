<template>
  <div class="w-full h-full p-2 flex flex-col">
    <h2 class="text-base font-bold mb-3 flex-shrink-0">名前一覧</h2>
    
    <!-- 検索フィルタ -->
    <div class="mb-3 flex-shrink-0">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="読み方で検索..."
        class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
      />
    </div>
    
    <!-- 名前一覧 -->
    <div class="border border-gray-300 rounded flex-1 overflow-hidden flex flex-col min-h-0">
      <div class="text-xs text-gray-600 p-2 border-b bg-gray-50 flex-shrink-0">
        {{ filteredNames.length }} 件
      </div>
      <div class="flex-1 overflow-y-auto min-h-0">
        <div 
          v-for="name in filteredNames" 
          :key="name.reading"
          class="p-2 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
          :class="{ 'bg-blue-100': selectedName?.reading === name.reading }"
          @click="selectName(name)"
        >
          <div class="font-medium text-sm">{{ name.reading }}</div>
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
/* 追加のスタイルがあれば記述 */
</style> 