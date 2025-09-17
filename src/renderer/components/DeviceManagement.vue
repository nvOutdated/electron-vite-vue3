<template>
  <div class="device-management-container">
    <!-- 头部区域 -->
    <el-card class="header-card" shadow="always">
      <div class="header-content">
        <div class="header-left">
          <el-checkbox
            v-model="selectAll"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
            size="large"
          >
            在线设备列表
          </el-checkbox>
          <el-button
            type="primary"
            :icon="Refresh"
            @click="refreshDevices"
            class="refresh-btn"
            :loading="loading"
          >
            刷新
          </el-button>
        </div>
        <div class="header-right">
          <h3 class="section-title">数据返回区</h3>
          <el-button
            type="danger"
            :icon="Delete"
            @click="clearData"
            class="clear-btn"
          >
            清除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧设备列表 -->
      <el-col :span="8">
        <el-card class="device-list-card" shadow="always">
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>设备列表 (共 {{ devices.length }} 台)</span>
            </div>
          </template>

          <div class="device-list">
            <template
              v-for="device in devices"
              :key="device.productId + device.deviceName"
            >
              <div
                class="device-item"
                :class="{ active: device.isOnline }"
                @click="selectDevice(device)"
              >
                <el-checkbox
                  v-model="device.selected"
                  @change="handleDeviceSelect(device)"
                  class="device-checkbox"
                />
                <div class="device-info">
                  <div class="device-name">
                  <!--   <el-icon class="status-icon online">
                      <CircleCheck />
                    </el-icon> -->
                   <div v-if="device.isOnline" style="color: green;margin-left: 20px;"> {{ device.deviceCode }}</div>
                   <div v-else style="margin-left: 20px;">{{ device.deviceCode }}</div>
                  </div>
                  <!--  <div class="device-details">
                    <div class="device-type" :class="`device${device.deviceName}`">
                      设备{{ device.deviceName }}
                    </div>
                  </div> -->
                  <div class="product-id">imei: {{ device.deviceName }}</div>
                  <div class="product-id">产品ID: {{ device.productId }}</div>
                </div>
              </div>
            </template>

            <div v-if="devices.length === 0 && !loading" class="empty-device">
              <el-icon class="empty-icon"><Monitor /></el-icon>
              <p>暂无设备数据</p>
              <el-button type="primary" @click="refreshDevices"
                >点击刷新</el-button
              >
            </div>

            <div v-if="loading" class="loading-container">
              <el-icon class="is-loading"><Loading /></el-icon>
              <p>正在加载设备数据...</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :span="16">
        <el-card class="content-card" shadow="always">
          <!-- 数据显示区 -->
          <div class="data-section">
            <div class="data-display" ref="dataDisplayRef">
              <template v-if="dataLogs.length > 0">
                <div
                  v-for="(device, index) in dataLogs"
                  :key="index"
                  class="device-data-card"
                >
                  <div
                    class="device-header"
                    style="display: flex; flex-wrap: wrap"
                  >
                    <span class="label">设备:</span>
                    <span class="device-title">{{device.deviceCode}}</span>
                    <span class="label">imei:</span>
                    <span class="device-timestamp">{{
                      device.deviceName
                    }}</span>
                     <span class="label">产品ID:</span>
                    <span class="device-timestamp">{{
                      device.productId
                    }}</span>
                     <span class="label"></span>
                    <span >
                      {{ (device.data.work_a==3?'':'A灯'+workType[device.data.work_a])+
                      (device.data.work_b==3?'':'B灯'+workType[device.data.work_a])+
                      (device.data.work_c==3?'':'C灯'+workType[device.data.work_a]) }}
                    </span>
                    <span class="label">模式:</span>
                    <span >
                      {{ modeType[device.data.mode] }}
                    </span>                   
                    <span class="label">温度:</span>
                    <span >
                      {{ device.data.temperature }}°C
                    </span>
                    <span class="label">倾角:</span>
                    <span >
                      {{ device.data.angle }}
                    </span>
                    <span class="label">返回时间:</span>
                    <span class="device-timestamp">{{
                      device.data.timestamp
                    }}</span>
                  </div>
                </div>
              </template>

              <div v-else class="empty-log">
                <el-icon class="empty-message-icon"><ChatDotSquare /></el-icon>
                <p>等待设备数据推送...</p>
                <p class="empty-tip">设备上线后，数据将在此显示</p>
              </div>
            </div>
          </div>

          <!-- 控制按钮区 -->
          <div class="control-section">
            <el-button
              type="success"
              :icon="SwitchButton"
              @click="turnOn"
              :disabled="selectedDevices.length === 0"
              size="large"
              class="control-btn"
            >
              开灯
            </el-button>
            <el-button
              type="danger"
              :icon="Close"
              @click="turnOff"
              :disabled="selectedDevices.length === 0"
              size="large"
              class="control-btn"
            >
              关灯
            </el-button>
            <el-button
              type="primary"
              :icon="Search"
              @click="testDevice"
              :disabled="selectedDevices.length === 0"
              size="large"
              class="control-btn"
            >
              检测
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import {
  Refresh,
  Delete,
  Monitor,
  CircleCheck,
  SwitchButton,
  Close,
  Search,
  Loading,
  ChatDotSquare,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  queryOnlineDeviceList,
  sendTestDevice,
  sendTurnOnDevice,
  sendTurnOffDevice,
} from "../apis/test";
import { useMessageStore } from "../stores/websocketStore";
interface Device {
  productId: string;
  deviceName: string;
  deviceCode: number;
  lastTime: string;
  selected?: boolean;
  isOnline?:boolean
} 
/*  type DataLogType = {
   productId:string;


} */
// interface DataLog {
//   timestamp: string;
//   message: string;
//   type: "info" | "success" | "warning" | "error";
// }
type WorkType = {
  [key: number]: string;
}
type ModeType={
  [key:number]:string
}

