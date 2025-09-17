// import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '../stores/websocketStore'
import { baseUrl } from './fuckyou'
/**
 * WebSocket 消息的接口定义
 */
export interface WebSocketMessage {
  code: number
  service_name: string
  device_content: {
    type: string
    did: number
    sn: string
    
  } | null
  level: string
  message_type: string
  system_content: object | null
}


/**
 * WebSocket 管理器
 * 负责建立、维护和管理 WebSocket 连接，包括自动重连和心跳维持。
 */
export class WebSocketManager {
  private ws: WebSocket | null = null
  private relativeUrl: string = ''
  private retries = 0
  private maxRetries = 5
  private timer: number | null = null
  private reconnectTimer: number | null = null
  private readonly RECONNECT_INTERVAL = 3000
  private readonly HEARTBEAT_INTERVAL = 20000
  private statusHandlers: ((isConnected: boolean) => void)[] = []
  /**
   * public  class User {
   *  private String userName;
   *  private Integer age;
   * }
   * 
   * User user = new User();
   * user.getUserName();
   * 
   * 
   * type User struct{
   *  UserName string
   *  Age int
   * }
   */

  /**
   * 初始化 WebSocket 连接
   * @param relativeUrl - WebSocket 的相对路径 (例如: '/cvgWs')
   */
  public init(relativeUrl: string) {
    if (this.ws) {
      console.log('[WebSocket] 连接已初始化。')
      return
    }
    this.relativeUrl = relativeUrl
    this.initWebSocket()
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host // e.g., localhost:8080
    // return `${protocol}//${host}${this.relativeUrl}`
    return `ws://${baseUrl}:12345/ws`
    // return 'ws://192.168.1.180:38400/cvgWs'
  }

  private initWebSocket() {
    // const authStore = useAuthStore()
    // const token = authStore.token
    const token = 'd139cd7220f5a2644ef5d6c3feef735ff163a2f3d9cfc0106c422fd69e81b8a4'
    if (!token) {
      console.log('[WebSocket] 未登录，无法建立连接。')
      return
    }

    if (!this.relativeUrl) {
      console.error('[WebSocket] URL 未提供。请先调用 init(relativeUrl)。')
      return
    }

    try {
      const fullUrl = this.getWebSocketUrl()
      console.log('实例化 WebSocket:', fullUrl)
      this.ws = new WebSocket(fullUrl,token)
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('[WebSocket] 初始化连接失败:', error)
      this.handleError(error)
    }
  }

  private handleOpen() {
    console.log('[WebSocket] 连接已建立, 等待 token 验证...')
    if (this.ws) {
      // const authStore = useAuthStore()
      // const token = authStore.token
      // const token = 'd139cd7220f5a2644ef5d6c3feef735ff163a2f3d9cfc0106c422fd69e81b8a4'
      // if (token) {
      //   this.ws.send(token)
      // }
      this.ws.send('ping')
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      // console.log(event.data,'message');
      // const message: WebSocketMessage = JSON.parse(event.data)
      // console.log(message,'message');
      
      
     
      // if (message.code === 200) {
      //   // 假设 code 200 表示认证成功或心跳响应
      //   this.retries = 0
      //   this.startHeartbeat()
      //   this.notifyStatusChange(true)
      // }
     
      if(event.data === 'pong') {
        this.retries = 0
        this.startHeartbeat()
        this.notifyStatusChange(true)
        console.log('心跳发送');
      }else{
        console.log('消息接收1',JSON.parse(event.data));
        const messageStore = useMessageStore()
        console.log(messageStore,'messageStore');
        
        if (messageStore) {
          messageStore.processMessage(JSON.parse(event.data))
        }
      }
    } catch (error) {
      console.error('[WebSocket] 消息处理错误:', error)
    }
  }

  private handleError(error: unknown) {
    console.error('[WebSocket] 连接错误:', error)
    this.notifyStatusChange(false)

    if (this.retries < this.maxRetries) {
      this.retries++
      this.reconnectTimer = window.setTimeout(() => {
        console.log(`[WebSocket] 第 ${this.retries} 次重连...`)
        this.initWebSocket()
      }, this.RECONNECT_INTERVAL)
    } else {
      console.log('[WebSocket] 重连超过最大次数，已停止重连。')
      this.cleanup()
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('[WebSocket] 连接已断开:', event)
    this.notifyStatusChange(false)
    this.cleanup()
  }

  private startHeartbeat() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.timer = window.setInterval(() => {
      this.send('ping')
    }, this.HEARTBEAT_INTERVAL)
  }

  private cleanup() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      // 移除事件监听器以防内存泄漏
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
  }

  public send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      console.warn('[WebSocket] 发送消息失败，未连接。')
    }
  }

  public addStatusHandler(handler: (isConnected: boolean) => void) {
    this.statusHandlers.push(handler)
  }

  public removeStatusHandler(handler: (isConnected: boolean) => void) {
    this.statusHandlers = this.statusHandlers.filter(h => h !== handler)
  }

  private notifyStatusChange(isConnected: boolean) {
    this.statusHandlers.forEach(handler => handler(isConnected))
  }

  public disconnect() {
    console.log('[WebSocket] 主动断开连接。')
    this.maxRetries = 0 // 防止重连
    this.cleanup()
  }

  public reset() {
    // 清理所有状态
    this.disconnect()
    this.maxRetries = 5 // 恢复重连机制
    this.retries = 0
    this.statusHandlers = []
  }
}

// 创建单例实例
export const websocketManager = new WebSocketManager()
