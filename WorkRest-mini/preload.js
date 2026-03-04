const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 状态管理
  getState: () => ipcRenderer.invoke('get-state'),
  startWorking: () => ipcRenderer.invoke('start-working'),
  startBreaking: () => ipcRenderer.invoke('start-breaking'),
  stop: () => ipcRenderer.invoke('stop'),
  enterVisualize: () => ipcRenderer.invoke('enter-visualize'),
  enterSettings: () => ipcRenderer.invoke('enter-settings'),
  
  // 设置
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  selectMusicDir: () => ipcRenderer.invoke('select-music-dir'),
  testVoice: (voicePack) => ipcRenderer.invoke('test-voice', voicePack),
  
  // 统计
  getStats: () => ipcRenderer.invoke('get-stats'),
  
  // 对话框响应
  dialogResponse: (buttonIndex) => ipcRenderer.invoke('dialog-response', buttonIndex),
  
  // 退出应用
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // v2.0.1: 窗口控制
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  
  // v2.0.1: 办公室模式
  toggleOfficeMode: () => ipcRenderer.invoke('toggle-office-mode'),
  getOfficeMode: () => ipcRenderer.invoke('get-office-mode'),
  
  // 事件监听
  onTimerUpdate: (callback) => {
    ipcRenderer.on('timer-update', (event, data) => callback(data));
  },
  onStatsUpdated: (callback) => {
    ipcRenderer.on('stats-updated', (event, data) => callback(data));
  },
  onShowDialog: (callback) => {
    ipcRenderer.on('show-dialog', (event, data) => callback(data));
  },
  onStateChanged: (callback) => {
    ipcRenderer.on('state-changed', (event, data) => callback(data));
  },
  onNavigateTo: (callback) => {
    ipcRenderer.on('navigate-to', (event, page) => callback(page));
  },
  onStateUpdated: (callback) => {
    ipcRenderer.on('state-updated', (event, data) => callback(data));
  },
  
  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
