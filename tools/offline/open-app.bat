@echo off
REM 本地生成离线单文件版 + 一次看一条的导航条，然后用浏览器"应用模式"开一个无地址栏的小窗口。
cd /d "%~dp0..\.."

call node tools\offline\build.mjs
call node tools\offline\inject-nav.mjs

set FILE=%cd%\dist\HowToLiveBetter.html

where chrome >nul 2>nul
if %errorlevel%==0 (
  start chrome --app="file:///%FILE:\=/%" --window-size=440,760 --window-position=100,100
  goto :eof
)
where msedge >nul 2>nul
if %errorlevel%==0 (
  start msedge --app="file:///%FILE:\=/%" --window-size=440,760 --window-position=100,100
  goto :eof
)

echo 没找到 Chrome/Edge，退回默认浏览器打开（无法做成无边框小窗口）
start "" "%FILE%"
