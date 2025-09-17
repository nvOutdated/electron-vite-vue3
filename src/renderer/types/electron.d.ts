// Electron API 类型定义
export interface ElectronAPI {
  request: (url: string, options?: RequestInit) => Promise<{
    ok: boolean;
    status: number;
    data: any;
    error?: string;
  }>;
  platform: string;
  versions: NodeJS.ProcessVersions;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
