@echo off
chcp 65001 >nul
title WaterMark Pro 一键部署

echo ========================================
echo   WaterMark Pro 一键部署启动
echo ========================================
echo.

cd /d "%~dp0watermark-pro"

echo [1/3] 检查并安装依赖...
if not exist node_modules (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ 依赖就绪

echo.
echo [2/3] 构建项目...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成

echo.
echo [3/3] 启动服务...
start "" cmd /k "cd /d "%~dp0watermark-pro" && npx vite --port 5173"

timeout /t 3 /nobreak >nul
echo.
echo ========================================
echo   ✅ 部署完成！
echo   访问地址: http://localhost:5173
echo ========================================
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:5173