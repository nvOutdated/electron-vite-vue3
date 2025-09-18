import { app, BrowserWindow, ipcMain,Menu  } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // devTools:false,
      preload: path.join(__dirname, 'preload.js'), // ⚡ 生产环境路径正确
    },
  });
  // Menu.setApplicationMenu(null)
  if (isDev) {
    // ✅ 开发环境：Vite Dev Server
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // ✅ 生产环境：加载打包后的 html
    const indexHtml = path.join(__dirname, '../renderer/main_window/index.html');
    console.log('Loading production file:', indexHtml);
    try {
      await mainWindow.loadFile(indexHtml);
    } catch (err) {
      console.error('Failed to load renderer HTML:', err);
      mainWindow.loadURL(
        'data:text/html,<h1>Failed to load app</h1><p>Check console for details</p>'
      );
    }
    mainWindow.webContents.openDevTools(); 
  }
};

// IPC: 在主进程代理 HTTP 请求
ipcMain.handle('http:request', async (_event, args: { url: string; options?: RequestInit }) => {
  const { url, options } = args || { url: '', options: {} };
  if (!url || typeof url !== 'string') {
    return { ok: false, status: 0, headers: {}, data: null, error: 'Invalid URL' };
  }
  try {
    const response = await fetch(url, { ...options } as RequestInit);
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      ok: response.ok,
      status: response.status,
      headers,
      data,
    };
  } catch (error: any) {
    return { ok: false, status: 0, headers: {}, data: null, error: String(error?.message || error) };
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
