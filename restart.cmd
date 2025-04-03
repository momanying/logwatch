@echo off
echo 重启所有服务...

:: 先停止所有服务
call stop.cmd

:: 等待所有服务完全停止
timeout /t 3 /nobreak

:: 然后重新启动所有服务
call start.cmd 