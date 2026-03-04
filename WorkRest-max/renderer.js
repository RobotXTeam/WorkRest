// ===== WorkRest Max 渲染进程 v2.0.1 =====

const State = {
  WORKING: 'WORKING',
  BREAKING: 'BREAKING',
  STOPPED: 'STOPPED',
  VISUALIZE: 'VISUALIZE',
  SETTINGS: 'SETTINGS'
};

let currentState = State.STOPPED;
let remainingSeconds = 0;
let totalSeconds = 0;
let officeMode = false;
let todayStats = {
  date: new Date().toISOString().split('T')[0],
  morning: 0,
  afternoon: 0,
  evening: 0
};

let settings = {
  workDuration: 45,
  breakDuration: 15,
  musicDir: '/home/steven/音乐/Music',
  voicePack: 'edge-tts-xiaoxiao',
  officeMode: false
};

// DOM 元素
const elements = {
  // 页面
  mainPage: document.getElementById('main-page'),
  visualizePage: document.getElementById('visualize-page'),
  settingsPage: document.getElementById('settings-page'),
  
  // 计时器
  timerValue: document.getElementById('timer-value'),
  statusBadge: document.getElementById('status-badge'),
  statusText: document.querySelector('.status-text'),
  progressRingFill: document.querySelector('.progress-ring-fill'),
  
  // 主按钮（整合后）
  btnToggle: document.getElementById('btn-toggle'),
  toggleText: document.getElementById('toggle-text'),
  toggleIcon: document.getElementById('toggle-icon'),
  btnStop: document.getElementById('btn-stop'),
  
  // 导航按钮
  btnVisualize: document.getElementById('btn-visualize'),
  btnSettings: document.getElementById('btn-settings'),
  btnBackFromStats: document.getElementById('btn-back-from-stats'),
  btnQuitFromStats: document.getElementById('btn-quit-from-stats'),
  btnBackFromSettings: document.getElementById('btn-back-from-settings'),
  
  // v2.0.1: 窗口控制按钮
  btnMinimize: document.getElementById('btn-minimize'),
  btnMaximize: document.getElementById('btn-maximize'),
  btnClose: document.getElementById('btn-close'),
  
  // v2.0.1: 办公室模式按钮
  btnOfficeMode: document.getElementById('btn-office-mode'),
  officeModeTooltip: document.getElementById('office-mode-tooltip'),
  
  // 统计
  quickTotal: document.getElementById('quick-total'),
  totalDisplay: document.getElementById('total-display'),
  totalHours: document.getElementById('total-hours'),
  totalMinutes: document.getElementById('total-minutes'),
  barMorning: document.getElementById('morning-bar'),
  barAfternoon: document.getElementById('afternoon-bar'),
  barEvening: document.getElementById('evening-bar'),
  detailMorning: document.getElementById('morning-time'),
  detailAfternoon: document.getElementById('afternoon-time'),
  detailEvening: document.getElementById('evening-time'),
  morningPercent: document.getElementById('morning-percent'),
  afternoonPercent: document.getElementById('afternoon-percent'),
  eveningPercent: document.getElementById('evening-percent'),
  
  // 设置
  workValue: document.getElementById('work-value'),
  breakValue: document.getElementById('break-value'),
  workSlider: document.getElementById('work-slider'),
  breakSlider: document.getElementById('break-slider'),
  btnWorkMinus: document.getElementById('btn-work-minus'),
  btnWorkPlus: document.getElementById('btn-work-plus'),
  btnBreakMinus: document.getElementById('btn-break-minus'),
  btnBreakPlus: document.getElementById('btn-break-plus'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  btnResetSettings: document.getElementById('btn-reset-settings'),
  musicDirDisplay: document.getElementById('music-dir-display'),
  btnSelectMusicDir: document.getElementById('btn-select-music-dir'),
  voicePackSelect: document.getElementById('voice-pack-select'),
  btnTestVoice: document.getElementById('btn-test-voice'),
  
  // 对话框
  dialogOverlay: document.getElementById('dialog-overlay'),
  dialogTitle: document.getElementById('dialog-title'),
  dialogMessage: document.getElementById('dialog-message'),
  dialogBtn0: document.getElementById('dialog-btn-0'),
  dialogBtn1: document.getElementById('dialog-btn-1')
};

// 初始化
async function init() {
  console.log('renderer.js 初始化开始');
  setupEventListeners();
  setupIPCListeners();
  setupSettingsListeners();
  setupWindowControls();
  setupOfficeMode();
  console.log('事件监听器已设置');
  
  // 获取初始状态
  const state = await window.electronAPI.getState();
  currentState = state.state;
  remainingSeconds = state.remaining;
  todayStats = state.stats;
  settings = state.settings || settings;
  officeMode = settings.officeMode || false;
  
  // 更新 UI
  updateTimerDisplay(remainingSeconds);
  updateStatusBadge();
  updateQuickStats();
  updateToggleButton();
  updateButtonStates();
  updateProgressRing(0, 0);
  updateOfficeModeUI();
  
  // 更新设置显示
  updateSettingsUI();
}

// v2.0.1: 设置窗口控制
function setupWindowControls() {
  if (elements.btnMinimize) {
    elements.btnMinimize.addEventListener('click', () => {
      window.electronAPI.windowControl('minimize');
    });
  }
  
  if (elements.btnMaximize) {
    elements.btnMaximize.addEventListener('click', () => {
      window.electronAPI.windowControl('maximize');
    });
  }
  
  if (elements.btnClose) {
    elements.btnClose.addEventListener('click', () => {
      window.electronAPI.windowControl('close');
    });
  }
}

// v2.0.1: 设置办公室模式
function setupOfficeMode() {
  if (!elements.btnOfficeMode) return;
  
  elements.btnOfficeMode.addEventListener('click', async () => {
    // 播放绚丽的点击特效
    playOfficeModeEffect();
    
    // 切换办公室模式
    const result = await window.electronAPI.toggleOfficeMode();
    officeMode = result.officeMode;
    
    // 更新 UI
    updateOfficeModeUI();
    
    // 显示提示
    if (officeMode) {
      showToast('本应用将静音', 1000);
    } else {
      showToast('已关闭静音模式', 1000);
    }
  });
}

// v2.0.1: 办公室模式特效
function playOfficeModeEffect() {
  const btn = elements.btnOfficeMode;
  if (!btn) return;
  
  // 添加点击动画类
  btn.classList.add('office-mode-clicked');
  
  // 创建粒子特效
  createParticleEffect(btn);
  
  // 移除动画类
  setTimeout(() => {
    btn.classList.remove('office-mode-clicked');
  }, 600);
}

// v2.0.1: 创建粒子特效
function createParticleEffect(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'office-mode-particle';
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${centerX}px;
      top: ${centerY}px;
      box-shadow: 0 0 10px ${colors[Math.floor(Math.random() * colors.length)]};
    `;
    document.body.appendChild(particle);
    
    // 随机方向
    const angle = (i / 12) * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const duration = 500 + Math.random() * 300;
    
    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => particle.remove();
  }
  
  // 添加涟漪效果
  const ripple = document.createElement('div');
  ripple.className = 'office-mode-ripple';
  ripple.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid ${officeMode ? '#4ecdc4' : '#ff6b6b'};
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    left: ${centerX - 10}px;
    top: ${centerY - 10}px;
  `;
  document.body.appendChild(ripple);
  
  ripple.animate([
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(4)', opacity: 0 }
  ], {
    duration: 600,
    easing: 'ease-out'
  }).onfinish = () => ripple.remove();
}

// v2.0.1: 更新办公室模式 UI
function updateOfficeModeUI() {
  if (!elements.btnOfficeMode) return;
  
  if (officeMode) {
    elements.btnOfficeMode.classList.add('active');
    elements.btnOfficeMode.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
      </svg>
      <span>静音中</span>
    `;
  } else {
    elements.btnOfficeMode.classList.remove('active');
    elements.btnOfficeMode.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
      <span>办公室模式</span>
    `;
  }
}

// v2.0.1: 显示 Toast 提示
function showToast(message, duration = 1000) {
  // 移除已有的 toast
  const existingToast = document.querySelector('.office-mode-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'office-mode-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 动画进入
  toast.animate([
    { transform: 'translate(-50%, -20px)', opacity: 0 },
    { transform: 'translate(-50%, 0)', opacity: 1 }
  ], {
    duration: 200,
    fill: 'forwards'
  });
  
  // 自动消失
  setTimeout(() => {
    toast.animate([
      { transform: 'translate(-50%, 0)', opacity: 1 },
      { transform: 'translate(-50%, -20px)', opacity: 0 }
    ], {
      duration: 200,
      fill: 'forwards'
    }).onfinish = () => toast.remove();
  }, duration);
}

// 设置事件监听
function setupEventListeners() {
  // 主按钮 - 整合开始/休息
  elements.btnToggle.addEventListener('click', async () => {
    animateButtonClick(elements.btnToggle);
    
    if (currentState === State.STOPPED || currentState === State.VISUALIZE || currentState === State.SETTINGS) {
      // 开始工作
      const result = await window.electronAPI.startWorking();
      if (result.success) {
        currentState = State.WORKING;
        totalSeconds = settings.workDuration * 60;
        updateStatusBadge();
        updateToggleButton();
        updateButtonStates();
      }
    } else if (currentState === State.BREAKING) {
      // 休息中点击，切换到工作（停止音乐）
      const result = await window.electronAPI.startWorking();
      if (result.success) {
        currentState = State.WORKING;
        totalSeconds = settings.workDuration * 60;
        updateStatusBadge();
        updateToggleButton();
        updateButtonStates();
      }
    }
    // 工作中不能点击切换到休息，必须等时间结束或点击停止
  });
  
  // 停止按钮
  elements.btnStop.addEventListener('click', async () => {
    animateButtonClick(elements.btnStop);
    const result = await window.electronAPI.stop();
    if (result.success) {
      currentState = State.STOPPED;
      remainingSeconds = 0;
      updateTimerDisplay(0);
      updateStatusBadge();
      updateToggleButton();
      updateButtonStates();
      updateProgressRing(0, 0);
    }
  });
  
  // 导航按钮
  if (!elements.btnVisualize) {
    console.error('错误: 找不到 btn-visualize 按钮');
  } else {
    console.log('btn-visualize 按钮已找到，添加点击事件');
    elements.btnVisualize.addEventListener('click', () => {
      console.log('查看统计按钮被点击');
      animateButtonClick(elements.btnVisualize);
      showVisualizePage();
    });
  }
  
  elements.btnSettings.addEventListener('click', () => {
    animateButtonClick(elements.btnSettings);
    showSettingsPage();
  });
  
  elements.btnBackFromStats.addEventListener('click', () => {
    animateButtonClick(elements.btnBackFromStats);
    showMainPage();
  });
  
  elements.btnQuitFromStats.addEventListener('click', async () => {
    animateButtonClick(elements.btnQuitFromStats);
    await window.electronAPI.quitApp();
  });
  
  elements.btnBackFromSettings.addEventListener('click', () => {
    animateButtonClick(elements.btnBackFromSettings);
    showMainPage();
  });
  
  // 对话框按钮
  elements.dialogBtn0.addEventListener('click', async () => {
    await window.electronAPI.dialogResponse(0);
    hideDialog();
  });
  
  elements.dialogBtn1.addEventListener('click', async () => {
    await window.electronAPI.dialogResponse(1);
    hideDialog();
  });
}

// 设置 IPC 监听
function setupIPCListeners() {
  // 计时器更新
  window.electronAPI.onTimerUpdate((data) => {
    remainingSeconds = data.remaining;
    if (!isSecondaryPageActive()) {
      currentState = data.state;
    }
    updateTimerDisplay(remainingSeconds);
    
    if (totalSeconds > 0) {
      const progress = (totalSeconds - remainingSeconds) / totalSeconds;
      updateProgressRing(progress, 0);
    }
    
    updateStatusBadge();
    updateToggleButton();
    updateButtonStates();
  });
  
  // 统计更新
  window.electronAPI.onStatsUpdated((stats) => {
    todayStats = stats;
    updateQuickStats();
  });
  
  // 显示对话框
  window.electronAPI.onShowDialog((data) => {
    showDialog(data.title, data.message, data.buttons);
  });
  
  // 状态改变
  window.electronAPI.onStateChanged((data) => {
    if (!isSecondaryPageActive()) {
      currentState = data.state;
    }
    todayStats = data.stats;
    showVisualizePage();
  });
  
  // 菜单导航
  window.electronAPI.onNavigateTo((page) => {
    if (page === 'visualize') {
      showVisualizePage();
    } else if (page === 'settings') {
      showSettingsPage();
    }
  });
  
  // 状态更新（来自菜单）
  window.electronAPI.onStateUpdated((data) => {
    currentState = data.state;
    remainingSeconds = data.remaining;
    totalSeconds = data.total;
    updateTimerDisplay(remainingSeconds);
    updateStatusBadge();
    updateToggleButton();
    updateButtonStates();
    if (totalSeconds > 0) {
      const progress = (totalSeconds - remainingSeconds) / totalSeconds;
      updateProgressRing(progress, 0);
    }
  });
}

// 设置页面的事件监听
function setupSettingsListeners() {
  // 工作时长调整
  elements.btnWorkMinus.addEventListener('click', () => adjustWorkTime(-5));
  elements.btnWorkPlus.addEventListener('click', () => adjustWorkTime(5));
  elements.workSlider.addEventListener('input', (e) => {
    settings.workDuration = parseInt(e.target.value);
    updateSettingsUI();
  });
  
  // 休息时长调整
  elements.btnBreakMinus.addEventListener('click', () => adjustBreakTime(-1));
  elements.btnBreakPlus.addEventListener('click', () => adjustBreakTime(1));
  elements.breakSlider.addEventListener('input', (e) => {
    settings.breakDuration = parseInt(e.target.value);
    updateSettingsUI();
  });
  
  // 保存设置
  elements.btnSaveSettings.addEventListener('click', async () => {
    animateButtonClick(elements.btnSaveSettings);
    // 包含办公室模式设置
    settings.officeMode = officeMode;
    await window.electronAPI.saveSettings(settings);
    showMainPage();
  });
  
  // 重置设置
  elements.btnResetSettings.addEventListener('click', () => {
    animateButtonClick(elements.btnResetSettings);
    settings = { 
      workDuration: 45, 
      breakDuration: 15,
      musicDir: '/home/steven/音乐/Music',
      voicePack: 'edge-tts-xiaoxiao',
      officeMode: false
    };
    officeMode = false;
    updateOfficeModeUI();
    updateSettingsUI();
  });
  
  // 选择音乐目录
  elements.btnSelectMusicDir.addEventListener('click', async () => {
    const result = await window.electronAPI.selectMusicDir();
    if (result.success) {
      settings.musicDir = result.dir;
      updateSettingsUI();
    }
  });
  
  // 语音包选择
  elements.voicePackSelect.addEventListener('change', (e) => {
    settings.voicePack = e.target.value;
  });
  
  // 测试语音
  elements.btnTestVoice.addEventListener('click', () => {
    window.electronAPI.testVoice(settings.voicePack);
  });
  
  // 键盘支持
  document.addEventListener('keydown', (e) => {
    if (!elements.settingsPage.classList.contains('active')) return;
    
    const activeElement = document.activeElement;
    const isWorkFocused = activeElement === elements.workSlider || 
                          document.querySelector('.setting-item:first-of-type')?.contains(activeElement);
    const isBreakFocused = activeElement === elements.breakSlider ||
                           document.querySelector('.setting-item:last-of-type')?.contains(activeElement);
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      if (isWorkFocused) {
        e.preventDefault();
        adjustWorkTime(5);
      } else if (isBreakFocused) {
        e.preventDefault();
        adjustBreakTime(1);
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      if (isWorkFocused) {
        e.preventDefault();
        adjustWorkTime(-5);
      } else if (isBreakFocused) {
        e.preventDefault();
        adjustBreakTime(-1);
      }
    }
  });
  
  // 滚轮支持
  elements.workSlider.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    adjustWorkTime(delta);
  });
  
  elements.breakSlider.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    adjustBreakTime(delta);
  });
}

