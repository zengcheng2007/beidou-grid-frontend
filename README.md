# 北斗位置网格可视化前端

基于 Vue 3 + Cesium 的北斗位置网格可视化系统，支持坐标编码、网格码解码、地图定位和网格高亮显示。

## 功能特性

- 🗺️ **Cesium 3D 地球** — 基于 Cesium 的三维地图展示
- 📍 **坐标编码** — 输入经纬度，实时计算北斗网格码
- 🔍 **网格码解码** — 输入网格码，自动定位到对应位置
- 🎨 **网格高亮** — 在地图上绘制并高亮网格矩形
- 📊 **多级精度** — 支持 L1~L10 共 10 个精度级别
- 🏙️ **快捷城市** — 一键定位到北京、上海、广州等中国主要城市

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **地图引擎**: Cesium
- **编解码库**: 北斗位置网格编解码 (beidou-core.js, GBT 39409-2020)

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

## 构建部署

```bash
# 生产构建
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
beidou-grid-frontend/
├── index.html                    # 入口 HTML
├── package.json                  # 依赖配置
├── vite.config.js                # Vite 配置（含 Cesium 插件）
├── src/
│   ├── main.js                   # Vue 入口
│   ├── App.vue                   # 根组件
│   ├── views/
│   │   └── Home.vue              # 主页面
│   ├── components/
│   │   ├── CesiumMap.vue         # Cesium 地图组件
│   │   └── CoordInput.vue        # 坐标/网格码输入组件
│   ├── api/
│   │   └── index.js              # API 封装层
│   └── lib/
│       └── beidou-core.js        # 北斗编解码核心库
```

## 核心交互流程

### 坐标 → 网格码
1. 在左侧面板输入经度和纬度
2. 选择精度级别 (L1~L10)
3. 系统实时计算并显示北斗网格码
4. 点击「定位到地图」可在地图上查看

### 网格码 → 定位
1. 切换到「网格码 → 定位」标签页
2. 输入北斗网格码（如: wx4g0bm6c4）
3. 点击「定位并高亮网格」
4. 地图自动飞行到对应位置，绘制并高亮网格矩形

### 精度切换
- 不同精度级别对应不同网格尺寸
- L1: ~1000km（大区域）
- L4: ~35km（城市级）
- L6: ~1.1km（街区级）
- L8: ~38m（建筑物级）
- L10: ~1.2m（亚米级）

## 参考标准

- GBT 39409-2020《北斗卫星导航系统位置网格编码》

## 相关仓库

- [beidou-codec](https://github.com/zengcheng2007/beidou-codec) — 北斗编解码库（Java + JavaScript）
- [full-view-agent-runtime](https://github.com/zengcheng2007/full-view-agent-runtime) — 后端 Agent Runtime

## 许可证

MIT
