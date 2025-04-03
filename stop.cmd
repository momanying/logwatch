@echo off
echo 正在停止所有服务...

:: 停止后端和前端服务的进程
echo 停止后端和前端服务...
taskkill /F /FI "WINDOWTITLE eq *server*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *npm start*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *src*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *go run*" /T >nul 2>&1

:: 停止Docker容器
echo 停止ClickHouse容器...
docker-compose down

echo 所有服务已停止！ 