// 调整工作时长
function adjustWorkTime(delta) {
  settings.workDuration = Math.max(5, Math.min(120, settings.workDuration + delta));
  updateSettingsUI();
}

// 调整休息时长
function adjustBreakTime(delta) {
  settings.breakDuration = Math.max(1, Math.min(60, settings.breakDuration + delta));
  updateSettingsUI();
}

// 更新设置 UI
function updateSettingsUI() {
  elements.workValue.textContent = settings.workDuration;
  elements.breakValue.textContent = settings.breakDuration;
  elements.workSlider.value = settings.workDuration;
  elements.breakSlider.value = settings.breakDuration;
  
  // 音乐目录
  if (elements.musicDirDisplay) {
    elements.musicDirDisplay.textContent = settings.musicDir || '/home/steven/音乐/Music';
  }
  
  // 语音包
  if (elements.voicePackSelect) {
    elements.voicePackSelect.value = settings.voicePack || 'edge-tts-xiaoxiao';
  }
}

// 是否次级页面激活
function isSecondaryPageActive() {
  return elements.visualizePage.classList.contains('active') ||
         elements.settingsPage.classList.contains('active');
}

// 更新计时器显示
function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  elements.timerValue.textContent = 
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新状态徽章
function updateStatusBadge() {
  elements.statusBadge.className = 'status-badge';
  
  switch (currentState) {
    case State.WORKING:
      elements.statusBadge.classList.add('working');
      elements.statusText.textContent = '工作中';
      break;
    case State.BREAKING:
      elements.statusBadge.classList.add('breaking');
      elements.statusText.textContent = '休息中';
      break;
    case State.STOPPED:
      elements.statusText.textContent = '已停止';
      break;
    default:
      elements.statusText.textContent = '准备开始';
  }
}