const workType:WorkType={
  0:'关灯',
  1:'调光',
  2:'开灯',
}

const modeType:ModeType = {
    0:'上电',
    1:'强制',
    2:'定时',
    3:'自主学习',
    4:'时序亮灯',
    5:'紧急控制',
    6:'光控',
}
const messageStore = useMessageStore();


watch(
  () => messageStore.broadcastDevice,
  (newVal) => {
    console.log("消息推送更新");
    if(newVal.dataType==1){
      refreshDevices()
      return
    }
    devices.value.forEach((i)=>{
      if(i.deviceName==newVal.deviceName){
        i.isOnline = true
      } 
    })
    updateDataDisplay(newVal)
  },
  { deep: true }
);

// 响应式数据
const devices = ref<Device[]>([]);
const dataLogs = ref<any[]>([]);
const dataDisplayRef = ref<HTMLElement>();
const loading = ref(false);

// 计算属性
const selectedDevices = computed(() =>
  devices.value.filter((device) => device.selected)
);

const selectAll = computed({
  get: () =>
    devices.value.length > 0 &&
    devices.value.every((device) => device.selected),
  set: (value: boolean) => {
    devices.value.forEach((device) => {
      device.selected = value;
    });
  },
});

const isIndeterminate = computed(() => {
  const selectedCount = selectedDevices.value.length;
  return selectedCount > 0 && selectedCount < devices.value.length;
});

// 方法
const selectDevice = (device: Device) => {
  device.selected = !device.selected;
  // 移除选中时的日志显示
};

const handleDeviceSelect = (device: Device) => {
  // 移除选中时的日志显示
};

const handleSelectAll = () => {
  // 移除全选时的日志显示
};

const updateDataDisplay = (message: string) => {
  dataLogs.value.unshift(message)

  // 限制日志数量，避免内存过多占用
  if (dataLogs.value.length > 100) {
    dataLogs.value = dataLogs.value.slice(0, 100);
  }

  // 自动滚动到顶部
  nextTick(() => {
    if (dataDisplayRef.value) {
      dataDisplayRef.value.scrollTop = 0;
    }
  });
};

const turnOn = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning("请先选择设备");
    return;
  }
  const sendParams = selectedDevices.value.map((device: Device) => ({
    productId: device.productId,
    deviceName: device.deviceName,
    deviceCode: device.deviceCode,
    lastTime: device.lastTime,
  }));
  sendTurnOnDevice(sendParams).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success("开灯成功");
    } else {
      ElMessage.error("开灯失败");
    }
  });
};

const turnOff = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning("请先选择设备");
    return;
  }
  const sendParams = selectedDevices.value.map((device: Device) => ({
    productId: device.productId,
    deviceName: device.deviceName,
    deviceCode: device.deviceCode,
    lastTime: device.lastTime,
  }));
  sendTurnOffDevice(sendParams).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success("关灯成功");
    } else {
      ElMessage.error("关灯失败");
    }
  });
};

