# 🎯 WorkRest - 智能工作休息管理器

<p align="center">
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/WorkRest-max/assets/clock.png" alt="WorkRest Logo" width="128">
</p>

<p align="center">
  <strong>告别久坐，拥抱健康生活</strong><br>
  <em>专为 Ubuntu/GNOME 设计的智能工作休息提醒应用</em>
</p>

<p align="center">
  <a href="#-快速开始">🚀 快速开始</a> •
  <a href="#-功能特性">✨ 功能</a> •
  <a href="#-版本对比">📦 版本</a> •
  <a href="#-安装指南">📥 安装</a> •
  <a href="#-使用教程">📖 教程</a>
</p>

---

## 🌟 为什么选择 WorkRest？

长时间久坐是现代人健康的隐形杀手。WorkRest 通过科学的工作/休息循环，帮助您：

- 🧘 **预防久坐疾病** - 定时提醒起身活动，保护腰椎和颈椎
- 🧠 **提高工作效率** - 番茄工作法让您保持专注
- 🎵 **享受休息时光** - 随机音乐让每次休息都充满期待
- 📊 **追踪工作习惯** - 可视化统计帮助您了解自己的工作模式
- 🔇 **办公室模式** - 一键静音，不打扰他人

---

## 📸 应用截图

### 🖥️ WorkRest Max - 完整版 (900×700)

<p align="center">
  <strong>主界面 - 工作中</strong><br>
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/screenshots/max-main-working.png" alt="Max 主界面" width="600">
</p>

<p align="center">
  <strong>主界面 - 休息中</strong><br>
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/screenshots/max-main-breaking.png" alt="Max 休息中" width="600">
</p>

<p align="center">
  <strong>📊 详细统计页面</strong><br>
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/screenshots/max-stats.png" alt="Max 统计页面" width="600">
</p>

<p align="center">
  <strong>⚙️ 设置页面</strong><br>
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/screenshots/max-settings.png" alt="Max 设置页面" width="600">
</p>

### 📱 WorkRest Mini - 紧凑版 (420×680)

<p align="center">
  <strong>主界面</strong><br>
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/screenshots/mini-main.png" alt="Mini 主界面" width="300">
</p>

<p align="center">
  <strong>统计概览</strong><br>
  <img src="https://raw.githubusercontent.com/RobotXTeam/WorkRest/main/screenshots/mini-stats.png" alt="Mini 统计" width="300">
</p>

---

## 🚀 快速开始

### 一键安装

```bash
# 下载最新版本
cd ~/Downloads

# 安装 WorkRest Max（推荐，功能完整）
sudo apt install ./workrest-max_2.0.1_amd64.deb

# 或安装 WorkRest Mini（紧凑版）
sudo apt install ./workrest-mini_2.0.1_amd64.deb

# 也可以同时安装两个版本，它们会完全独立运行！
```

### 依赖安装

```bash
# 安装系统依赖 electron
npm install -g electron@28

# 安装语音依赖（Edge TTS 为推荐语音）
sudo apt install espeak mpv

# 安装 Edge TTS（可选，小爱同学风格语音）
pip install edge-tts
```

---

## ✨ 功能特性

### 🎯 核心功能

| 功能 | Max | Mini |
|------|-----|------|
| ⏱️ 智能计时 | ✅ 45分钟工作 + 15分钟休息 | ✅ 45分钟工作 + 15分钟休息 |
| 🎵 音乐休息 | ✅ 随机播放，自动停止 | ✅ 随机播放，自动停止 |
| 📊 工作统计 | ✅ 详细三时段分析 | ✅ 简洁概览 |
| 🔔 智能提醒 | ✅ TTS语音 + 系统通知 | ✅ TTS语音 + 系统通知 |
| 🔇 办公室模式 | ✅ 一键静音所有声音 | ✅ 一键静音所有声音 |
| ⚙️ 自定义设置 | ✅ 完整设置面板 | ✅ 基础设置 |
| 🎨 精美界面 | ✅ 玻璃拟态设计 | ✅ 玻璃拟态设计 |

### 📊 智能统计系统 (v2.0.1 更新)

- **早晨时段** (09:00-12:00) - 目标：3小时高效工作
- **下午时段** (12:00-18:00) - 目标：4小时持续产出  
- **晚间时段** (18:00-23:00) - 目标：3小时灵活安排

可视化进度条让您一目了然当天的工作状态！
**超时显示红色 + 火焰特效**，激励您的努力！

### 🔔 智能提醒 (v2.0.1 更新)

- **进度提示音**: 工作剩余 2/3 和 1/3 时播放"叮叮"提示
- **语音播报**: "工作已完成，请开始休息"
- **系统通知**: GNOME 原生通知集成
- **窗口置顶**: 提醒时自动置顶

### 🎵 音乐休息

- 自动检测 `~/音乐/Music` 目录
- 随机播放，每次休息都有惊喜
- 休息结束自动停止音乐（v2.0.1）
- 支持 MP3、FLAC、WAV 等主流格式
- 内置默认音乐，无需配置即可使用

### 🔇 办公室模式 (v2.0.1 新增)

点击左上角的"办公室模式"按钮：
- 🎵 停止播放休息音乐
- 🔊 关闭所有提示音（叮、叮叮、叮叮叮）
- 🗣️ 关闭语音播报
- 绚丽的点击特效反馈

---

## 📦 版本对比