// 更新切换按钮
function updateToggleButton() {
  const icon = elements.toggleIcon;
  const text = elements.toggleText;
  
  if (currentState === State.WORKING) {
    // 工作中，显示工作中（禁用点击）
    icon.innerHTML = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/>';
    text.textContent = '工作中...';
    elements.btnToggle.classList.remove('btn-primary');
    elements.btnToggle.classList.add('btn-secondary');
  } else if (currentState === State.BREAKING) {
    // 休息中，显示切换到工作
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    text.textContent = '开始工作';
    elements.btnToggle.classList.remove('btn-secondary');
    elements.btnToggle.classList.add('btn-primary');
  } else {
    // 停止状态，显示开始工作
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    text.textContent = '开始工作';
    elements.btnToggle.classList.remove('btn-secondary');
    elements.btnToggle.classList.add('btn-primary');
  }
}

// 更新按钮状态
function updateButtonStates() {
  const isWorking = currentState === State.WORKING;
  const isBreaking = currentState === State.BREAKING;
  const isRunning = isWorking || isBreaking;
  
  // 停止按钮：运行中可用
  elements.btnStop.disabled = !isRunning;
  
  // 切换按钮：工作中禁用（必须等时间结束或停止），休息中可用
  elements.btnToggle.disabled = isWorking;
}

