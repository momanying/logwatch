# 腾讯文档应用

这是一个基于React和Go的腾讯文档应用，前端使用腾讯Tea组件库构建，后端提供RESTful API服务和ClickHouse数据分析功能。

## 功能特点

- 用户认证与授权系统
- 文档管理（创建、查询、更新、删除）
- 文档共享和协作
- 支持多种文档类型（文档、表格、幻灯片）
- 响应式用户界面（基于Tea组件库）
- 实时数据分析（基于ClickHouse）
  - 用户行为数据查询
  - 事件分析统计
  - 用户分布分析
  - 详细记录查看

## 技术栈

### 前端

- React.js - 用户界面库
- TypeScript - 类型安全
- @tencent/tea-component - 腾讯内部组件库
- Axios - HTTP客户端
- date-fns - 日期处理

### 后端

- Go - 后端编程语言
- 标准库HTTP服务 - API服务器
- ClickHouse - 分析数据库

## 开始使用

### 前提条件

- Node.js 14+
- Go 1.16+
- ClickHouse数据库（测试账号已配置）

### 安装和运行

1. 克隆仓库

```
git clone https://github.com/yourusername/tencent-docs.git
cd tencent-docs
```

2. 安装前端依赖

```
cd src
npm install
```

3. 安装后端依赖

```
cd server
go mod download
```

4. 配置环境

创建`.env`文件或设置环境变量：

```
PORT=8080
JWT_SECRET=your_jwt_secret
```

5. 启动应用

使用提供的启动脚本：

```
.\start.cmd
```

或分别启动前端和后端：

```
# 前端
cd src
npm start

# 后端
cd server
go run main.go
```

## API配置

### 前端API

前端API服务配置在`src/services/api.ts`中，包括：

- 基础URL配置
- 请求拦截器（添加认证令牌）
- 响应处理和错误处理

### 后端API

后端API在`server/main.go`中注册路由，主要包括：

- 认证API（`/api/auth/*`）
- 文档管理API（`/api/documents/*`）
- 数据分析API（`/api/analytics/*`）

## 项目结构

- `server/`: Go后端服务
- `src/`: React前端应用
- `docker-compose.yml`: Docker配置文件，用于启动ClickHouse
- `start.cmd`/`start.sh`: 一键启动所有服务的脚本
- `stop.cmd`/`stop.sh`: 停止所有服务的脚本
- `restart.cmd`/`restart.sh`: 重启所有服务的脚本
- `scripts/`: Node.js脚本目录
  - `start-all.js`: 启动所有服务的Node.js脚本
  - `stop-all.js`: 停止所有服务的Node.js脚本
  - `restart-all.js`: 重启所有服务的Node.js脚本
  - `check-deps.js`: 检查依赖安装情况的脚本

## 依赖检查

首次运行前，建议先检查所需依赖是否已安装：

```bash
npm run check-deps
```

该命令会检查：
- Docker 和 Docker Compose 是否已安装
- Go 环境是否已安装
- Node.js 环境是否已安装
- 项目依赖是否已安装完成

如有缺失依赖，脚本会提示安装方法。

## 一键启动

项目提供了多种方式启动所有服务（前端、后端、ClickHouse数据库）：

### 命令行脚本（推荐Windows用户使用）

```bash
# 启动所有服务
start.cmd

# 停止所有服务
stop.cmd

# 重启所有服务
restart.cmd
```

### Shell脚本（推荐Linux/Mac用户使用）

```bash
# 赋予执行权限
chmod +x *.sh

# 启动所有服务
./start.sh

# 停止所有服务
./stop.sh

# 重启所有服务
./restart.sh
```

### NPM脚本（跨平台支持）

```bash
# 启动所有服务
npm run start:all

# 停止所有服务
npm run stop:all

# 重启所有服务
npm run restart:all
```

启动后可访问：
- 前端：http://localhost:3000
- 后端：http://localhost:8888
- ClickHouse HTTP：http://localhost:8123
- ClickHouse TCP：localhost:9000

## ClickHouse数据分析

本应用集成了ClickHouse数据库，用于高性能数据分析。

### 数据库配置

默认连接配置（已配置好，无需更改）：

- 主机：`47.245.124.79`
- 端口：`9000`
- 用户名：`test_user`
- 密码：`Adefault132!`
- 数据库：`test_db`

### 数据表结构

使用`test_db.kv_7`表，主要字段包括：

