const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, spawn } = require('child_process');

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('应用已在运行，退出...');
  app.quit();
  process.exit(0);
}

// 配置路径 - Mini 版本
const DATA_DIR = path.join(os.homedir(), '.workrest-mini');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const MUSIC_DIR = '/home/steven/音乐/Music';
const LOG_FILE = path.join(DATA_DIR, 'workrest-mini.log');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============ 企业级日志系统 ============
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
let currentLogLevel = LOG_LEVELS.INFO;

function getTimestamp() {
  return new Date().toISOString();
}

function logWrite(level, message, ...args) {
  if (LOG_LEVELS[level] < currentLogLevel) return;
  
  const timestamp = getTimestamp();
  const argStr = args.length > 0 ? ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') : '';
  const logLine = `[${timestamp}] [${level}] ${message}${argStr}\n`;
  
  // 写入文件
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (e) {
    console.error('写入日志失败:', e);
  }
  
  // 控制台输出
  console.log(logLine.trim());
}

function logDebug(message, ...args) { logWrite('DEBUG', message, ...args); }
function logInfo(message, ...args) { logWrite('INFO', message, ...args); }
function logWarn(message, ...args) { logWrite('WARN', message, ...args); }
function logError(message, ...args) { logWrite('ERROR', message, ...args); }

// 应用启动日志
logInfo('========================================');
logInfo('WorkRest 应用启动');
logInfo(`版本: 2.0-mini`);
logInfo(`Electron: ${process.versions.electron}`);
logInfo(`Node.js: ${process.versions.node}`);
logInfo(`平台: ${process.platform} ${process.arch}`);
logInfo('========================================');

// 默认设置
const DEFAULT_SETTINGS = {
  workDuration: 45,      // 工作时长（分钟）
  breakDuration: 15,     // 休息时长（分钟）
  musicDir: '/home/steven/音乐/Music',  // 音乐目录
  voicePack: 'google-tts-en'  // 语音包: google-tts-en, espeak-zh
};

// 加载设置
let settings = { ...DEFAULT_SETTINGS };
function loadSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      settings = { ...DEFAULT_SETTINGS, ...saved };
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  }
}

// 保存设置
function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('保存设置失败:', e);
  }
}

// 状态定义
const State = {
  WORKING: 'WORKING',
  BREAKING: 'BREAKING',
  STOPPED: 'STOPPED',
  VISUALIZE: 'VISUALIZE',
  SETTINGS: 'SETTINGS'
};

// 应用状态
let mainWindow = null;
let currentState = State.STOPPED;
let timerInterval = null;
let remainingSeconds = 0;
let todayStats = {
  date: new Date().toISOString().split('T')[0],
  morning: 0,
  afternoon: 0,
  evening: 0
};
let musicPlayer = null;
let musicFiles = [];
let currentMusicIndex = -1;

// 创建主窗口 - v1.3 长条形设计
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 380,
    minHeight: 600,
    title: 'WorkRest Mini',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    icon: path.join(__dirname, 'assets', 'clock.png')
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建中文菜单
  createMenu();
}

