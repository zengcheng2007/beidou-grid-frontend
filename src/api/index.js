/**
 * 北斗网格码 API 层
 * 封装编解码操作，可选对接后端服务
 */
import {
  encode,
  decode,
  rangesToCenter,
  encodeToCenter,
  calculateGridSize,
  getGridSizeInMeters
} from '../lib/beidou-core.js'

/**
 * 精度级别定义
 * L1~L10 对应不同精度的网格尺寸
 */
export const PRECISION_LEVELS = [
  { level: 1, label: 'L1 - 大区域 (~1000km)', precision: 1, color: '#ff6b6b' },
  { level: 2, label: 'L2 (~250km)', precision: 2, color: '#ffa94d' },
  { level: 3, label: 'L3 (~100km)', precision: 3, color: '#ffd43b' },
  { level: 4, label: 'L4 - 城市级 (~35km)', precision: 4, color: '#69db7c' },
  { level: 5, label: 'L5 (~15km)', precision: 5, color: '#4dabf7' },
  { level: 6, label: 'L6 - 街区级 (~1.1km)', precision: 6, color: '#9775fa' },
  { level: 7, label: 'L7 (~300m)', precision: 7, color: '#f783ac' },
  { level: 8, label: 'L8 - 建筑物级 (~38m)', precision: 8, color: '#20c997' },
  { level: 9, label: 'L9 (~15m)', precision: 9, color: '#e599f7' },
  { level: 10, label: 'L10 - 亚米级 (~1.2m)', precision: 10, color: '#74c0fc' }
]

/**
 * 坐标编码为网格码
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @param {number} precision - 精度级别
 * @returns {{ code: string, longitude: number, latitude: number }}
 */
export function encodeCoord(lng, lat, precision) {
  return encodeToCenter(lng, lat, precision)
}

/**
 * 网格码解码为坐标范围
 * @param {string} code - 北斗网格码
 * @returns {{ range: { longitude: number[], latitude: number[] }, center: { longitude: number, latitude: number } }}
 */
export function decodeCode(code) {
  const range = decode(code.trim())
  const center = rangesToCenter(range)
  return { range, center }
}

/**
 * 获取网格尺寸信息
 * @param {number} precision - 精度
 * @param {number} latitude - 纬度
 * @returns {{ width: number, height: number, lonWidth: number, latHeight: number }}
 */
export function getGridInfo(precision, latitude) {
  const meters = getGridSizeInMeters(precision, latitude)
  const degrees = calculateGridSize(precision)
  return {
    widthMeters: meters.width,
    heightMeters: meters.height,
    lonWidth: degrees.lonWidth,
    latHeight: degrees.latHeight
  }
}

/**
 * 验证网格码格式
 * @param {string} code - 待验证的网格码
 * @returns {{ valid: boolean, message: string }}
 */
export function validateCode(code) {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: '请输入网格码' }
  }
  const trimmed = code.trim()
  if (trimmed.length < 1 || trimmed.length > 10) {
    return { valid: false, message: '网格码长度应在 1~10 之间' }
  }
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'
  for (const ch of trimmed.toLowerCase()) {
    if (!BASE32.includes(ch)) {
      return { valid: false, message: `无效字符: ${ch}` }
    }
  }
  return { valid: true, message: '格式正确' }
}

/**
 * 验证坐标范围
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {{ valid: boolean, message: string }}
 */
export function validateCoord(lng, lat) {
  if (isNaN(lng) || isNaN(lat)) {
    return { valid: false, message: '请输入有效的数字' }
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, message: '经度范围: -180 ~ 180' }
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, message: '纬度范围: -90 ~ 90' }
  }
  return { valid: true, message: '坐标有效' }
}
