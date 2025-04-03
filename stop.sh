#!/bin/bash
echo "正在停止所有服务..."

# 加载环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 停止前端和后端进程
echo "停止前端和后端服务..."
pkill -f "npm start" || true
pkill -f "go run main.go" || true

# 停止Docker容器
CONTAINER_NAME=${CLICKHOUSE_CONTAINER_NAME:-clickhouse-server}
if [ "$CONTAINER_NAME" != "clickhouse-server" ]; then
  echo "使用的是外部容器 $CONTAINER_NAME，跳过停止操作"
else
  echo "停止ClickHouse容器..."
  docker-compose down
fi

echo "所有服务已停止！" 