// 创建中文菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '查看统计',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'visualize');
            }
          }
        },
        {
          label: '配置调整',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'settings');
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '操作',
      submenu: [
        {
          label: '开始工作',
          click: () => {
            if (currentState === State.STOPPED || currentState === State.VISUALIZE) {
              startWorkingFromMenu();
            }
          }
        },
        {
          label: '开始休息',
          click: () => {
            if (currentState === State.STOPPED || currentState === State.VISUALIZE) {
              startBreakingFromMenu();
            }
          }
        },
        {
          label: '停止',
          click: () => {
            if (currentState === State.WORKING || currentState === State.BREAKING) {
              stopFromMenu();
            }
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 WorkRest',
              message: 'WorkRest v1.5.0',
              detail: '久坐提醒与工作/休息管理应用\n\n本软件由 RobotX 团队 Steven 开发\n\n商业合作可联系 WeChat: StevenQ-001\n\n© 2026 RobotX Team. All rights reserved.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 从菜单开始工作
function startWorkingFromMenu() {
  currentState = State.WORKING;
  startTimer(settings.workDuration * 60);
  if (mainWindow) {
    mainWindow.webContents.send('state-updated', { 
      state: currentState, 
      remaining: remainingSeconds,
      total: settings.workDuration * 60
    });
  }
}

// 从菜单开始休息
function startBreakingFromMenu() {
  currentState = State.BREAKING;
  startTimer(settings.breakDuration * 60);
  playMusic();
  if (mainWindow) {
    mainWindow.webContents.send('state-updated', { 
      state: currentState, 
      remaining: remainingSeconds,
      total: settings.breakDuration * 60
    });
  }
}

// 从菜单停止
function stopFromMenu() {
  currentState = State.STOPPED;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopMusic();
  remainingSeconds = 0;
  if (mainWindow) {
    mainWindow.webContents.send('state-updated', { 
      state: currentState, 
      remaining: 0,
      total: 0
    });
  }
}

// 第二个实例启动时
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  loadSettings();
  loadTodayStats();
  scanMusicFiles();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopMusic();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 扫描音乐文件
// 检查音乐目录和文件
function checkMusicAvailable() {
  const musicDir = settings.musicDir || '/home/steven/音乐/Music';
  
  // 检查目录是否存在
  if (!fs.existsSync(musicDir)) {
    return { available: false, reason: '目录不存在', dir: musicDir };
  }
  
  // 检查是否有音乐文件
  const files = fs.readdirSync(musicDir);
  const musicFiles = files.filter(f => /\.(mp3|flac|wav|ogg|m4a)$/i.test(f));
  
  if (musicFiles.length === 0) {
    return { available: false, reason: '目录中没有音乐文件', dir: musicDir };
  }
  
  return { available: true, count: musicFiles.length, dir: musicDir };
}

// 显示音乐目录选择对话框
async function showMusicDirDialog() {
  if (!mainWindow) return false;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择音乐目录',
    message: '请选择一个包含音乐文件的目录（支持 mp3, flac, wav, ogg, m4a 格式）',
    defaultPath: os.homedir()
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedDir = result.filePaths[0];
    
    // 验证选择的目录
    const files = fs.readdirSync(selectedDir);
    const hasMusic = files.some(f => /\.(mp3|flac|wav|ogg|m4a)$/i.test(f));
    
    if (hasMusic) {
      settings.musicDir = selectedDir;
      saveSettings();
      scanMusicFiles();
      return true;
    } else {
      // 选择的目录没有音乐文件
      await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: '未找到音乐文件',
        message: '所选目录中没有音乐文件',
        detail: `目录: ${selectedDir}\n\n请确保目录中包含 mp3, flac, wav, ogg 或 m4a 格式的音乐文件。`,
        buttons: ['重新选择', '取消']
      });
      return showMusicDirDialog(); // 递归重新选择
    }
  }
  
  return false;
}

// 扫描音乐文件
function scanMusicFiles() {
  const musicDir = settings.musicDir || '/home/steven/音乐/Music';
  if (fs.existsSync(musicDir)) {
    const files = fs.readdirSync(musicDir);
    musicFiles = files
      .filter(f => /\.(mp3|flac|wav|ogg|m4a)$/i.test(f))
      .map(f => path.join(musicDir, f));
    console.log(`[WorkRest] 找到 ${musicFiles.length} 首音乐`);
    logInfo(`音乐库加载完成: ${musicFiles.length} 首音乐`);
  } else {
    musicFiles = [];
    logWarn(`音乐目录不存在: ${musicDir}`);
  }
}

// Fisher-Yates 洗牌
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 播放音乐
function playMusic() {
  stopMusic();
  
  if (musicFiles.length === 0) return;

  const shuffled = shuffleArray(musicFiles);
  currentMusicIndex = 0;
  
  const playNext = () => {
    if (currentState !== State.BREAKING || currentMusicIndex >= shuffled.length) {
      return;
    }
    
    const file = shuffled[currentMusicIndex++];
    
    musicPlayer = spawn('mpv', ['--no-video', '--loop-file=no', file], {
      detached: false,
      stdio: 'ignore'
    });
    
    musicPlayer.on('close', () => {
      if (currentState === State.BREAKING && currentMusicIndex < shuffled.length) {
        playNext();
      }
    });
    
    musicPlayer.on('error', () => {
      if (currentState === State.BREAKING && currentMusicIndex < shuffled.length) {
        playNext();
      }
    });
  };
  
  playNext();
}

// 停止音乐
function stopMusic() {
  if (musicPlayer) {
    try {
      musicPlayer.kill('SIGTERM');
    } catch (e) {}
    musicPlayer = null;
  }
  exec('pkill -f "mpv --no-video"', () => {});
}