| 特性 | WorkRest Max | WorkRest Mini |
|------|--------------|---------------|
| **窗口尺寸** | 900×700 | 420×680 |
| **界面风格** | 完整展示 | 紧凑精简 |
| **统计页面** | 详细可视化 | 简洁概览 |
| **窗口控制** | 最小化/最大化/关闭 | 最小化/关闭 |
| **适合场景** | 桌面大屏 | 笔记本/小屏 |
| **数据目录** | `~/.workrest-max/` | `~/.workrest-mini/` |
| **进程名** | `workrest-max` | `workrest-mini` |

### 💡 如何选择？

- **选 Max**：如果您有充足桌面空间，想要详细的统计和完整的体验
- **选 Mini**：如果您屏幕较小，喜欢简洁高效的操作
- **两个都要**：它们完全独立，可以同时运行！

---

## 📥 安装指南

### 系统要求

- **操作系统**: Ubuntu 20.04+ / 22.04+ (GNOME 桌面)
- **Node.js**: v18+ (用于 electron)
- **依赖**: espeak, mpv, libgtk-3-0

### 从 Release 安装

1. 访问 [Releases 页面](../../releases)
2. 下载对应版本的 `.deb` 文件
3. 双击安装或使用命令行：
   ```bash
   sudo apt install ./workrest-*.deb
   ```

### 从源码运行

```bash
# 克隆仓库
git clone https://github.com/RobotXTeam/WorkRest.git
cd WorkRest

# 进入对应版本目录
cd WorkRest-max  # 或 cd WorkRest-mini

# 安装依赖
npm install

# 启动应用
npm start
```

---

## 📖 使用教程

### 首次使用

```bash
# 1. 可选：准备音乐目录
mkdir -p ~/音乐/Music
cp your-music/*.mp3 ~/音乐/Music/

# 2. 启动应用
workrest-max  # 或 workrest-mini

# 3. 点击"开始工作"按钮，开始您的高效一天！
```

### 日常使用流程

```
🌅 早晨
  └─> 启动 WorkRest
  └─> 点击"开始工作"
  └─> 专注工作 45 分钟...
  └─> 🔔 语音提醒：休息15分钟！
  └─> 🎵 音乐响起，起身活动
  
☀️ 下午  
  └─> 重复工作/休息循环
  └─> 查看统计了解上午产出
  
🌙 晚间
  └─> 查看全天统计
  └─> 了解自己的工作模式
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始/切换工作休息 |
| `Ctrl+S` | 停止计时 |
| `Ctrl+D` | 查看统计 |
| `Ctrl+,` | 打开设置 |
| `Ctrl+Q` | 退出应用 |
| `Ctrl+Shift+I` | 开发者工具 |

---

## 🏗️ 项目结构

```
WorkRest/
├── WorkRest-max/          # Max 版本源码
│   ├── main.js           # 主进程
│   ├── renderer.js       # 渲染进程
│   ├── preload.js        # 预加载脚本
│   ├── index.html        # 主界面
│   ├── styles.css        # 样式
│   ├── package.json      # 配置
│   └── assets/           # 图标资源
│
├── WorkRest-mini/         # Mini 版本源码
│   └── ...               # 同上
│
├── screenshots/           # 应用截图
├── Release/              # 发布文件
│   └── README.md         # 本文件
├── updata.txt            # 更新日志
└── build-all.sh          # 构建脚本
```

---

## 📝 更新日志

### v2.0.1 (2026-03-04)

- ✨ **办公室模式**: 一键静音所有声音，适合办公室环境
- 🎵 **进度提示音**: 工作剩余 2/3 和 1/3 时播放提示
- 🔥 **超时火焰特效**: 工作超时显示红色+火焰效果
- 📊 **统计规则优化**: 时间段调整为 09:00-12:00、12:00-18:00、18:00-23:00
- 🎤 **中文语音优化**: 默认使用 Edge TTS 晓晓中文（小爱同学风格）
- 🎵 **休息结束自动停音乐**: 休息时间一结束立即停止音乐
- 🎵 **默认音乐**: 内置 NIKON【I AM】默认音乐
- 🪟 **窗口控制**: 右上角增加窗口控制按钮
- 🐛 **Bug 修复**: 修复 Mini 版本启动问题

### v2.0.0 (2026-03-03)

- 🎉 **双版本发布**: Max 完整版 + Mini 紧凑版
- 🎨 **玻璃拟态设计**: 全新的视觉体验
- 📊 **智能统计**: 三时段工作统计
- 🎵 **音乐休息**: 自动播放休息音乐
- 🔔 **语音提醒**: 工作/休息语音播报

---

## 🤝 贡献指南

我们欢迎各种形式的贡献！

1. **Fork** 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 **Pull Request**

---

## 📜 开源许可

本项目采用 [MIT 许可证](LICENSE) 开源。

```
MIT License

Copyright (c) 2024-2026 WorkRest Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

...
```

---

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [anime.js](https://animejs.com/) - 流畅的动画库
- [Edge TTS](https://github.com/rany2/edge-tts) - 微软 Edge 语音合成
- [Google TTS](https://cloud.google.com/text-to-speech) - 语音合成

---

<p align="center">
  <strong>Made with ❤️ for healthier work habits</strong><br>
  <a href="https://github.com/RobotXTeam/WorkRest">GitHub</a> •
  <a href="../../issues">Issues</a> •
  <a href="../../releases">Releases</a>
</p>
