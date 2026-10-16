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
    "$b" --app="$URL" --window-size=440,760 --window-position=100,100 >/dev/null 2>&1 &
    exit 0
  fi
done

# mac 自带 Chrome 路径
if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app="$URL" --window-size=440,760 --window-position=100,100 &
  exit 0
fi

# 找不到 Chrome 系浏览器，退回默认浏览器（会带完整浏览器界面，不是小窗口）
echo "没找到 Chrome/Edge/Chromium，退回默认浏览器打开（无法做成无边框小窗口）"
if command -v open >/dev/null 2>&1; then open "$FILE"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$FILE"
fi