// TTS
// TTS 语音播报
function speak(text) {
  const voicePack = settings.voicePack || 'espeak-zh';
  
  if (voicePack === 'google-tts-en') {
    // Google Translate TTS - 英文女声（需要网络）
    const texts = {
      '准备休息': 'Time to take a break',
      '休息结束，准备开始工作': 'Break is over, time to work',
      '测试语音播报': 'Voice test'
    };
    const enText = texts[text] || text;
    
    // 使用 Google Translate TTS API (通过 curl)
    const tmpFile = path.join(DATA_DIR, 'tts_tmp.mp3');
    const downloadCmd = `curl -s -L "https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(enText)}" -o "${tmpFile}" 2>/dev/null`;
    
    exec(downloadCmd, (error) => {
      if (!error && fs.existsSync(tmpFile)) {
        // 播放下载的音频
        exec(`mpv "${tmpFile}" --no-video 2>/dev/null || mpv "${tmpFile}" --no-video`, () => {
          // 播放完成后删除临时文件
          try { fs.unlinkSync(tmpFile); } catch (e) {}
        });
      } else {
        // 失败时回退到 espeak
        fallbackSpeak(text);
      }
    });
  } else {
    // 默认使用 espeak 中文
    fallbackSpeak(text);
  }
}

// 备选语音（espeak 中文）
function fallbackSpeak(text) {
  const cmd = `which espeak-ng >/dev/null 2>&1 && espeak-ng -v zh "${text}" 2>/dev/null || espeak -v zh "${text}" 2>/dev/null`;
  exec(cmd, () => {});
}

// 加载今日统计
function loadTodayStats() {
  const today = new Date().toISOString().split('T')[0];
  
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (data.date === today) {
        todayStats = data;
      } else {
        todayStats = { date: today, morning: 0, afternoon: 0, evening: 0 };
        saveTodayStats();
      }
    } catch (e) {
      todayStats = { date: today, morning: 0, afternoon: 0, evening: 0 };
    }
  } else {
    todayStats = { date: today, morning: 0, afternoon: 0, evening: 0 };
    saveTodayStats();
  }
}

// 保存今日统计
function saveTodayStats() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todayStats, null, 2));
  } catch (e) {}
}

// 添加工作时间
function addWorkTime(minutes) {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toISOString().split('T')[0];
  
  if (todayStats.date !== today) {
    todayStats = { date: today, morning: 0, afternoon: 0, evening: 0 };
  }
  
  if (hour >= 7 && hour < 12) {
    todayStats.morning += minutes;
  } else if (hour >= 12 && hour < 18) {
    todayStats.afternoon += minutes;
  } else if (hour >= 18 && hour < 24) {
    todayStats.evening += minutes;
  }
  
  saveTodayStats();
  
  if (mainWindow) {
    mainWindow.webContents.send('stats-updated', todayStats);
  }
}

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 计时器 tick
function timerTick() {
  if (remainingSeconds > 0) {
    remainingSeconds--;
    
    if (mainWindow) {
      mainWindow.webContents.send('timer-update', {
        remaining: remainingSeconds,
        formatted: formatTime(remainingSeconds),
        state: currentState
      });
    }
    
    if (remainingSeconds <= 0) {
      onTimerComplete();
    }
  }
}

// 计时完成
function onTimerComplete() {
  clearInterval(timerInterval);
  timerInterval = null;
  
  if (currentState === State.WORKING) {
    addWorkTime(settings.workDuration);
    speak('准备休息');
    
    // 窗口弹到最前
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        if (mainWindow) mainWindow.setAlwaysOnTop(false);
      }, 3000);
      
      mainWindow.webContents.send('show-dialog', {
        title: '工作完成',
        message: `${settings.workDuration}分钟工作结束，准备休息了吗？`,
        buttons: [`休息${settings.breakDuration}分钟`, '停止干活']
      });
    }
  } else if (currentState === State.BREAKING) {
    stopMusic();
    speak('休息结束，准备开始工作');
    
    // 窗口弹到最前
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        if (mainWindow) mainWindow.setAlwaysOnTop(false);
      }, 3000);
      
      mainWindow.webContents.send('show-dialog', {
        title: '休息结束',
        message: `${settings.breakDuration}分钟休息结束，准备开始工作了吗？`,
        buttons: [`干活${settings.workDuration}分钟`, '停止干活']
      });
    }
  }
}