const testDevice = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning("请先选择设备");
    return;
  }
  console.log(selectedDevices.value);
  const params = selectedDevices.value.map((device: Device) => ({
    productId: device.productId,
    deviceName: device.deviceName,
    deviceCode: device.deviceCode,
    lastTime: device.lastTime,
  }));
  sendTestDevice(params).then((res) => {
    console.log(res);
    if (res.code === 200) {
      ElMessage.success("检测成功");
    } else {
      ElMessage.error("检测失败");
    }
  });
};

const clearData = () => {
  dataLogs.value =[]
};

const refreshDevices = async () => {
  try {
    loading.value = true;

    const res = await queryOnlineDeviceList({});

    if (res.code === 200) {
      // 为每个设备添加选中状态
      devices.value = res.data.map((device: Device) => ({
        ...device,
        selected: false,
      }));

      ElMessage.success(`成功获取 ${devices.value.length} 台在线设备`);
    } else {
      ElMessage.error("获取设备列表失败");
    }
  } catch (error) {
    console.error("获取设备列表出错:", error);
    ElMessage.error("网络请求失败，请检查网络连接");
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  // 自动加载设备列表
  refreshDevices();
});
</script>

<style scoped>
.label{
  margin-left: 10px;
}
.onlineLabel{
  color: green;
}
.device-management-container {
  max-width: 1400px;
  margin: 0 auto;
}
.device-data-card{
  color: #0277bd;
  border-bottom: 1px solid #e2e8f0;
}
.header-card {
  margin-bottom: 10px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-title {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.refresh-btn,
.clear-btn {
  border-radius: 8px;
  font-weight: 500;
}

.main-content {
  height: calc(100vh - 200px);
}

.device-list-card,
.content-card {
  height: 100%;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #333;
}

.device-list {
  max-height: calc(100vh - 300px);
  overflow-y: none;
}

.device-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-color: #e2e8f0;
}

.device-item:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  transform: translateX(4px);
}

.device-item.active {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.device-checkbox {
  margin-right: 12px;
  margin-top: 2px;
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-name {
  display: flex;
  align-items: center;
  text-align: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.device-details {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.device-type {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.device-type.device1 {
  background: #e0f2fe;
  color: #0277bd;
}

.device-type.device2 {
  background: #e8f5e8;
  color: #2e7d32;
}

.last-time {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.product-id {
  font-size: 11px;
  color: #94a3b8;
  font-family: "Monaco", "Consolas", monospace;
}

.status-icon {
  font-size: 8px;
}

.status-icon.online {
  color: #10b981;
}

.status-icon.offline {
  color: #ef4444;
}

.empty-device {
  text-align: center;
  padding: 60px 10px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.loading-container {
  text-align: center;
  padding: 60px 10px;
  color: #64748b;
}

.loading-container .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.data-section {
  height: 450px; /* 固定高度 */
  margin-bottom: 10px;
}

.data-display {
  height: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-y: auto; /* 确保可以滚动 */
  color: #334155;
}

.log-item {
  margin-bottom: 8px;
  padding: 4px 0;
}

.timestamp {
  color: #64748b;
  font-weight: 500;
}

.message {
  margin-left: 8px;
}

.log-item.info .message {
  color: #334155;
}

.log-item.success .message {
  color: #059669;
  font-weight: 500;
}

.log-item.warning .message {
  color: #d97706;
  font-weight: 500;
}

.log-item.error .message {
  color: #dc2626;
  font-weight: 500;
}

.empty-log {
  color: #94a3b8;
  text-align: center;
  padding: 80px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-message-icon {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 12px;
  color: #cbd5e1;
  margin: 0;
  font-style: normal;
}

.control-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 10px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  margin-top: 10px;
}

.control-btn {
  border-radius: 8px;
  font-weight: 600;
  min-width: 120px;
  height: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

/* 滚动条样式 */
.device-list::-webkit-scrollbar,
.data-display::-webkit-scrollbar {
  width: 6px;
}

.device-list::-webkit-scrollbar-track,
.data-display::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.device-list::-webkit-scrollbar-thumb,
.data-display::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.device-list::-webkit-scrollbar-thumb:hover,
.data-display::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
