// composables/useWebSocket.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useMessageStore } from '../stores/websocketStore'
import { baseUrl } from './fuckyou'

export function useWebSocket(relativeUrl: string) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const timer = ref<number | null>(null)
  const reconnectAttempts = ref(0)
  const MAX_RECONNECT_ATTEMPTS = 5
  const INITIAL_RECONNECT_DELAY = 1000 // 1 second
  const MAX_RECONNECT_DELAY = 30000 // 30 seconds
  const HEARTBEAT_INTERVAL = 20000

  const messageStore = useMessageStore()

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `ws://${baseUrl}:12345/ws`
  }

  const calculateReconnectDelay = (attempt: number) => {
    return Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempt), MAX_RECONNECT_DELAY)
  }

  const reconnect = () => {
    if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WebSocket] 已达到最大重连次数')
      return
    }

    const delay = calculateReconnectDelay(reconnectAttempts.value)
    console.log(`[WebSocket] ${delay / 1000}秒后尝试第${reconnectAttempts.value + 1}次重连...`)
    
    setTimeout(() => {
      reconnectAttempts.value++
      connect()
    }, delay)
  }

  const connect = () => {
    if (ws.value) return

    const token = 'd139cd7220f5a2644ef5d6c3feef735ff163a2f3d9cfc0106c422fd69e81b8a4'
    if (!token) return

    ws.value = new WebSocket(getWebSocketUrl(), token)

    ws.value.onopen = () => {
      console.log('[WebSocket] 连接成功')
      isConnected.value = true
      reconnectAttempts.value = 0 // 重置重连计数器
      ws.value?.send('ping')
      startHeartbeat()
    }

    ws.value.onmessage = (event) => {
      if (event.data === 'pong') {
        console.log('[WebSocket] 心跳响应')
        return
      }

      try {
        const data = JSON.parse(event.data)
        // console.log('消息接收1', data)
        if(data.dataType==2){
          messageStore.addDevice(data)
          
        }
        messageStore.processMessage(data)
      } catch (e) {
        console.error('消息解析失败', e)
      }
    }

    ws.value.onclose = () => {
      console.log('[WebSocket] 连接关闭')
      isConnected.value = false
      cleanup()
      
      if (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
        reconnect()
      } else {
        console.warn('[WebSocket] 重连次数已达上限，停止重连')
      }
    }

    ws.value.onerror = (err) => {
      console.error('[WebSocket] 错误', err)
      isConnected.value = false
    }
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    timer.value = window.setInterval(() => {
      send('ping')
    }, HEARTBEAT_INTERVAL)
  }

  const stopHeartbeat = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  const cleanup = () => {
    stopHeartbeat()
    if (ws.value) {
      ws.value.onclose = null // 防止触发重连
      ws.value.close()
      ws.value = null
    }
  }

  const send = (msg: string) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(msg)
    } else {
      console.warn('[WebSocket] 连接未就绪，消息发送失败')
    }
  }

  onMounted(connect)
  onUnmounted(cleanup)

  return {
    isConnected,
    send,
    cleanup,
  }
}
