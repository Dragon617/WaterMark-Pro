@echo off
chcp 65001 >nul
title WaterMark Pro 生产部署

echo ========================================
echo   WaterMark Pro 生产环境部署
echo ========================================
echo.

cd /d "%~dp0watermark-pro"

echo [1/4] 检查依赖...
if not exist node_modules (
    echo 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo [2/4] 清理旧构建...
if exist dist rmdir /s /q dist

echo [3/4] 构建项目...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成

echo [4/4] 启动生产服务器...
echo.
echo 使用 serve 静态服务器...
if not exist node_modules\serve (
    call npm install -g serve
)

start "" cmd /k "cd /d "%~dp0watermark-pro\dist" && serve -l 5173"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ 生产部署完成！
echo   访问地址: http://localhost:5173
echo ========================================
echo.
start http://localhost:5173
pause