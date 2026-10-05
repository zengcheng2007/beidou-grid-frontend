<template>
  <div class="coord-input">
    <!-- 标签页切换：坐标编码 / 网格码解码 -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'encode' }"
        @click="activeTab = 'encode'"
      >坐标 → 网格码</button>
      <button
        :class="{ active: activeTab === 'decode' }"
        @click="activeTab = 'decode'"
      >网格码 → 定位</button>
    </div>

    <!-- 坐标编码表单 -->
    <div v-if="activeTab === 'encode'" class="form-section">
      <div class="form-row">
        <label>经度 (lng)</label>
        <input
          v-model.number="form.longitude"
          type="number"
          step="0.000001"
          placeholder="例: 116.4074"
          @input="onCoordChange"
        />
      </div>
      <div class="form-row">
        <label>纬度 (lat)</label>
        <input
          v-model.number="form.latitude"
          type="number"
          step="0.000001"
          placeholder="例: 39.9042"
          @input="onCoordChange"
        />
      </div>
      <div class="form-row">
        <label>精度级别</label>
        <select v-model.number="form.precision" @change="onCoordChange">
          <option
            v-for="lvl in PRECISION_LEVELS"
            :key="lvl.precision"
            :value="lvl.precision"
          >{{ lvl.label }}</option>
        </select>
      </div>
      <div v-if="encodeResult" class="result-box">
        <div class="result-label">网格码</div>
        <div class="result-value code">{{ encodeResult.code }}</div>
        <div class="result-meta">
          中心点: {{ encodeResult.longitude.toFixed(6) }}, {{ encodeResult.latitude.toFixed(6) }}
        </div>
        <button class="btn-secondary" @click="locateOnMap(encodeResult.longitude, encodeResult.latitude, encodeResult.code)">
          📍 定位到地图
        </button>
      </div>
    </div>

    <!-- 网格码解码表单 -->
    <div v-if="activeTab === 'decode'" class="form-section">
      <div class="form-row">
        <label>北斗网格码</label>
        <input
          v-model="form.code"
          type="text"
          placeholder="例: wx4g0bm6c4"
          @input="onCodeChange"
        />
      </div>
      <div v-if="codeValidation" :class="['validation', codeValidation.valid ? 'valid' : 'invalid']">
        {{ codeValidation.message }}
      </div>
      <div v-if="decodeResult" class="result-box">
        <div class="result-label">解码结果</div>
        <div class="result-meta">
          中心点: {{ decodeResult.center.longitude.toFixed(6) }}, {{ decodeResult.center.latitude.toFixed(6) }}
        </div>
        <div class="result-meta">
          经度范围: [{{ decodeResult.range.longitude[0].toFixed(6) }}, {{ decodeResult.range.longitude[1].toFixed(6) }}]
        </div>
        <div class="result-meta">
          纬度范围: [{{ decodeResult.range.latitude[0].toFixed(6) }}, {{ decodeResult.range.latitude[1].toFixed(6) }}]
        </div>
        <button class="btn-primary" @click="locateAndHighlight(decodeResult)">
          🗺️ 定位并高亮网格
        </button>
      </div>
    </div>

    <!-- 快捷城市 -->
    <div class="quick-cities">
      <div class="section-title">快捷城市</div>
      <div class="city-chips">
        <button
          v-for="city in cities"
          :key="city.name"
          class="city-chip"
          @click="selectCity(city)"
        >{{ city.name }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  PRECISION_LEVELS,
  encodeCoord,
  decodeCode,
  validateCode,
  validateCoord
} from '../api/index.js'

const emit = defineEmits(['locate', 'highlight'])

const activeTab = ref('encode')

const form = reactive({
  longitude: 116.4074,
  latitude: 39.9042,
  precision: 6,
  code: ''
})

const encodeResult = ref(null)
const decodeResult = ref(null)
const codeValidation = ref(null)

const cities = [
  { name: '北京', lng: 116.4074, lat: 39.9042 },
  { name: '上海', lng: 121.4737, lat: 31.2304 },
  { name: '广州', lng: 113.2644, lat: 23.1291 },
  { name: '深圳', lng: 114.0579, lat: 22.5431 },
  { name: '成都', lng: 104.0668, lat: 30.5728 },
  { name: '武汉', lng: 114.3055, lat: 30.5928 }
]

function onCoordChange() {
  const v = validateCoord(form.longitude, form.latitude)
  if (!v.valid) {
    encodeResult.value = null
    return
  }
  try {
    encodeResult.value = encodeCoord(form.longitude, form.latitude, form.precision)
  } catch (e) {
    encodeResult.value = null
  }
}

function onCodeChange() {
  const v = validateCode(form.code)
  codeValidation.value = v
  if (!v.valid) {
    decodeResult.value = null
    return
  }
  try {
    decodeResult.value = decodeCode(form.code)
  } catch (e) {
    decodeResult.value = null
  }
}

function selectCity(city) {
  form.longitude = city.lng
  form.latitude = city.lat
  activeTab.value = 'encode'
  onCoordChange()
  emit('locate', {
    longitude: city.lng,
    latitude: city.lat,
    zoom: 10
  })
}

function locateOnMap(lng, lat, code) {
  emit('locate', { longitude: lng, latitude: lat, zoom: 12 })
  if (code) {
    const result = decodeCode(code)
    emit('highlight', result)
  }
}

function locateAndHighlight(result) {
  emit('locate', {
    longitude: result.center.longitude,
    latitude: result.center.latitude,
    zoom: 14
  })
  emit('highlight', result)
}

// 初始化时自动编码
onCoordChange()
</script>

<style scoped>
.coord-input {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 16px;
  width: 340px;
}
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.tabs button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.tabs button.active {
  background: #1976d2;
  color: #fff;
  border-color: #1976d2;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-row label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}
.form-row input,
.form-row select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-row input:focus,
.form-row select:focus {
  border-color: #1976d2;
}
.result-box {
  background: #f0f7ff;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 10px;
}
.result-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.result-value.code {
  font-size: 20px;
  font-weight: 700;
  color: #1976d2;
  font-family: monospace;
  letter-spacing: 2px;
}
.result-meta {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
  font-family: monospace;
}
.validation {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}
.validation.valid {
  color: #2e7d32;
  background: #e8f5e9;
}
.validation.invalid {
  color: #c62828;
  background: #ffebee;
}
.btn-primary,
.btn-secondary {
  margin-top: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  width: 100%;
  transition: opacity 0.2s;
}
.btn-primary {
  background: #1976d2;
  color: #fff;
}
.btn-secondary {
  background: #e3f2fd;
  color: #1976d2;
}
.btn-primary:hover,
.btn-secondary:hover {
  opacity: 0.85;
}
.quick-cities {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #eee;
}
.section-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}
.city-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.city-chip {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.city-chip:hover {
  background: #e3f2fd;
  border-color: #1976d2;
  color: #1976d2;
}
</style>
