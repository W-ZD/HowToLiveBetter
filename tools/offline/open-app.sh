#!/usr/bin/env bash
# 本地生成离线单文件版 + 一次看一条的导航条，然后用浏览器"应用模式"开一个无地址栏的小窗口。
# 用法：./tools/offline/open-app.sh
set -e
cd "$(dirname "$0")/../.."

node tools/offline/build.mjs
node tools/offline/inject-nav.mjs

FILE="$(pwd)/dist/HowToLiveBetter.html"
URL="file://$FILE"

for b in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
  if command -v "$b" >/dev/null 2>&1; then
    # 独立 user-data-dir：Chrome 已经开着时，--app 只会在老进程里开新窗口，
    # 启动参数（窗口大小、深色模式）全被忽略；独立目录保证起的是新实例，参数一定生效。
    # --force-dark-mode：Chrome 不认 file:// 页面的 theme-color，--app 窗口标题栏会一直是白的；
    # 用这个开关强制界面走深色，标题栏变黑，页面也跟着切到自带暗色主题。
    "$b" --app="$URL" --user-data-dir="$HOME/.cache/hltb-app" --no-first-run --no-default-browser-check \
      --force-dark-mode --window-size=300,520 --window-position=100,100 >/dev/null 2>&1 &
    exit 0
  fi
done

# mac 自带 Chrome 路径
if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app="$URL" --user-data-dir="$HOME/.cache/hltb-app" --no-first-run --no-default-browser-check \
    --force-dark-mode --window-size=300,520 --window-position=100,100 &
  exit 0
fi

# 找不到 Chrome 系浏览器，退回默认浏览器（会带完整浏览器界面，不是小窗口）
echo "没找到 Chrome/Edge/Chromium，退回默认浏览器打开（无法做成无边框小窗口）"
if command -v open >/dev/null 2>&1; then open "$FILE"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$FILE"
fi
