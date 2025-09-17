// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected APIs for renderer
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  // Bridge HTTP requests via main process to avoid CORS in renderer
  httpRequest: async (url, options) => {
    return ipcRenderer.invoke('http:request', { url, options });
  },
});
