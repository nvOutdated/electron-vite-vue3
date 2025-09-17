import { defineStore } from 'pinia'
// import type { WebSocketMessage } from '../utils/websocket'

/**
 * WebSocket 消息 Store
 * 负责分类、存储和分发所有通过 WebSocket 接收到的业务消息。
 */
export const useMessageStore = defineStore('message', {
  // 使用 null 作为初始状态
  state: (): any => ({
    broadcastDevice: null,
  }),

  actions: {
    /**
     * 主入口：处理所有接收到的 WebSocket 消息
     * @param message - 从 WebSocket 收到的消息
     */
    processMessage(message: any) {
      // 统一处理警告级别的消息以用于通知
      this.broadcastDevice = message
    },
    clearMessage(){
      this.broadcastDevice = []
    },

    // --- 消息处理器 ---

    handleBroadcastMessage(message: any) {
      this.broadcastDevice = null
      console.log('消息接收3');
      
    },

  },

  getters: {
  },
})
