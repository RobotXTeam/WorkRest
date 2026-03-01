#!/bin/bash
# WorkRest 截图脚本 - 窗口模式

cd /home/steven/work/cli/kimi/WorkRest/screenshots

echo "========================================"
echo "WorkRest 截图工具 (窗口模式)"
echo "========================================"
echo ""

# 检查 gnome-screenshot
if ! command -v gnome-screenshot &> /dev/null; then
    echo "正在安装 gnome-screenshot..."
    sudo apt install -y gnome-screenshot
fi

echo "截图方式：只截取 WorkRest 窗口"
echo ""
echo "使用方法："
echo "  1. 先启动 WorkRest 并调整到想要的状态"
echo "  2. 点击 WorkRest 窗口让它获得焦点"
echo "  3. 运行对应的截图命令"
echo ""

# 截图函数
take_screenshot() {
    local name=$1
    local description=$2
    echo "📸 准备截图: $description"
    echo "   文件名: $name"
    echo ""
    echo "   ⚠️  请确保 WorkRest 窗口已获得焦点（点击一下窗口）"
    read -p "   准备好后按回车键截图..."
    
    # -w 截取当前活动窗口
    gnome-screenshot -w -f "$name"
    
    if [ -f "$name" ]; then
        echo "   ✅ 已保存: $name"
        ls -lh "$name"
    else
        echo "   ❌ 截图失败"
    fi
    echo ""
}

echo "========================================"
echo "开始截图流程"
echo "========================================"
echo ""

echo "1️⃣  Max 版本 - 工作中状态"
echo "   操作：启动 workrest-max → 点击'开始工作'"
take_screenshot "max-main-working.png" "Max 主界面-工作中"

echo "2️⃣  Max 版本 - 休息中状态"
echo "   操作：切换到休息状态（等待或点击切换）"
take_screenshot "max-main-breaking.png" "Max 主界面-休息中"

echo "3️⃣  Max 版本 - 统计页面"
echo "   操作：点击'查看统计'按钮"
take_screenshot "max-stats.png" "Max 统计页面"

echo "4️⃣  Max 版本 - 设置页面"
echo "   操作：返回主页面，点击'设置'按钮"
take_screenshot "max-settings.png" "Max 设置页面"

echo "5️⃣  Mini 版本 - 主界面"
echo "   操作：启动 workrest-mini → 开始工作"
take_screenshot "mini-main.png" "Mini 主界面-工作中"

echo "6️⃣  Mini 版本 - 统计页面"
echo "   操作：点击'查看统计'"
take_screenshot "mini-stats.png" "Mini 统计页面"

echo "========================================"
echo "✅ 所有截图完成！"
echo "========================================"
echo ""
echo "生成的文件："
ls -la *.png 2>/dev/null || echo "暂无截图"
