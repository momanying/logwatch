#!/bin/bash
echo "正在启动所有服务..."

# 加载环境变量
export USE_REAL_DATABASE=true
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 检查Docker是否运行
echo "检查Docker服务..."
if ! docker info > /dev/null 2>&1; then
    echo "[错误] Docker服务未运行，请先启动Docker"
    exit 1
fi

# 检查ClickHouse容器
echo "检查ClickHouse容器..."
CONTAINER_NAME=${CLICKHOUSE_CONTAINER_NAME:-clickhouse-server}
echo "使用容器: $CONTAINER_NAME"

RUNNING_CONTAINER=$(docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}")

if [ -z "$RUNNING_CONTAINER" ]; then
    echo "ClickHouse容器未运行，尝试启动..."
    
    EXISTING_CONTAINER=$(docker container ls -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}")
    
    if [ -n "$EXISTING_CONTAINER" ]; then
        echo "启动已存在的容器 $CONTAINER_NAME..."
        docker start $CONTAINER_NAME
    else
        if [ "$CONTAINER_NAME" = "clickhouse-server" ]; then
            echo "使用docker-compose创建新容器..."
            docker-compose down
            docker-compose up -d
        else
            echo "指定的容器 $CONTAINER_NAME 不存在，请使用Docker Desktop检查"
            exit 1
        fi
    fi
else
    echo "容器 $CONTAINER_NAME 已在运行"
fi

# 等待ClickHouse启动
echo "等待ClickHouse服务就绪..."
sleep 10

# 导入初始化数据
echo "导入初始化数据..."
if [ -f init_db.sql ]; then
    cat init_db.sql | docker exec -i $CONTAINER_NAME clickhouse-client --multiquery
else
    echo "初始化SQL文件不存在，跳过数据导入"
fi

# 启动后端服务
echo "启动后端服务..."
cd server && GO111MODULE=on go run main.go &
SERVER_PID=$!

# 等待后端服务启动
echo "等待后端服务就绪..."
sleep 5

# 启动前端服务
echo "启动前端服务..."
cd ../src && npm start &
FRONTEND_PID=$!

echo "所有服务已启动！"
echo "前端：http://localhost:3000"
echo "后端：http://localhost:8888"
echo "ClickHouse HTTP：http://localhost:8123"
echo "ClickHouse Native：localhost:9000"

# 等待用户终止
echo "按 Ctrl+C 停止所有服务"
wait $FRONTEND_PID 