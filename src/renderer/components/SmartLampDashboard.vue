<template>
  <div class="smart-lamp-dashboard">
    <header class="dashboard-header">
      <div>
        <h1>智慧路灯综合看板</h1>
        <p>统一监控 LED 发布、摄像头状态与 IP 广播任务</p>
      </div>
      <el-tag type="success" effect="dark">在线设备 {{ overview.online }}/{{ overview.total }}</el-tag>
    </header>

    <section class="overview-grid">
      <el-card shadow="hover" class="overview-card">
        <div class="overview-title">LED 节目数</div>
        <div class="overview-value">{{ ledPrograms.length }}</div>
        <div class="overview-sub">今日下发 {{ overview.ledPushedToday }} 次</div>
      </el-card>
      <el-card shadow="hover" class="overview-card">
        <div class="overview-title">摄像头在线率</div>
        <div class="overview-value">{{ overview.cameraOnlineRate }}%</div>
        <div class="overview-sub">异常告警 {{ overview.cameraAlarms }} 条</div>
      </el-card>
      <el-card shadow="hover" class="overview-card">
        <div class="overview-title">IP 广播任务</div>
        <div class="overview-value">{{ broadcastPlans.length }}</div>
        <div class="overview-sub">执行中 {{ runningBroadcastCount }} 条</div>
      </el-card>
      <el-card shadow="hover" class="overview-card">
        <div class="overview-title">能耗（kWh）</div>
        <div class="overview-value">{{ overview.energy }}</div>
        <div class="overview-sub">较昨日 {{ overview.energyTrend }}</div>
      </el-card>
    </section>

    <section class="content-grid">
      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>LED 发布管理</span>
            <el-button type="primary" size="small">新建节目</el-button>
          </div>
        </template>
        <el-table :data="ledPrograms" size="small" stripe>
          <el-table-column prop="name" label="节目名称" min-width="150" />
          <el-table-column prop="area" label="发布区域" min-width="120" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '发布中' ? 'success' : 'info'" size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>摄像头状态监控</span>
            <el-button size="small">查看地图</el-button>
          </div>
        </template>
        <div class="camera-list">
          <div v-for="camera in cameras" :key="camera.id" class="camera-item">
            <div>
              <div class="camera-name">{{ camera.name }}</div>
              <div class="camera-meta">{{ camera.position }} · {{ camera.resolution }}</div>
            </div>
            <el-tag :type="camera.online ? 'success' : 'danger'" effect="light">
              {{ camera.online ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card full-width">
        <template #header>
          <div class="panel-header">
            <span>IP 广播任务</span>
            <el-button type="warning" size="small">紧急插播</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="item in broadcastPlans"
            :key="item.id"
            :timestamp="item.time"
            :type="item.status === '执行中' ? 'primary' : 'success'"
          >
            <div class="broadcast-title">{{ item.title }}</div>
            <div class="broadcast-meta">区域：{{ item.area }} ｜ 音量：{{ item.volume }}%</div>
            <el-tag size="small" :type="item.status === '执行中' ? 'warning' : 'success'">{{ item.status }}</el-tag>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const overview = reactive({
  total: 128,
  online: 121,
  ledPushedToday: 37,
  cameraOnlineRate: 94,
  cameraAlarms: 3,
  energy: 862.4,
  energyTrend: '-3.8%'
})

const ledPrograms = reactive([
  { name: '早高峰诱导屏', area: '主干道 A 区', updatedAt: '2026-02-05 08:10', status: '发布中' },
  { name: '市政宣传轮播', area: '商业街 B 区', updatedAt: '2026-02-05 09:20', status: '待审核' },
  { name: '天气预警提示', area: '学校周边', updatedAt: '2026-02-05 10:05', status: '发布中' }
])

const cameras = reactive([
  { id: 'cam-01', name: '路口南向 1 号', position: '人民路与建设路', resolution: '1080P', online: true },
  { id: 'cam-02', name: '公交站台 2 号', position: '人民路东段', resolution: '4MP', online: true },
  { id: 'cam-03', name: '学校门口 3 号', position: '育才路西段', resolution: '1080P', online: false },
  { id: 'cam-04', name: '公园入口 4 号', position: '滨河路北段', resolution: '2K', online: true }
])

const broadcastPlans = reactive([
  { id: 'task-1', title: '防汛预警广播', area: '沿河路段', time: '11:00', volume: 85, status: '执行中' },
  { id: 'task-2', title: '文明出行提醒', area: '核心商圈', time: '13:30', volume: 65, status: '待执行' },
  { id: 'task-3', title: '夜间巡防提示', area: '重点片区', time: '19:00', volume: 72, status: '待执行' }
])

const runningBroadcastCount = computed(() => broadcastPlans.filter((item) => item.status === '执行中').length)
</script>

<style scoped>
.smart-lamp-dashboard {
  min-height: 100vh;
  color: #e8f3ff;
  background: radial-gradient(circle at top, #1b2f68, #0c1532 55%);
  border-radius: 14px;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.dashboard-header h1 {
  font-size: 26px;
  margin-bottom: 6px;
}

.dashboard-header p {
  color: #9db4d6;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.overview-card {
  background: rgba(7, 24, 60, 0.76);
  border: 1px solid rgba(81, 145, 255, 0.3);
}

.overview-title {
  color: #93acd2;
  font-size: 13px;
}

.overview-value {
  margin: 10px 0 6px;
  font-size: 30px;
  font-weight: 700;
  color: #4fd6ff;
}

.overview-sub {
  color: #b4c6e4;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.panel-card {
  background: rgba(8, 23, 55, 0.9);
  border: 1px solid rgba(98, 156, 255, 0.25);
}

.full-width {
  grid-column: 1 / -1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.camera-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(19, 39, 82, 0.8);
}

.camera-name {
  font-weight: 600;
}

.camera-meta,
.broadcast-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #9ab0d2;
}

.broadcast-title {
  margin-bottom: 4px;
  font-weight: 600;
}

:deep(.el-card__header) {
  border-color: rgba(91, 143, 255, 0.22);
  color: #f2f7ff;
}

:deep(.el-table) {
  --el-table-border-color: rgba(86, 135, 233, 0.25);
  --el-table-header-bg-color: rgba(17, 40, 88, 0.95);
  --el-table-tr-bg-color: rgba(11, 30, 72, 0.8);
  --el-table-text-color: #d8e6ff;
  --el-table-header-text-color: #9db7e4;
  --el-fill-color-blank: transparent;
}

:deep(.el-timeline-item__timestamp) {
  color: #98aed3;
}

@media (max-width: 1100px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
