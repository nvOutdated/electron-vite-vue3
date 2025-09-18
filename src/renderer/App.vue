<template>
  <el-config-provider :locale="zhCn">
    <div class="device-management-app">
      <DeviceManagement />
       <!-- fuck -->
    <!--   <cat1Light/> -->
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import DeviceManagement from './components/DeviceManagement.vue'
import cat1Light from './components/cat1Light/index.vue'
import { websocketManager } from './utils/websocket';
import { onMounted,onUnmounted } from 'vue';
import { useWebSocket } from './utils/websocketHook';
useWebSocket('1')
onMounted(() => {
    // websocketManager.init('/cvgWs');
    useWebSocket('1')
})
onUnmounted(()=>{
  websocketManager.reset()
  
})

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  /* background-color: #000; */
  /* max-height: 100vh; */
}

.device-management-app {
  height: 100%;
  /* min-height: 100vh; */
  padding: 10px;
}
</style>