// 更新进度环
function updateProgressRing(progress, duration = 0.5) {
  const circumference = 2 * Math.PI * 90;
  const offset = circumference * (1 - progress);
  elements.progressRingFill.style.transition = `stroke-dashoffset ${duration}s linear`;
  elements.progressRingFill.style.strokeDashoffset = offset;
}

// 更新快速统计
function updateQuickStats() {
  const total = todayStats.morning + todayStats.afternoon + todayStats.evening;
  elements.quickTotal.textContent = formatDuration(total);
}

// 显示可视化页面
function showVisualizePage() {
  updateVisualizeStats();
  elements.mainPage.classList.remove('active');
  elements.settingsPage.classList.remove('active');
  elements.visualizePage.classList.add('active');
}

// 显示设置页面
function showSettingsPage() {
  elements.mainPage.classList.remove('active');
  elements.visualizePage.classList.remove('active');
  elements.settingsPage.classList.add('active');
}

// 显示主页面
function showMainPage() {
  elements.visualizePage.classList.remove('active');
  elements.settingsPage.classList.remove('active');
  elements.mainPage.classList.add('active');
  updateStatusBadge();
  updateToggleButton();
  updateButtonStates();
}

// v2.0.1: 更新可视化统计 - 新时间段规则
function updateVisualizeStats() {
  const total = todayStats.morning + todayStats.afternoon + todayStats.evening;

  // 更新总时间显示（小时+分钟分开）
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  elements.totalHours.textContent = hours;
  elements.totalMinutes.textContent = mins;

  // v2.0.1: 时间段目标
  const targetMorning = 180; // 3小时 - 09:00-12:00
  const targetAfternoon = 240; // 4小时 - 12:00-18:00
  const targetEvening = 180; // 3小时 - 18:00-23:00

  // 计算百分比（限制最大100%用于进度条显示）
  const morningPercent = targetMorning > 0 ? Math.min(100, (todayStats.morning / targetMorning) * 100) : 0;
  const afternoonPercent = targetAfternoon > 0 ? Math.min(100, (todayStats.afternoon / targetAfternoon) * 100) : 0;
  const eveningPercent = targetEvening > 0 ? Math.min(100, (todayStats.evening / targetEvening) * 100) : 0;

  elements.detailMorning.textContent = formatDuration(todayStats.morning);
  elements.detailAfternoon.textContent = formatDuration(todayStats.afternoon);
  elements.detailEvening.textContent = formatDuration(todayStats.evening);

  elements.morningPercent.textContent = Math.round(Math.min(100, (todayStats.morning / targetMorning) * 100)) + '%';
  elements.afternoonPercent.textContent = Math.round(Math.min(100, (todayStats.afternoon / targetAfternoon) * 100)) + '%';
  elements.eveningPercent.textContent = Math.round(Math.min(100, (todayStats.evening / targetEvening) * 100)) + '%';

  // v2.0.1: 固定柱状图位置 - 早上0-37.5%, 下午37.5%-87.5%, 晚上87.5%-100%
  // 早上段 (0-3h)
  const morningWidth = Math.min(37.5, (todayStats.morning / targetMorning) * 37.5);
  elements.barMorning.style.width = morningWidth + '%';
  
  // 下午段 (3h-7h)
  const afternoonWidth = Math.min(50, (todayStats.afternoon / targetAfternoon) * 50);
  elements.barAfternoon.style.width = afternoonWidth + '%';
  
  // 晚上段 (7h-10h)
  const eveningWidth = Math.min(12.5, (todayStats.evening / targetEvening) * 12.5);
  elements.barEvening.style.width = eveningWidth + '%';

  // v2.0.1: 超时显示红色 + 火焰特效
  const statsCards = document.querySelectorAll('.stats-card');

  if (todayStats.morning > targetMorning) {
    elements.barMorning.classList.add('overflow-red');
    if (statsCards[0]) statsCards[0].classList.add('fire-effect');
  } else {
    elements.barMorning.classList.remove('overflow-red');
    if (statsCards[0]) statsCards[0].classList.remove('fire-effect');
  }

  if (todayStats.afternoon > targetAfternoon) {
    elements.barAfternoon.classList.add('overflow-red');
    if (statsCards[1]) statsCards[1].classList.add('fire-effect');
  } else {
    elements.barAfternoon.classList.remove('overflow-red');
    if (statsCards[1]) statsCards[1].classList.remove('fire-effect');
  }

  if (todayStats.evening > targetEvening) {
    elements.barEvening.classList.add('overflow-red');
    if (statsCards[2]) statsCards[2].classList.add('fire-effect');
  } else {
    elements.barEvening.classList.remove('overflow-red');
    if (statsCards[2]) statsCards[2].classList.remove('fire-effect');
  }
}

// 显示对话框
function showDialog(title, message, buttons) {
  elements.dialogTitle.textContent = title;
  elements.dialogMessage.textContent = message;
  elements.dialogBtn0.textContent = buttons[0];
  elements.dialogBtn1.textContent = buttons[1];
  elements.dialogOverlay.classList.add('show');
}

// 隐藏对话框
function hideDialog() {
  elements.dialogOverlay.classList.remove('show');
}

// 按钮点击动画
function animateButtonClick(button) {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => button.style.transform = '', 100);
}

// 格式化持续时间
function formatDuration(minutes) {
  if (minutes === 0) return '0分钟';
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
