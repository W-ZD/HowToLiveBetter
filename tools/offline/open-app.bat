@echo off
REM 本地生成离线单文件版 + 一次看一条的导航条，然后用浏览器"应用模式"开一个无地址栏的小窗口。
cd /d "%~dp0..\.."

call node tools\offline\build.mjs
call node tools\offline\inject-nav.mjs

set FILE=%cd%\dist\HowToLiveBetter.html

where chrome >nul 2>nul
if %errorlevel%==0 (
  REM 独立 user-data-dir 保证 Chrome 已开着时启动参数照样生效；--force-dark-mode 让标题栏变黑
  start chrome --app="file:///%FILE:\=/%" --user-data-dir="%USERPROFILE%\.cache\hltb-app" --no-first-run --no-default-browser-check --force-dark-mode --window-size=300,520 --window-position=100,100
  goto :eof
)
where msedge >nul 2>nul
if %errorlevel%==0 (
  start msedge --app="file:///%FILE:\=/%" --user-data-dir="%USERPROFILE%\.cache\hltb-app" --no-first-run --no-default-browser-check --force-dark-mode --window-size=300,520 --window-position=100,100
  goto :eof
)

echo 没找到 Chrome/Edge，退回默认浏览器打开（无法做成无边框小窗口）
start "" "%FILE%"
