# WorkRest 截图指南

## 窗口截图方法

使用 `-w` 参数只截取当前活动窗口：

```bash
# 切换到截图目录
cd /home/steven/work/cli/kimi/WorkRest/screenshots

# 确保 WorkRest 窗口获得焦点（点击一下窗口）
# 然后执行截图命令
```

## 手动截图命令

```bash
# 1. Max 版本 - 工作中
gnome-screenshot -w -f max-main-working.png

# 2. Max 版本 - 休息中  
gnome-screenshot -w -f max-main-breaking.png

# 3. Max 版本 - 统计页面
gnome-screenshot -w -f max-stats.png

# 4. Max 版本 - 设置页面
gnome-screenshot -w -f max-settings.png

# 5. Mini 版本 - 主界面
gnome-screenshot -w -f mini-main.png

# 6. Mini 版本 - 统计页面
gnome-screenshot -w -f mini-stats.png
```

## 使用交互式脚本

```bash
chmod +x capture.sh
./capture.sh
```

脚本会一步步引导你完成截图。

## 截图清单

| 文件名 | 尺寸建议 | 内容 |
|--------|----------|------|
| max-main-working.png | 900x700 | Max 工作中状态 |
| max-main-breaking.png | 900x700 | Max 休息中状态 |
| max-stats.png | 900x700 | Max 统计页面 |
| max-settings.png | 900x700 | Max 设置页面 |
| mini-main.png | 420x680 | Mini 主界面 |
| mini-stats.png | 420x680 | Mini 统计页面 |

## 注意事项

1. 截图前确保 WorkRest 窗口是**当前活动窗口**（标题栏高亮）
2. 使用 `-w` 参数只会截取窗口内容，不会包含其他屏幕
3. 如果窗口截图失败，可以尝试点击窗口标题栏再截图
