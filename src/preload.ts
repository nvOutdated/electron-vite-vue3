import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 代理 HTTP 请求
  request: (url: string, options?: RequestInit) => 
    ipcRenderer.invoke('http:request', { url, options }),
  
  // 可以添加其他需要暴露的 API
  platform: process.platform,
  versions: process.versions,
});
