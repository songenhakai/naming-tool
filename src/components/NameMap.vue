<template>
  <div class="name-map-container">
    <div class="controls-section">
      <div class="axis-controls">
        <div class="axis-control">
          <label class="axis-label">X軸</label>
          <select 
            v-model="xAxis" 
            class="axis-select"
          >
            <option v-for="option in axisOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="axis-control">
          <label class="axis-label">Y軸</label>
          <select 
            v-model="yAxis" 
            class="axis-select"
          >
            <option v-for="option in axisOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- ズーム・パンコントロール -->
      <div class="zoom-controls">
        <div class="zoom-display">
          ズーム: {{ (zoomLevel * 100).toFixed(0) }}%
        </div>
        <button 
          @click="zoomIn"
          class="zoom-button zoom-in"
          :disabled="zoomLevel >= maxZoom"
        >
          ＋
        </button>
        <button 
          @click="zoomOut"
          class="zoom-button zoom-out"
          :disabled="zoomLevel <= minZoom"
        >
          －
        </button>
        <button 
          @click="resetView"
          class="reset-button"
        >
          リセット
        </button>
      </div>
    </div>
    
    <!-- スクロール可能なコンテナ -->
    <div 
      ref="containerRef"
      class="map-container"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <div 
        ref="mapRef"
        class="map-content"
        :style="{
          width: '1200px',
          height: '1000px',
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
      >
        <!-- 軸ラベル -->
        <div class="axis-label-x">
          {{ axisOptions.find(opt => opt.value === xAxis)?.label }}
        </div>
        <div class="axis-label-y">
          {{ axisOptions.find(opt => opt.value === yAxis)?.label }}
        </div>
        
        <!-- グリッド線 -->
        <svg class="grid-svg">
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
          <g class="grid-labels">
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
          v-for="name in positionedNames" 
          :key="name.reading"
          class="name-point"
          :style="{
            left: name.adjustedX + 'px',
            bottom: name.adjustedY + 'px',
            fontSize: Math.max(10, 18 - name.rarity * 6) / zoomLevel + 'px',
            color: name.rarity >= 0.65 
              ? `hsl(0, 0%, ${selectedName?.reading === name.reading ? '20%' : '40%'})` 
              : `hsl(${240 - (name.femininity * 240)}, 70%, ${selectedName?.reading === name.reading ? '20%' : '30%'})`,
            fontWeight: selectedName?.reading === name.reading ? 'bold' : 'normal',
            opacity: Math.max(0.3, 1 - name.rarity * 0.7),
            textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white, 0 0 4px white',
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
    <div class="instructions">
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

const xAxis = ref<AxisType>('softness');
const yAxis = ref<AxisType>('traditional');

// ズーム・パン関連の状態
const containerRef = ref<HTMLElement>();
const mapRef = ref<HTMLElement>();
const zoomLevel = ref(5);
const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);
const minZoom = 0.5;
const maxZoom = 10;

// マップを中央に配置する関数
const centerMap = () => {
  if (containerRef.value) {
    const containerRect = containerRef.value.getBoundingClientRect();
    const mapWidth = 1200 * zoomLevel.value;
    const mapHeight = 1000 * zoomLevel.value;
    
    panX.value = (containerRect.width - mapWidth) / 2;
    panY.value = (containerRect.height - mapHeight) / 2;
  }
};

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
    const baseX = name[xAxis.value] * 1160 - 200;
    const baseY = name[yAxis.value] * 960 - 200;
    
    // 読みに基づいてオフセットを生成
    const hash = getReadingHash(name.reading);
    const offsetX = (hash % 120) - 60; // -60 ~ +59のオフセット
    const offsetY = ((hash >> 8) % 120) - 60; // -60 ~ +59のオフセット
    
    return {
      ...name,
      baseX,
      baseY,
      adjustedX: Math.max(10, Math.min(1180, baseX + offsetX)),
      adjustedY: Math.max(10, Math.min(980, baseY + offsetY))
    };
  });
  
  // 衝突回避処理
  const minDistance = 25; // 最小距離
  const repelForce = 15; // 反発力
  const iterations = 3; // 反復回数
  
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const name1 = names[i];
        const name2 = names[j];
        
        const dx = name2.adjustedX - name1.adjustedX;
        const dy = name2.adjustedY - name1.adjustedY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance && distance > 0) {
          // 正規化された方向ベクトル
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          
          // 移動量計算
          const moveDistance = (minDistance - distance) / 2;
          const moveX = normalizedDx * moveDistance * repelForce / minDistance;
          const moveY = normalizedDy * moveDistance * repelForce / minDistance;
          
          // 互いに逆方向に移動
          name1.adjustedX = Math.max(10, Math.min(1180, name1.adjustedX - moveX));
          name1.adjustedY = Math.max(10, Math.min(980, name1.adjustedY - moveY));
          name2.adjustedX = Math.max(10, Math.min(1180, name2.adjustedX + moveX));
          name2.adjustedY = Math.max(10, Math.min(980, name2.adjustedY + moveY));
        }
      }
    }
  }
  
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
  centerMap();
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
  centerMap();
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.name-map-container {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-shrink: 0;
  gap: 16px;
  flex-wrap: wrap;
}

.axis-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.axis-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.axis-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.axis-select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 0.75rem;
  background: white;
  color: #374151;
  min-width: 100px;
}

.axis-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.zoom-display {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

.zoom-button,
.reset-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.zoom-button {
  background-color: #2563eb;
  color: white;
  min-width: 32px;
}

.zoom-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #2563eb;
}

.reset-button {
  background-color: #6b7280;
  color: white;
}

.reset-button:hover {
  background-color: #4b5563;
}

.map-container {
  flex: 1;
  overflow: hidden;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: grab;
  user-select: none;
  position: relative;
}

.map-content {
  position: relative;
  transform-origin: top left;
}

.map-container:active {
  cursor: grabbing;
}

.axis-label-x {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(24px);
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  z-index: 20;
  pointer-events: none;
}

.axis-label-y {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) translateX(-24px) rotate(-90deg);
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  z-index: 20;
  pointer-events: none;
}

.grid-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.grid-labels {
  font-size: 0.75rem;
  fill: #6b7280;
}

.name-point {
  position: absolute;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  pointer-events: auto;
}

.name-point:hover {
  transform: scale(1.25);
  z-index: 30 !important;
  font-weight: bold !important;
}

.instructions {
  margin-top: 8px;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  flex-shrink: 0;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .axis-controls {
    justify-content: center;
  }
  
  .zoom-controls {
    justify-content: center;
  }
  
  .axis-select {
    min-width: 80px;
  }
}
</style> 