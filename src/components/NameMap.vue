<template>
  <div class="w-full h-full p-4">
    <div class="mb-4 flex gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">X軸</label>
        <select 
          v-model="xAxis" 
          class="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option v-for="option in axisOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Y軸</label>
        <select 
          v-model="yAxis" 
          class="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option v-for="option in axisOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="relative border border-gray-300 bg-white" style="width: 500px; height: 400px;">
      <!-- 軸ラベル -->
      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-sm font-medium">
        {{ axisOptions.find(opt => opt.value === xAxis)?.label }}
      </div>
      <div class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 -rotate-90 text-sm font-medium">
        {{ axisOptions.find(opt => opt.value === yAxis)?.label }}
      </div>
      
      <!-- グリッド線 -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <!-- 縦線 -->
        <line v-for="i in 5" :key="`v-${i}`" 
          :x1="i * 100" y1="0" 
          :x2="i * 100" y2="400" 
          stroke="#e5e7eb" stroke-width="1" />
        <!-- 横線 -->
        <line v-for="i in 5" :key="`h-${i}`" 
          x1="0" :y1="i * 80" 
          x2="500" :y2="i * 80" 
          stroke="#e5e7eb" stroke-width="1" />
      </svg>
      
      <!-- データポイント -->
      <div 
        v-for="name in filteredNames" 
        :key="name.reading"
        class="absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10"
        :style="{
          left: (name[xAxis] * 480 + 10) + 'px',
          bottom: (name[yAxis] * 380 + 10) + 'px',
          fontSize: Math.max(8, 16 - name.rarity * 8) + 'px',
          color: selectedName?.reading === name.reading ? '#ef4444' : '#374151'
        }"
        @click="selectName(name)"
        :title="`${name.reading} (${xAxis}: ${name[xAxis].toFixed(2)}, ${yAxis}: ${name[yAxis].toFixed(2)})`"
      >
        {{ name.reading }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NameScore, AxisType } from '../utils/nameData';
import { axisOptions } from '../utils/nameData';

const props = defineProps<{
  names: NameScore[];
  selectedName: NameScore | null;
}>();

const emit = defineEmits<{
  selectName: [name: NameScore];
}>();

const xAxis = ref<AxisType>('femininity');
const yAxis = ref<AxisType>('softness');

const filteredNames = computed(() => {
  return props.names;
});

const selectName = (name: NameScore) => {
  emit('selectName', name);
};
</script>

<style scoped>
/* 追加のスタイルがあれば記述 */
</style> 