@echo off
echo 正在启动服务...

:: 设置环境变量
set USE_REAL_DATABASE=true
for /f "tokens=*" %%a in (.env) do set "%%a"

:: 检查Docker是否运行
echo 检查Docker服务...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Docker服务未运行，请先启动Docker
    goto :error
)

:: 停止所有现有容器
echo 停止现有容器...
docker-compose down

:: 启动后端容器
echo 启动后端容器...
docker-compose up -d

:: 等待容器启动
echo 等待服务就绪...
timeout /t 10 /nobreak

:: 检查容器状态
echo 检查容器运行状态...
docker ps --filter "name=tencent-backend"

:: 显示后端日志（最后10行）
echo 显示后端日志...
docker logs tencent-backend --tail 10

echo 所有服务已启动！
echo 后端API：http://localhost:8888
echo 连接到远程ClickHouse：159.75.36.118:5501

echo.
echo 提示：使用以下命令查看容器日志:
echo - 查看后端日志：docker logs -f tencent-backend
goto :eof

:error
echo 启动失败，请检查错误信息
pause 