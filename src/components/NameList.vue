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
    
    <!-- 詳細フィルタ -->
    <div class="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
      <h3 class="text-sm font-medium mb-2">詳細フィルタ</h3>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="block mb-1">男性らしさ</label>
          <div class="flex gap-1">
            <input v-model.number="filters.minMasculinity" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最小">
            <span>-</span>
            <input v-model.number="filters.maxMasculinity" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最大">
          </div>
        </div>
        <div>
          <label class="block mb-1">女性らしさ</label>
          <div class="flex gap-1">
            <input v-model.number="filters.minFemininity" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最小">
            <span>-</span>
            <input v-model.number="filters.maxFemininity" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最大">
          </div>
        </div>
        <div>
          <label class="block mb-1">柔らかさ</label>
          <div class="flex gap-1">
            <input v-model.number="filters.minSoftness" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最小">
            <span>-</span>
            <input v-model.number="filters.maxSoftness" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最大">
          </div>
        </div>
        <div>
          <label class="block mb-1">伝統性</label>
          <div class="flex gap-1">
            <input v-model.number="filters.minTraditional" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最小">
            <span>-</span>
            <input v-model.number="filters.maxTraditional" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最大">
          </div>
        </div>
        <div>
          <label class="block mb-1">珍しさ</label>
          <div class="flex gap-1">
            <input v-model.number="filters.minRarity" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最小">
            <span>-</span>
            <input v-model.number="filters.maxRarity" type="number" min="0" max="1" step="0.1" 
                   class="w-16 border border-gray-300 rounded px-1 py-1" placeholder="最大">
          </div>
        </div>
      </div>
      <button 
        @click="clearFilters"
        class="mt-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
      >
        フィルタクリア
      </button>
    </div>
    
    <!-- 名前一覧 -->
    <div class="border border-gray-300 rounded max-h-96 overflow-y-auto">
      <div class="text-sm text-gray-600 p-2 border-b bg-gray-50">
        {{ filteredNames.length }} 件の名前
      </div>
      <div 
        v-for="name in filteredNames" 
        :key="name.reading"
        class="p-2 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
        :class="{ 'bg-blue-100': selectedName?.reading === name.reading }"
        @click="selectName(name)"
      >
        <div class="font-medium">{{ name.reading }}</div>
        <div class="text-xs text-gray-600 grid grid-cols-2 gap-1 mt-1">
          <span>男性: {{ name.masculinity.toFixed(2) }}</span>
          <span>女性: {{ name.femininity.toFixed(2) }}</span>
          <span>柔らか: {{ name.softness.toFixed(2) }}</span>
          <span>伝統: {{ name.traditional.toFixed(2) }}</span>
          <span>珍しさ: {{ name.rarity.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { NameScore, FilterCondition } from '../utils/nameData';
import { applyFilter } from '../utils/nameData';

const props = defineProps<{
  names: NameScore[];
  selectedName: NameScore | null;
}>();

const emit = defineEmits<{
  selectName: [name: NameScore];
  updateFilter: [names: NameScore[]];
}>();

const searchQuery = ref('');
const filters = ref<Omit<FilterCondition, 'search'>>({
  minMasculinity: undefined,
  maxMasculinity: undefined,
  minFemininity: undefined,
  maxFemininity: undefined,
  minSoftness: undefined,
  maxSoftness: undefined,
  minTraditional: undefined,
  maxTraditional: undefined,
  minRarity: undefined,
  maxRarity: undefined,
});

const filteredNames = computed(() => {
  const filterCondition: FilterCondition = {
    search: searchQuery.value,
    ...filters.value
  };
  
  return applyFilter(props.names, filterCondition);
});

// フィルタ結果を親に通知
watch(filteredNames, (newFilteredNames) => {
  emit('updateFilter', newFilteredNames);
}, { immediate: true });

const selectName = (name: NameScore) => {
  emit('selectName', name);
};

const clearFilters = () => {
  searchQuery.value = '';
  filters.value = {
    minMasculinity: undefined,
    maxMasculinity: undefined,
    minFemininity: undefined,
    maxFemininity: undefined,
    minSoftness: undefined,
    maxSoftness: undefined,
    minTraditional: undefined,
    maxTraditional: undefined,
    minRarity: undefined,
    maxRarity: undefined,
  };
};
</script>

<style scoped>
/* 追加のスタイルがあれば記述 */
</style> 