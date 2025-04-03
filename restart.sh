#!/bin/bash
echo "重启所有服务..."

# 先停止所有服务
./stop.sh

# 等待所有服务完全停止
sleep 3

# 然后重新启动所有服务
./start.sh 