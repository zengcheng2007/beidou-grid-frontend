<template>
  <div class="home-view">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-title">
        <span class="logo">🛰️</span>
        <h1>北斗位置网格可视化系统</h1>
      </div>
      <div class="header-info">
        <span class="version">v0.1.0</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <aside class="side-panel">
        <CoordInput
          @locate="onLocate"
          @highlight="onHighlight"
        />

        <!-- 网格信息面板 -->
        <div v-if="currentGridInfo" class="info-panel">
          <div class="panel-title">网格信息</div>
          <div class="info-row">
            <span class="info-label">精度级别:</span>
            <span class="info-value">L{{ currentGridInfo.precision }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">网格尺寸:</span>
            <span class="info-value">{{ currentGridInfo.widthMeters.toFixed(1) }}m × {{ currentGridInfo.heightMeters.toFixed(1) }}m</span>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="usage-panel">
          <div class="panel-title">使用说明</div>
          <ol class="usage-steps">
            <li>输入坐标或选择城市，自动计算网格码</li>
            <li>输入网格码，定位到对应位置并高亮显示</li>
            <li>切换精度级别查看不同尺度的网格</li>
            <li>支持鼠标交互：旋转、缩放、平移</li>
          </ol>
        </div>
      </aside>

      <!-- 地图区域 -->
      <main class="map-area">
        <CesiumMap ref="cesiumMapRef" @ready="onMapReady" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CesiumMap from '../components/CesiumMap.vue'
import CoordInput from '../components/CoordInput.vue'
import { getGridInfo, decodeCode } from '../api/index.js'

const cesiumMapRef = ref(null)
const mapReady = ref(false)
const currentGridInfo = ref(null)

function onMapReady() {
  mapReady.value = true
}

/**
 * 定位到坐标
 */
function onLocate({ longitude, latitude, zoom }) {
  if (cesiumMapRef.value) {
    cesiumMapRef.value.flyTo(longitude, latitude, zoom)
    cesiumMapRef.value.addMarker(longitude, latitude)
  }
}

/**
 * 高亮网格
 */
function onHighlight(result) {
  if (cesiumMapRef.value) {
    cesiumMapRef.value.highlightGrid(result)
    // 更新网格信息
    const precision = result.range.longitude[0].toString().length
    currentGridInfo.value = {
      precision,
      ...getGridInfo(precision, result.center.latitude)
    }
  }
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

/* 顶部导航栏 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  background: #1976d2;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-title .logo {
  font-size: 24px;
}
.header-title h1 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}
.header-info .version {
  font-size: 12px;
  opacity: 0.8;
}

/* 主内容区 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧面板 */
.side-panel {
  width: 380px;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f5f5f5;
}

/* 信息面板 */
.info-panel,
.usage-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 16px;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}
.info-label {
  color: #666;
}
.info-value {
  color: #333;
  font-weight: 500;
  font-family: monospace;
}
.usage-steps {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #555;
  line-height: 1.8;
}

/* 地图区域 */
.map-area {
  flex: 1;
  position: relative;
}
</style>
