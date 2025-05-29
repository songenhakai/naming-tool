<template>
  <div class="w-full h-full p-2 flex flex-col">
    <div class="mb-3 flex gap-4 items-center flex-shrink-0">
      <div>
        <label class="block text-xs font-medium mb-1">X軸</label>
        <select 
          v-model="xAxis" 
          class="border border-gray-300 rounded px-2 py-1 text-xs"
        >
          <option v-for="option in axisOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium mb-1">Y軸</label>
        <select 
          v-model="yAxis" 
          class="border border-gray-300 rounded px-2 py-1 text-xs"
        >
          <option v-for="option in axisOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <!-- ズーム・パンコントロール -->
      <div class="ml-auto flex items-center gap-2">
        <div class="text-xs text-gray-600">
          ズーム: {{ (zoomLevel * 100).toFixed(0) }}%
        </div>
        <button 
          @click="zoomIn"
          class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          :disabled="zoomLevel >= maxZoom"
        >
          ＋
        </button>
        <button 
          @click="zoomOut"
          class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          :disabled="zoomLevel <= minZoom"
        >
          －
        </button>
        <button 
          @click="resetView"
          class="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
        >
          リセット
        </button>
      </div>
    </div>
    
    <!-- スクロール可能なコンテナ -->
    <div 
      ref="containerRef"
      class="overflow-hidden border border-gray-300 bg-white cursor-grab select-none flex-1"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <div 
        ref="mapRef"
        class="relative origin-top-left"
        :style="{
          width: '1200px',
          height: '1000px',
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
      >
        <!-- 軸ラベル -->
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-sm font-medium z-20">
          {{ axisOptions.find(opt => opt.value === xAxis)?.label }}
        </div>
        <div class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 -rotate-90 text-sm font-medium z-20">
          {{ axisOptions.find(opt => opt.value === yAxis)?.label }}
        </div>
        
        <!-- グリッド線 -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
          <!-- 縦線 -->
          <line v-for="i in 11" :key="`v-${i}`" 
            :x1="i * 120" y1="0" 
            :x2="i * 120" y2="1000" 
            stroke="#e5e7eb" stroke-width="1" />
          <!-- 横線 -->
          <line v-for="i in 11" :key="`h-${i}`" 
            x1="0" :y1="i * 100" 
            x2="1200" :y2="i * 100" 
            stroke="#e5e7eb" stroke-width="1" />
          
          <!-- 軸の数値ラベル -->
          <g class="text-xs fill-gray-600">
            <!-- X軸の数値 -->
            <text v-for="i in 11" :key="`x-label-${i}`"
              :x="i * 120" y="1020" 
              text-anchor="middle">
              {{ ((i-1) / 10).toFixed(1) }}
            </text>
            <!-- Y軸の数値 -->
            <text v-for="i in 11" :key="`y-label-${i}`"
              x="-10" :y="1000 - (i-1) * 100 + 5" 
              text-anchor="end">
              {{ ((i-1) / 10).toFixed(1) }}
            </text>
          </g>
        </svg>
        
        <!-- データポイント -->
        <div 
          v-for="(name, index) in positionedNames" 
          :key="name.reading"
          class="absolute cursor-pointer transition-all duration-200 hover:scale-125 hover:z-30 hover:font-bold select-none"
          :style="{
            left: name.adjustedX + 'px',
            bottom: name.adjustedY + 'px',
            fontSize: Math.max(10, 18 - name.rarity * 6) / zoomLevel + 'px',
            color: selectedName?.reading === name.reading ? '#ef4444' : '#374151',
            fontWeight: selectedName?.reading === name.reading ? 'bold' : 'normal',
            opacity: Math.max(0.3, 1 - name.rarity * 0.7),
            zIndex: selectedName?.reading === name.reading ? 25 : 10
          }"
          @click="handleNameClick(name, $event)"
          :title="`${name.reading} (${xAxis}: ${name[xAxis].toFixed(2)}, ${yAxis}: ${name[yAxis].toFixed(2)}, レア度: ${name.rarity.toFixed(2)})`"
        >
          {{ name.reading }}
        </div>
      </div>
    </div>
    
    <!-- 操作説明 -->
    <div class="mt-1 text-xs text-gray-500">
      マウスホイール: ズーム | ドラッグ: パン | クリック: 名前選択
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

// ズーム・パン関連の状態
const containerRef = ref<HTMLElement>();
const mapRef = ref<HTMLElement>();
const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);
const minZoom = 0.5;
const maxZoom = 5;

// 名前の読みに基づいてハッシュ値を生成してオフセットを決定
const getReadingHash = (reading: string): number => {
  let hash = 0;
  for (let i = 0; i < reading.length; i++) {
    const char = reading.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
};

// ポジション調整済みの名前データ
const positionedNames = computed(() => {
  const names = props.names.map(name => {
    // 基本位置を計算（マップサイズ: 1200x1000, マージン: 各側20px）
    const baseX = name[xAxis.value] * 1160 + 20;
    const baseY = name[yAxis.value] * 960 + 20;
    
    // 読みに基づいてオフセットを生成
    const hash = getReadingHash(name.reading);
    const offsetX = (hash % 40) - 20; // -20 ~ +19のオフセット
    const offsetY = ((hash >> 8) % 40) - 20; // -20 ~ +19のオフセット
    
    return {
      ...name,
      baseX,
      baseY,
      adjustedX: Math.max(10, Math.min(1180, baseX + offsetX)),
      adjustedY: Math.max(10, Math.min(980, baseY + offsetY))
    };
  });
  
  return names;
});

// ズーム機能
const zoomIn = () => {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value = Math.min(maxZoom, zoomLevel.value * 1.2);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value = Math.max(minZoom, zoomLevel.value / 1.2);
  }
};

// ビューをリセット
const resetView = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
};

// マウスホイールでズーム
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  
  const delta = event.deltaY;
  const zoomFactor = delta > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value * zoomFactor));
  
  if (newZoom !== zoomLevel.value) {
    // マウス位置を中心にズーム
    const rect = containerRef.value?.getBoundingClientRect();
    if (rect) {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // ズーム前のマウス位置（マップ座標）
      const mapMouseX = (mouseX - panX.value) / zoomLevel.value;
      const mapMouseY = (mouseY - panY.value) / zoomLevel.value;
      
      zoomLevel.value = newZoom;
      
      // ズーム後のマウス位置を維持するようにパン調整
      panX.value = mouseX - mapMouseX * newZoom;
      panY.value = mouseY - mapMouseY * newZoom;
    }
  }
};

// ドラッグ開始
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) { // 左クリックのみ
    isDragging.value = true;
    lastMouseX.value = event.clientX;
    lastMouseY.value = event.clientY;
    event.preventDefault();
  }
};

// ドラッグ中
const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - lastMouseX.value;
    const deltaY = event.clientY - lastMouseY.value;
    
    panX.value += deltaX;
    panY.value += deltaY;
    
    lastMouseX.value = event.clientX;
    lastMouseY.value = event.clientY;
    
    event.preventDefault();
  }
};

// ドラッグ終了
const handleMouseUp = () => {
  isDragging.value = false;
};

// 名前クリック処理（ドラッグと区別）
const handleNameClick = (name: NameScore, event: MouseEvent) => {
  if (!isDragging.value) {
    selectName(name);
  }
  event.stopPropagation();
};

const selectName = (name: NameScore) => {
  emit('selectName', name);
};

// グローバルマウスイベントリスナー
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
/* カーソルの調整 */
.cursor-grab:active {
  cursor: grabbing;
}

/* ボタンの無効化スタイル */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: inherit;
}
</style> 