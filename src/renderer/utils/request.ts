import { ElMessage } from 'element-plus'

// 基础URL，根据环境变量切换
const baseURL = import.meta.env.DEV ? '/smart' : 'http://192.168.1.180:48099/smart'

/**
 * 显示消息提示
 * @param msg - 提示信息
 */
const tip = (msg: string) => {
  ElMessage({
    message: msg,
    type: 'warning',
    duration: 2000,
  })
}

/**
 * 处理响应错误
 */
const errorHandle = (status: number, msg: string) => {
  switch (status) {
    case 401:
      tip('未授权，请重新登录')
      // toLogin()
      break
    case 403:
      tip('拒绝访问')
      break
    case 404:
      tip('请求的资源不存在')
      break
    default:
      tip(msg || '未知错误')
  }
}

/**
 * 基于 fetch 的请求封装
 * @param url - 请求地址
 * @param options - fetch 配置选项
 */
const request = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // 处理请求URL
  const requestUrl = url.startsWith('http') ? url : `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`
  
  // 设置默认请求头
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // 合并配置
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials,
  }

  try {
    // Prefer main-process HTTP via preload bridge to avoid CORS/CSP in renderer
    const electronAPI = (window as any).electronAPI
    if (electronAPI && typeof electronAPI.request === 'function') {
      const { ok, status, data, error } = await electronAPI.request(requestUrl, config)
      if (!ok) {
        errorHandle(status || 0, (data && (data.message || data.msg)) || error || '请求失败')
        throw new Error((data && (data.message || data.msg)) || error || '请求失败')
      }
      return data as T
    }

    // Fallback to fetch when bridge is unavailable (e.g., non-electron dev env)
    const response = await fetch(requestUrl, config)
    const data = await response.json()

    if (!response.ok) {
      errorHandle(response.status, data.message || '请求失败')
      throw new Error(data.message || '请求失败')
    }

    return data as T
  } catch (error) {
    console.error('Request error:', error)
    tip('网络错误，请稍后重试')
    throw error
  }
}

export default {
  get: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' }),
}