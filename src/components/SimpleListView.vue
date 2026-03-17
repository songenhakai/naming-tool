<template>
  <div class="simple-list-container">
    <!-- ビュー切り替え -->
    <div class="view-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: currentView === 'plot' }"
        @click="currentView = 'plot'"
      >2Dプロット</button>
      <button 
        class="tab-btn" 
        :class="{ active: currentView === 'list' }"
        @click="currentView = 'list'"
      >シンプルリスト</button>
    </div>

    <!-- 2Dプロットビュー -->
    <div v-if="currentView === 'plot'" class="plot-view">
      <NameMap 
        :names="props.names"
        :selected-name="selectedName"
        @select-name="selectName"
      />
    </div>

    <!-- シンプリストビュー -->
    <div v-if="currentView === 'list'" class="list-view">
      <!-- フィルタセクション -->
      <div class="filter-section">
        <div class="filter-group">
          <div class="filter-label">性別</div>
          <div class="filter-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.boys" />
              <span>男の子の名前</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.girls" />
              <span>女の子の名前</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="filters.neutral" />
              <span>中性的</span>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">珍しさ</div>
          <div class="filter-options rarity-options">
            <label class="checkbox-label" v-for="level in rarityLevels" :key="level.value">
              <input type="checkbox" :value="level.value" v-model="filters.rarities" />
              <span>{{ level.label }}</span>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">検索</div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="読み方で検索..."
            class="search-input"
          />
        </div>
      </div>

      <!-- 名前一覧 -->
      <div class="names-section">
        <div class="names-header">
          {{ filteredNamesForList.length }} 件
        </div>
        <div class="names-list">
          <div 
            v-for="name in filteredNamesForList" 
            :key="name.reading"
            class="name-item"
            :class="{ 'selected': selectedName?.reading === name.reading }"
            @click="selectName(name)"
          >
            <div class="name-reading">{{ name.reading }}</div>
            <div class="name-tags">
              <span class="tag rarity-tag" :class="'rarity-' + getRarityLevel(name.rarity)">
                Lv{{ getRarityLevel(name.rarity) }}
              </span>
              <span v-if="name.masculinity > 0.6" class="tag gender-tag boys">男</span>
              <span v-else-if="name.femininity > 0.6" class="tag gender-tag girls">女</span>
              <span v-else class="tag gender-tag neutral">中</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NameMap from './NameMap.vue';
import type { NameScore } from '../utils/nameData';

const props = defineProps<{
  names: NameScore[];
  selectedName: NameScore | null;
}>();

const emit = defineEmits<{
  selectName: [name: NameScore | null];
}>();

const currentView = ref<'plot' | 'list'>('plot');
const searchQuery = ref('');

const filters = ref({
  boys: true,
  girls: true,
  neutral: true,
  rarities: [1, 2, 3, 4, 5] as number[]
});

const rarityLevels = [
  { value: 1, label: 'Lv1 (普通)' },
  { value: 2, label: 'Lv2' },
  { value: 3, label: 'Lv3 (珍しい)' }
];

const getRarityLevel = (rarity: number): number => {
  if (rarity < 0.50) return 1;
  if (rarity < 0.65) return 2;
  return 3;
};

const filteredNamesForList = computed(() => {
  return props.names.filter(name => {
    // 検索フィルタ
    if (searchQuery.value && !name.reading.includes(searchQuery.value)) {
      return false;
    }

    // 性別フィルタ
    const isBoys = name.masculinity > 0.6;
    const isGirls = name.femininity > 0.6;
    const isNeutral = !isBoys && !isGirls;

    if (!filters.value.boys && isBoys) return false;
    if (!filters.value.girls && isGirls) return false;
    if (!filters.value.neutral && isNeutral) return false;

    // 珍しさフィルタ
    const rarityLevel = getRarityLevel(name.rarity);
    if (!filters.value.rarities.includes(rarityLevel)) return false;

    return true;
  });
});

const selectName = (name: NameScore | null) => {
  emit('selectName', name);
};
</script>

<style scoped>
.simple-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f3f4f6;
}

.tab-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.plot-view {
  flex: 1;
  min-height: 0;
}

.list-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.filter-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.rarity-options {
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.search-input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}

.names-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.names-header {
  padding: 8px 16px;
  font-size: 0.75rem;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.names-list {
  flex: 1;
  overflow-y: auto;
}

.name-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.name-item:hover {
  background: #dbeafe;
}

.name-item.selected {
  background: #bfdbfe;
}

.name-reading {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
}

.name-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.rarity-tag {
  background: #e5e7eb;
  color: #374151;
}

.rarity-tag.rarity-5 {
  background: #fef3c7;
  color: #92400e;
}

.rarity-tag.rarity-4 {
  background: #ede9fe;
  color: #5b21b6;
}

.gender-tag.boys {
  background: #dbeafe;
  color: #1d4ed8;
}

.gender-tag.girls {
  background: #fce7f3;
  color: #be185d;
}

.gender-tag.neutral {
  background: #f3f4f6;
  color: #4b5563;
}

.names-list::-webkit-scrollbar {
  width: 6px;
}

.names-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.names-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>