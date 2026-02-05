<template>
  <el-config-provider :locale="zhCn">
    <div class="app-shell">
      <SmartLampDashboard />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import SmartLampDashboard from './components/SmartLampDashboard.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
  min-height: 100vh;
  background-color: #081124;
}

#app,
.app-shell {
  min-height: 100vh;
  padding: 10px;
}
</style>