- `data_time` - 数据时间
- `time_hour` - 小时时间
- `id` - 记录ID
- `category` - 分类（如页面、事件、操作）
- `action` - 行为（如点击、浏览、提交）
- `platform` - 平台（如web、ios、android）
- `user_id` - 用户ID
- `os` - 操作系统
- `version` - 版本号
- 扩展字段：
  - `d1` - `d40` - 字符串类型数据字段
  - `v1` - `v40` - 数值类型数据字段
  - `info1` - `info10` - 信息字段
  - `ud1` - `ud20` - 用户数据字段
  - `uv1` - `uv10` - 用户数值字段
  - `sd1` - `sd20` - 会话数据字段
  - `sv1` - `sv10` - 会话数值字段

### 数据分析API

| 端点                     | 方法 | 描述                   |
|-------------------------|------|------------------------|
| `/api/analytics/recent` | GET  | 获取最近的数据记录       |
| `/api/analytics/events` | GET  | 获取事件分析统计         |
| `/api/analytics/users`  | GET  | 获取用户分布情况         |
| `/api/analytics/record` | GET  | 获取单条记录的完整详情   |

### 导入示例数据

使用以下命令将示例数据导入ClickHouse（已提供示例SQL）：

```bash
curl http://localhost:8080/api/admin/import-sample-data
```

或手动执行SQL文件：

```sql
cat server/data/sample_data.sql | curl 'http://47.245.124.79:8123/' --data-binary @-
```

## 开发说明

### 认证

应用使用JWT进行认证。默认测试账号：

- 用户名：`test`
- 密码：`password`

### 前端开发

运行以下命令启动开发服务器：

```
cd src
npm start
```

访问 [http://localhost:3000](http://localhost:3000)

### 后端开发

运行以下命令启动后端：

```
cd server
go run main.go
```

API服务运行在 [http://localhost:8080](http://localhost:8080)

## 数据分析功能说明

### 最近数据

查看系统最近记录的用户行为数据，支持按以下条件筛选：

- 时间范围
- 事件分类
- 行为类型
- 平台
- 记录数量限制

### 事件分析

统计和分析系统中的事件数据，按事件类型和行为进行聚合，展示各类事件的发生次数。

### 用户分布

分析用户在不同操作系统和平台上的分布情况，计算各平台的用户占比。

### 记录详情

查看单条数据记录的完整详情，包括：

- 基本信息（时间、ID、分类、行为等）
- 扩展数据字段（d1-d40）
- 数值字段（v1-v40）
- 信息字段（info1-info10）
- 用户数据字段（ud1-ud20）
- 用户数值字段（uv1-uv10）
- 会话数据字段（sd1-sd20）
- 会话数值字段（sv1-sv10）

## ClickHouse整合说明

本项目使用Docker来运行ClickHouse数据库，可以通过以下方式部署和连接数据库。

### 使用Docker容器

项目提供了多种方式连接ClickHouse容器：

1. **使用项目自带的Docker Compose配置**

```bash
# 启动ClickHouse容器
docker-compose up -d

# 检查容器状态
docker ps
```

2. **使用现有的Docker容器**

如果你已经在Docker Desktop中创建了ClickHouse容器，可以在`.env`文件中设置容器名称：

```
# 数据库配置
USE_REAL_DATABASE=true
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=9000
CLICKHOUSE_USER=test_user
CLICKHOUSE_PASSWORD=Adefault132!
CLICKHOUSE_DATABASE=test_db
CLICKHOUSE_CONTAINER_NAME=your_container_name  # 你的容器名称，如"trusting_mahavira"
```

启动脚本会自动检测并使用指定的容器，而不会创建新容器。

### 数据库配置

数据库连接配置在`.env`文件中，可以根据需要修改：

```
# 数据库配置
USE_REAL_DATABASE=false    # 是否使用真实数据库，设为false时使用模拟数据
CLICKHOUSE_HOST=localhost  # ClickHouse主机地址
CLICKHOUSE_PORT=9000       # ClickHouse端口
CLICKHOUSE_USER=test_user  # 用户名
CLICKHOUSE_PASSWORD=Adefault132!  # 密码
CLICKHOUSE_DATABASE=test_db  # 数据库名
```

如果需要使用真实的ClickHouse数据库，请将`USE_REAL_DATABASE`设置为`true`。

### 初始化数据库

项目提供了初始化脚本`init_db.sql`，可以通过以下命令初始化数据库：

```bash
# 将SQL脚本导入到ClickHouse
cat init_db.sql | docker exec -i clickhouse-server clickhouse-client --multiquery
```

或者通过HTTP接口初始化：

```bash
curl -X POST "http://localhost:8123/?query=CREATE%20DATABASE%20IF%20NOT%20EXISTS%20test_db"
curl -X POST --data-binary @init_db.sql http://localhost:8123/
```

## 生产环境部署

对于生产环境，建议使用`.env.production`配置文件，并确保ClickHouse数据库已正确配置：

```bash
# 使用生产环境配置启动后端
ENV=production go run main.go

# 构建前端生产版本
cd src
npm run build
```