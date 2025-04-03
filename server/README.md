# 腾讯文档应用服务端

## 简介

这是腾讯文档应用的Go后端服务，提供文档管理API以及ClickHouse数据分析功能。

## 功能特性

- RESTful API设计
- 文档管理（创建、查询、更新、删除）
- 用户认证和授权
- ClickHouse数据分析集成
  - 实时查询用户行为数据
  - 事件分析和统计
  - 用户分布分析

## 技术栈

- Go标准库HTTP服务
- ClickHouse数据库连接
- 基于Token的认证

## 目录结构

```
server/
  ├── controllers/           # API控制器
  │   └── analytics_controller.go  # 数据分析控制器
  ├── database/              # 数据库连接
  │   └── clickhouse.go      # ClickHouse连接配置
  ├── models/                # 数据模型
  │   └── kv7_model.go       # KV7表数据模型
  ├── utils/                 # 工具函数
  │   └── http_utils.go      # HTTP相关工具函数
  ├── data/                  # 示例数据
  │   └── sample_data.sql    # 示例SQL数据
  ├── main.go                # 应用入口
  └── go.mod                 # Go依赖管理
```

## ClickHouse集成

### 配置信息

应用默认使用以下ClickHouse连接配置：

```go
Host:     "220.181.43.138",
Port:     8123,
Username: "test_user",
Password: "Adefault132!",
Database: "test_db",
```

### 数据模型

主要使用`test_db.kv_7`表，该表包含以下主要字段：

- data_time: 数据产生时间
- time_hour: 数据时间所在小时
- id: 事件ID
- category: 事件分类
- action: 事件行为
- platform: 平台(web/ios/android)
- user_id: 用户ID
- os: 操作系统
- version: 版本号

### API端点

提供以下数据分析API端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/analytics/recent` | GET | 获取最近事件数据 |
| `/api/analytics/events` | GET | 获取事件分析数据 |
| `/api/analytics/users` | GET | 获取用户分布数据 |

### 示例数据

`data/sample_data.sql`文件包含示例数据，可以用于导入到ClickHouse进行测试：

```bash
cat data/sample_data.sql | curl 'http://220.181.43.138:8123/?user=test_user&password=Adefault132!' --data-binary @-
```

## 开发

### 依赖安装

```bash
go get github.com/ClickHouse/clickhouse-go/v2
go mod tidy
```

### 运行服务

```bash
go run main.go
```

服务默认在`:8080`端口运行。 