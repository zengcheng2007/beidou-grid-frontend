<template>
  <div class="cesium-map-wrapper">
    <div ref="cesiumContainer" class="cesium-container"></div>
    <div v-if="!cesiumReady" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载 Cesium 地球...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as Cesium from 'cesium'

const emit = defineEmits(['ready'])

const cesiumContainer = ref(null)
const cesiumReady = ref(false)

let viewer = null
let gridEntity = null     // 当前高亮的网格矩形
let markerEntity = null   // 当前位置标记点

/**
 * 初始化 Cesium Viewer
 * 使用 Ion 默认 token 进行开发，生产环境应替换
 */
onMounted(async () => {
  try {
    // Cesium Ion 默认 token（开发用，生产需替换）
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6OTYyMCwiYXNzIjoiY2VzaXVtIiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU3Mjg2NjIyNX0.6DkBYbQb4T4mP1Vz_xH8mw'

    viewer = new Cesium.Viewer(cesiumContainer.value, {
      // 基础图层
      baseLayerPicker: true,
      // 时间控件（隐藏）
      timeline: false,
      animation: false,
      // 导航帮助
      navigationHelpButton: false,
      // 全屏按钮
      fullscreenButton: false,
      // 地理编码搜索
      geocoder: false,
      // 家视角按钮
      homeButton: true,
      // 场景模式
      sceneModePicker: true,
      // 选择指示器
      selectionIndicator: false,
      // 信息框
      infoBox: false,
      // 阴影
      shadows: false,
      // 开启深度测试
      scene3DOnly: false
    })

    // 初始视角：中国
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(105.0, 35.0, 8000000)
    })

    // 隐藏版权信息
    viewer.cesiumWidget.creditContainer.style.display = 'none'

    cesiumReady.value = true
    emit('ready', viewer)
  } catch (e) {
    console.error('Cesium 初始化失败:', e)
  }
})

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})

/**
 * 飞行到指定坐标
 */
function flyTo(longitude, latitude, zoom = 12) {
  if (!viewer) return
  const heightMap = {
    3: 2000000,
    5: 500000,
    8: 100000,
    10: 20000,
    12: 10000,
    14: 2000,
    16: 500
  }
  const height = heightMap[zoom] || 50000
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0.0
    },
    duration: 1.5
  })
}

/**
 * 添加位置标记点
 */
function addMarker(longitude, latitude) {
  if (!viewer) return
  // 移除旧标记
  if (markerEntity) {
    viewer.entities.remove(markerEntity)
  }
  markerEntity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2
    }
  })
}

/**
 * 绘制并高亮网格矩形
 * @param {{ range: { longitude: number[], latitude: number[] }, center: { longitude: number, latitude: number } }} result
 */
function highlightGrid(result) {
  if (!viewer) return
  // 移除旧网格
  if (gridEntity) {
    viewer.entities.remove(gridEntity)
  }
  const west = result.range.longitude[0]
  const east = result.range.longitude[1]
  const south = result.range.latitude[0]
  const north = result.range.latitude[1]

  gridEntity = viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
      material: Cesium.Color.fromCssColorString('rgba(25, 118, 210, 0.3)'),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#1976d2'),
      outlineWidth: 2,
      height: 0
    }
  })

  // 添加中心标记
  addMarker(result.center.longitude, result.center.latitude)
}

/**
 * 清除所有高亮和标记
 */
function clearHighlights() {
  if (!viewer) return
  if (gridEntity) {
    viewer.entities.remove(gridEntity)
    gridEntity = null
  }
  if (markerEntity) {
    viewer.entities.remove(markerEntity)
    markerEntity = null
  }
}

// 暴露给父组件
defineExpose({
  flyTo,
  addMarker,
  highlightGrid,
  clearHighlights,
  getViewer: () => viewer
})
</script>

<style scoped>
.cesium-map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.cesium-container {
  width: 100%;
  height: 100%;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3f2fd;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-text {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