// 开始计时
function startTimer(seconds) {
  remainingSeconds = seconds;
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(timerTick, 1000);
  
  if (mainWindow) {
    mainWindow.webContents.send('timer-update', {
      remaining: remainingSeconds,
      formatted: formatTime(remainingSeconds),
      state: currentState
    });
  }
}

// IPC 处理
ipcMain.handle('get-state', () => {
  return {
    state: currentState,
    remaining: remainingSeconds,
    formatted: formatTime(remainingSeconds),
    stats: todayStats,
    settings: settings
  };
});

ipcMain.handle('get-settings', () => {
  return settings;
});

ipcMain.handle('save-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  saveSettings();
  // 重新扫描音乐（如果目录变了）
  scanMusicFiles();
  return { success: true, settings };
});

ipcMain.handle('select-music-dir', async () => {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择音乐目录',
      defaultPath: settings.musicDir || os.homedir()
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, dir: result.filePaths[0] };
    }
  }
  return { success: false };
});

ipcMain.handle('test-voice', (event, voicePack) => {
  const originalVoice = settings.voicePack;
  settings.voicePack = voicePack;
  speak('准备休息');
  settings.voicePack = originalVoice;
  return { success: true };
});

ipcMain.handle('start-working', () => {
  if (currentState === State.WORKING) return { success: false };
  
  // 如果之前在休息，停止音乐
  stopMusic();
  
  currentState = State.WORKING;
  startTimer(settings.workDuration * 60);
  
  return { success: true, state: currentState };
});

ipcMain.handle('start-breaking', async () => {
  if (currentState === State.BREAKING) return { success: false };
  
  // 检查音乐目录
  const musicCheck = checkMusicAvailable();
  if (!musicCheck.available) {
    logWarn(`音乐检查失败: ${musicCheck.reason}`);
    
    // 显示提示并让用户选择目录
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: '音乐目录问题',
      message: '无法播放休息音乐',
      detail: `${musicCheck.reason}: ${musicCheck.dir}\n\n休息时需要播放音乐，请选择一个包含音乐文件的目录。`,
      buttons: ['选择音乐目录', '取消休息']
    });
    
    if (result.response === 0) {
      // 用户选择目录
      const selected = await showMusicDirDialog();
      if (!selected) {
        return { success: false, reason: '未选择音乐目录' };
      }
      // 重新检查
      const recheck = checkMusicAvailable();
      if (!recheck.available) {
        return { success: false, reason: recheck.reason };
      }
    } else {
      return { success: false, reason: '用户取消' };
    }
  }
  
  currentState = State.BREAKING;
  startTimer(settings.breakDuration * 60);
  playMusic();
  
  return { success: true, state: currentState };
});

ipcMain.handle('stop', () => {
  currentState = State.STOPPED;
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  stopMusic();
  remainingSeconds = 0;
  
  return { success: true, state: currentState };
});

ipcMain.handle('enter-visualize', () => {
  return { success: true, state: currentState, stats: todayStats };
});

ipcMain.handle('enter-settings', () => {
  return { success: true, state: currentState, settings };
});

ipcMain.handle('get-stats', () => {
  const today = new Date().toISOString().split('T')[0];
  if (todayStats.date !== today) {
    todayStats = { date: today, morning: 0, afternoon: 0, evening: 0 };
    saveTodayStats();
  }
  return todayStats;
});

ipcMain.handle('quit-app', () => {
  stopMusic();
  app.quit();
});

ipcMain.handle('dialog-response', (event, buttonIndex) => {
  if (currentState === State.WORKING) {
    if (buttonIndex === 0) {
      currentState = State.BREAKING;
      startTimer(settings.breakDuration * 60);
      playMusic();
    } else {
      currentState = State.VISUALIZE;
      if (mainWindow) {
        mainWindow.webContents.send('state-changed', { state: State.VISUALIZE, stats: todayStats });
      }
    }
  } else if (currentState === State.BREAKING) {
    if (buttonIndex === 0) {
      stopMusic();  // 停止音乐
      currentState = State.WORKING;
      startTimer(settings.workDuration * 60);
    } else {
      stopMusic();  // 停止音乐
      currentState = State.VISUALIZE;
      if (mainWindow) {
        mainWindow.webContents.send('state-changed', { state: State.VISUALIZE, stats: todayStats });
      }
    }
  }
  
  return { success: true, state: currentState };
});
