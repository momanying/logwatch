package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/ClickHouse/clickhouse-go/v2"
)

// ClickHouseConfig 表示ClickHouse连接配置
type ClickHouseConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	Database string
}

// 全局数据库连接
var db *sql.DB

// QueryOptions 查询选项
type QueryOptions struct {
	StartTime time.Time
	EndTime   time.Time
	Limit     int
	Offset    int
	Platform  string
	OS        string
	UserID    string
	Category  string
	Action    string
	AppID     string
	Version   string
	SortBy    string
	SortOrder string
	Filter    map[string]interface{}
}

// DefaultQueryOptions 返回默认查询选项
func DefaultQueryOptions() QueryOptions {
	now := time.Now()
	return QueryOptions{
		StartTime: now.Add(-24 * time.Hour),
		EndTime:   now,
		Limit:     100,
		Offset:    0,
		Filter:    make(map[string]interface{}),
	}
}

// InitClickHouse 初始化ClickHouse数据库连接
func InitClickHouse() (*sql.DB, error) {
	config := getClickHouseConfig()

	// 构建符合指定版本的连接字符串
	// 使用更简单的DSN格式
	dsn := fmt.Sprintf("clickhouse://%s:%s@%s:%s/%s",
		config.Username,
		config.Password,
		config.Host,
		config.Port,
		config.Database,
	)

	// 输出连接信息
	log.Printf("尝试连接ClickHouse: %s:%s, 数据库: %s, 用户: %s",
		config.Host,
		config.Port,
		config.Database,
		config.Username,
	)

	// 建立连接
	var err error
	db, err = sql.Open("clickhouse", dsn)
	if err != nil {
		log.Printf("连接ClickHouse失败: %v", err)
		return nil, err
	}

	// 设置连接池参数
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Hour)

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		log.Printf("Ping ClickHouse失败: %v", err)
		return nil, err
	}

	log.Println("成功连接到ClickHouse数据库!")

	return db, nil
}

// GetDB 获取数据库连接
func GetDB() *sql.DB {
	if db == nil {
		// 如果连接未初始化，尝试初始化
		conn, err := InitClickHouse()
		if err != nil {
			log.Printf("无法获取ClickHouse连接: %v", err)
			return nil
		}
		db = conn
	}

	// 检查连接是否有效
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		log.Printf("数据库连接无效，尝试重新连接: %v", err)
		conn, err := InitClickHouse()
		if err != nil {
			log.Printf("重新连接失败: %v", err)
			return nil
		}
		db = conn
	}

	return db
}

// QueryLogs 从ClickHouse中查询日志数据
func QueryLogs(ctx context.Context, table string, limit int) ([]map[string]interface{}, error) {
	conn := GetDB()
	if conn == nil {
		return nil, fmt.Errorf("无法获取数据库连接")
	}

	// 构建简单查询
	query := fmt.Sprintf("SELECT * FROM %s LIMIT %d", table, limit)
	log.Printf("执行查询: %s", query)

	// 执行查询
	rows, err := conn.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("查询执行失败: %w", err)
	}
	defer rows.Close()

	// 获取列信息
	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("获取列信息失败: %w", err)
	}

	// 准备结果
	var results []map[string]interface{}

	// 遍历结果集
	for rows.Next() {
		// 创建扫描目标
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("扫描行数据失败: %w", err)
		}

		// 创建行映射
		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			row[col] = val
		}

		results = append(results, row)
	}

	// 检查遍历错误
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("遍历结果集失败: %w", err)
	}

	log.Printf("查询成功，返回 %d 条记录", len(results))
	return results, nil
}

// QueryKV7WithFilters 从kv_7表查询数据，支持时间范围过滤和获取总数
func QueryKV7WithFilters(ctx context.Context, limit int, offset int, needCount bool, startTime string, endTime string) ([]map[string]interface{}, int, error) {
	conn := GetDB()
	if conn == nil {
		return nil, 0, fmt.Errorf("无法获取数据库连接")
	}

	// 构建WHERE子句
	whereClause := ""
	whereParams := []interface{}{}

	if startTime != "" && endTime != "" {
		// 如果同时提供了开始和结束时间
		whereClause = "WHERE data_time >= ? AND data_time <= ?"
		whereParams = append(whereParams, startTime, endTime)
	} else if startTime != "" {
		// 只提供了开始时间
		whereClause = "WHERE data_time >= ?"
		whereParams = append(whereParams, startTime)
	} else if endTime != "" {
		// 只提供了结束时间
		whereClause = "WHERE data_time <= ?"
		whereParams = append(whereParams, endTime)
	}

	// 获取总记录数
	var totalCount int
	if needCount {
		// 构建COUNT查询
		countQuery := "SELECT COUNT(*) FROM kv_7 " + whereClause

		// 执行COUNT查询
		row := conn.QueryRowContext(ctx, countQuery, whereParams...)
		if err := row.Scan(&totalCount); err != nil {
			log.Printf("获取kv_7表总记录数失败: %v", err)
			totalCount = 0 // 失败时使用0作为默认值
		}

		log.Printf("总记录数查询: %s, 参数: %v, 结果: %d", countQuery, whereParams, totalCount)
	}

	// 构建数据查询
	query := "SELECT * FROM kv_7 " + whereClause + " ORDER BY data_time DESC LIMIT ? OFFSET ?"

	// 添加分页参数
	queryParams := append(whereParams, limit, offset)

	log.Printf("执行查询: %s, 参数: %v", query, queryParams)

	// 执行查询
	rows, err := conn.QueryContext(ctx, query, queryParams...)
	if err != nil {
		return nil, 0, fmt.Errorf("查询执行失败: %w", err)
	}
	defer rows.Close()

	// 获取列信息
	columns, err := rows.Columns()
	if err != nil {
		return nil, 0, fmt.Errorf("获取列信息失败: %w", err)
	}

	// 准备结果
	var results []map[string]interface{}

	// 遍历结果集
	for rows.Next() {
		// 创建扫描目标
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, 0, fmt.Errorf("扫描行数据失败: %w", err)
		}

		// 创建行映射
		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]

			// 处理不同类型的数据
			switch v := val.(type) {
			case []byte:
				row[col] = string(v)
			default:
				row[col] = v
			}
		}

		results = append(results, row)
	}

	// 检查遍历错误
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("遍历结果集失败: %w", err)
	}

	log.Printf("查询kv_7成功，返回 %d 条记录，总数 %d", len(results), totalCount)
	return results, totalCount, nil
}

// getClickHouseConfig 从环境变量获取ClickHouse配置
func getClickHouseConfig() ClickHouseConfig {
	// 从外部数据库获取配置
	host := getEnv("CLICKHOUSE_HOST", "159.75.36.118")
	port := getEnv("CLICKHOUSE_PORT", "5501")
	database := getEnv("CLICKHOUSE_DATABASE", "test_db")
	username := getEnv("CLICKHOUSE_USER", "test_user")
	password := getEnv("CLICKHOUSE_PASSWORD", "Adefault132!")

	return ClickHouseConfig{
		Host:     host,
		Port:     port,
		Database: database,
		Username: username,
		Password: password,
	}
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// ClickHouseDB 是对ClickHouse连接的封装
type ClickHouseDB struct {
	*sql.DB
}

// GetClickHouseConn 获取ClickHouse连接
func GetClickHouseConn() *ClickHouseDB {
	conn := GetDB()
	if conn == nil {
		return nil
	}
	return &ClickHouseDB{conn}
}
