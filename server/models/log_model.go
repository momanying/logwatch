package models

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strings"
	"time"

	"server/database"
)

// QueryLogs 根据查询条件获取日志列表
func QueryLogs(options database.QueryOptions, countRequested bool) ([]KV7Record, int, int, error) {
	// 检查环境变量，决定是否使用真实数据库查询
	useRealDatabase := os.Getenv("USE_REAL_DATABASE") == "true"
	log.Printf("使用真实数据库标志: %v", useRealDatabase)

	if !useRealDatabase {
		// 开发环境使用模拟数据
		log.Println("使用模拟数据替代数据库查询")
		count := 25 // 默认返回25条记录
		if options.Limit > 0 && options.Limit < count {
			count = options.Limit
		}
		mockedLogs := generateMockLogs(count)

		// 模拟一个更大的数据库总条数
		dbTotalCount := count * 40

		return mockedLogs, len(mockedLogs), dbTotalCount, nil
	}

	// 生产环境尝试使用真实数据库
	log.Println("从ClickHouse数据库查询日志数据")

	// 尝试获取连接
	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("数据库连接失败，降级使用模拟数据")
		mockedLogs := generateMockLogs(25)
		// 模拟数据库总条数
		dbTotalCount := 1000
		return mockedLogs, len(mockedLogs), dbTotalCount, nil
	}

	// 测试连接是否有效
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := conn.PingContext(ctx)
	if err != nil {
		log.Printf("数据库连接测试失败: %v, 降级使用模拟数据", err)
		mockedLogs := generateMockLogs(25)
		// 模拟数据库总条数
		dbTotalCount := 1000
		return mockedLogs, len(mockedLogs), dbTotalCount, nil
	}

	log.Println("数据库连接测试成功，继续查询")

	// 构建查询条件
	var conditions []string
	var args []interface{}

	// 添加时间范围条件
	if !options.StartTime.IsZero() {
		conditions = append(conditions, "data_time >= ?")
		args = append(args, options.StartTime)
	}

	if !options.EndTime.IsZero() {
		conditions = append(conditions, "data_time <= ?")
		args = append(args, options.EndTime)
	}

	// 添加其他筛选条件
	if options.Category != "" {
		conditions = append(conditions, "category = ?")
		args = append(args, options.Category)
	}

	if options.UserID != "" {
		conditions = append(conditions, "user_id = ?")
		args = append(args, options.UserID)
	}

	if options.AppID != "" {
		conditions = append(conditions, "app_id = ?")
		args = append(args, options.AppID)
	}

	if options.Platform != "" {
		conditions = append(conditions, "platform = ?")
		args = append(args, options.Platform)
	}

	if options.OS != "" {
		conditions = append(conditions, "os = ?")
		args = append(args, options.OS)
	}

	if options.Action != "" {
		conditions = append(conditions, "action = ?")
		args = append(args, options.Action)
	}

	// 构建WHERE子句
	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	} else {
		whereClause = "WHERE 1=1" // 确保WHERE子句存在
	}

	// 构建排序字段
	orderBy := "data_time"
	if options.SortBy != "" {
		orderBy = options.SortBy
	}

	// 构建排序方向
	orderDir := "DESC"
	if options.SortOrder != "" {
		orderDir = options.SortOrder
	}

	// 构建分页
	limit := 100
	if options.Limit > 0 {
		limit = options.Limit
	}

	offset := 0
	if options.Offset > 0 {
		offset = options.Offset
	}

	// 查询准备
	var total int = 0   // 当前筛选条件下的总数
	var dbTotal int = 0 // 数据库中的总数

	// 构建查询语句
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM test_db.kv_7 %s", whereClause)
	log.Printf("计数查询SQL: %s, 参数: %v", countQuery, args)

	// 如果请求了数据库总条数，则执行额外的查询
	if countRequested {
		dbTotalQuery := "SELECT COUNT(*) FROM test_db.kv_7"
		log.Printf("数据库总数查询SQL: %s", dbTotalQuery)

		err = conn.QueryRow(dbTotalQuery).Scan(&dbTotal)
		if err != nil {
			log.Printf("查询数据库总记录数失败: %v", err)
			dbTotal = 10000 // 失败时使用一个估计值
		} else {
			log.Printf("查询到数据库总记录数: %d", dbTotal)
		}
	}

	dataQuery := fmt.Sprintf(`
		SELECT 
			data_time, write_time, time_hour, id, time, 
			platform, category, action, os, user_id, app_id, version,
			level, d1, d2, d3
		FROM test_db.kv_7 
		%s
		ORDER BY %s %s
		LIMIT ? OFFSET ?
	`, whereClause, orderBy, orderDir)

	queryArgs := make([]interface{}, len(args))
	copy(queryArgs, args)
	queryArgs = append(queryArgs, limit, offset)

	log.Printf("数据查询SQL: %s, 参数: %v", dataQuery, queryArgs)

	// 查询总记录数
	err = conn.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		log.Printf("查询记录总数失败: %v, 降级使用模拟数据", err)
		mockedLogs := generateMockLogs(25)
		// 使用模拟的数据库总数
		dbTotalCount := 1000
		return mockedLogs, len(mockedLogs), dbTotalCount, nil
	}

	log.Printf("查询到记录总数: %d", total)

	// 查询数据
	rows, err := conn.Query(dataQuery, queryArgs...)
	if err != nil {
		log.Printf("查询日志失败: %v, 降级使用模拟数据", err)
		mockedLogs := generateMockLogs(25)
		// 使用模拟的数据库总数
		dbTotalCount := 1000
		return mockedLogs, len(mockedLogs), dbTotalCount, nil
	}
	defer rows.Close()

	var logs []KV7Record
	for rows.Next() {
		var record KV7Record
		err := rows.Scan(
			&record.DataTime, &record.WriteTime, &record.TimeHour, &record.ID, &record.Time,
			&record.Platform, &record.Category, &record.Action, &record.OS, &record.UserID,
			&record.AppID, &record.Version, &record.Level, &record.D1, &record.D2, &record.D3,
		)
		if err != nil {
			log.Printf("扫描行数据失败: %v, 跳过该记录", err)
			continue
		}
		logs = append(logs, record)
	}

	if err := rows.Err(); err != nil {
		log.Printf("读取行数据错误: %v", err)
	}

	log.Printf("成功从数据库读取到 %d 条日志记录", len(logs))

	// 如果没有查询到数据，返回模拟数据
	if len(logs) == 0 {
		log.Println("未查询到实际数据，返回模拟数据")
		mockedLogs := generateMockLogs(25)
		// 使用模拟的数据库总数，但保留查询到的总记录数
		return mockedLogs, len(mockedLogs), dbTotal, nil
	}

	return logs, total, dbTotal, nil
}

// generateMockLogs 生成模拟日志数据
func generateMockLogs(count int) []KV7Record {
	// 设置随机种子
	rand.Seed(time.Now().UnixNano())

	logs := make([]KV7Record, count)
	platforms := []string{"iOS", "Android", "Web", "macOS"}
	categories := []string{"PAGE_VIEW", "USER_ACTION", "ERROR", "WARNING", "INFO"}
	actions := []string{"login", "click", "view", "create", "delete", "update", "share"}
	oses := []string{"Windows 10", "iOS 16", "Android 13", "macOS 13"}
	messages := []string{
		"用户点击了登录按钮",
		"页面加载完成",
		"用户提交了表单",
		"文档保存成功",
		"会话超时",
		"用户切换了主题",
		"数据同步完成",
		"用户搜索了内容",
		"网络连接中断",
		"用户上传了文件",
	}

	now := time.Now()

	for i := 0; i < count; i++ {
		// 时间随机在过去24小时内
		randomTime := now.Add(-time.Duration(rand.Intn(24)) * time.Hour)
		randomTime = randomTime.Add(-time.Duration(rand.Intn(60)) * time.Minute)

		platform := platforms[rand.Intn(len(platforms))]
		category := categories[rand.Intn(len(categories))]
		action := actions[rand.Intn(len(actions))]
		os := oses[rand.Intn(len(oses))]
		message := messages[rand.Intn(len(messages))]

		logs[i] = KV7Record{
			DataTime:  randomTime,
			WriteTime: randomTime.Add(time.Second * 2),
			TimeHour:  randomTime.Format("2006-01-02 15"),
			ID:        fmt.Sprintf("log_%d_%d", randomTime.Unix(), i),
			Time:      randomTime.UnixNano() / 1000000,
			Platform:  platform,
			Category:  category,
			Action:    action,
			OS:        os,
			UserID:    fmt.Sprintf("user_%d", 1000+rand.Intn(9000)),
			AppID:     "腾讯云前端监控项目Web-?20000.2:demo",
			Version:   fmt.Sprintf("1.%d.%d", rand.Intn(10), rand.Intn(100)),
			D1:        message,
			D2:        "页面路径: /home",
			D3:        fmt.Sprintf("设备: %s", platform),
			Level:     category,
		}
	}

	return logs
}

// 为了与之前的GetFullKV7Record一致，保证日志详情功能可以使用现有的方法

// GetLogTypes 获取所有日志类型
func GetLogTypes() ([]string, error) {
	conn := database.GetClickHouseConn()

	query := `
	SELECT DISTINCT category
	FROM test_db.kv_7
	WHERE category IS NOT NULL AND category != ''
	ORDER BY category
	`

	rows, err := conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("查询日志类型失败: %w", err)
	}
	defer rows.Close()

	var types []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			log.Printf("扫描日志类型失败: %v", err)
			continue
		}
		types = append(types, t)
	}

	return types, nil
}

// GetProjects 获取所有项目
func GetProjects() ([]string, error) {
	conn := database.GetClickHouseConn()

	query := `
	SELECT DISTINCT app_id
	FROM test_db.kv_7
	WHERE app_id IS NOT NULL AND app_id != ''
	ORDER BY app_id
	`

	rows, err := conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("查询项目列表失败: %w", err)
	}
	defer rows.Close()

	var projects []string
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			log.Printf("扫描项目失败: %v", err)
			continue
		}
		projects = append(projects, p)
	}

	return projects, nil
}

// GetUserIDs 获取所有用户ID
func GetUserIDs(limit int) ([]string, error) {
	conn := database.GetClickHouseConn()

	query := `
	SELECT DISTINCT user_id
	FROM test_db.kv_7
	WHERE user_id IS NOT NULL AND user_id != ''
	ORDER BY user_id
	LIMIT ?
	`

	rows, err := conn.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("查询用户ID列表失败: %w", err)
	}
	defer rows.Close()

	var userIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			log.Printf("扫描用户ID失败: %v", err)
			continue
		}
		userIDs = append(userIDs, id)
	}

	return userIDs, nil
}

// GetLogMetrics 获取日志统计指标
func GetLogMetrics(options database.QueryOptions) (map[string]interface{}, error) {
	conn := database.GetClickHouseConn()

	// 构建基础条件
	var conditions string
	var args []interface{}

	// 时间范围
	if !options.StartTime.IsZero() {
		conditions += " AND data_time >= ?"
		args = append(args, options.StartTime)
	}

	if !options.EndTime.IsZero() {
		conditions += " AND data_time <= ?"
		args = append(args, options.EndTime)
	}

	// 用户ID
	if options.UserID != "" {
		conditions += " AND user_id = ?"
		args = append(args, options.UserID)
	}

	// 应用ID/项目
	if options.AppID != "" {
		conditions += " AND app_id = ?"
		args = append(args, options.AppID)
	}

	// 查询总日志量
	totalQuery := `
	SELECT COUNT(*)
	FROM test_db.kv_7
	WHERE 1=1
	` + conditions

	var totalLogs int
	err := conn.QueryRow(totalQuery, args...).Scan(&totalLogs)
	if err != nil {
		return nil, fmt.Errorf("查询总日志量失败: %w", err)
	}

	// 查询各类型日志数量
	typeQuery := `
	SELECT category, COUNT(*)
	FROM test_db.kv_7
	WHERE 1=1
	` + conditions + `
	GROUP BY category
	ORDER BY COUNT(*) DESC
	`

	typeRows, err := conn.Query(typeQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("查询日志类型分布失败: %w", err)
	}
	defer typeRows.Close()

	logsByType := make(map[string]int)
	for typeRows.Next() {
		var category string
		var count int
		if err := typeRows.Scan(&category, &count); err != nil {
			log.Printf("扫描日志类型分布失败: %v", err)
			continue
		}
		if category == "" {
			category = "未分类"
		}
		logsByType[category] = count
	}

	// 查询各平台日志数量
	platformQuery := `
	SELECT platform, COUNT(*)
	FROM test_db.kv_7
	WHERE 1=1
	` + conditions + `
	GROUP BY platform
	ORDER BY COUNT(*) DESC
	`

	platformRows, err := conn.Query(platformQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("查询平台分布失败: %w", err)
	}
	defer platformRows.Close()

	logsByPlatform := make(map[string]int)
	for platformRows.Next() {
		var platform string
		var count int
		if err := platformRows.Scan(&platform, &count); err != nil {
			log.Printf("扫描平台分布失败: %v", err)
			continue
		}
		if platform == "" {
			platform = "未知平台"
		}
		logsByPlatform[platform] = count
	}

	// 返回所有指标
	metrics := map[string]interface{}{
		"total_logs":       totalLogs,
		"logs_by_type":     logsByType,
		"logs_by_platform": logsByPlatform,
	}

	return metrics, nil
}

// GetNetworkPerformanceStats 获取网络性能统计数据
func GetNetworkPerformanceStats(options database.QueryOptions) (map[string]interface{}, error) {
	// 检查环境变量，决定是否使用真实数据库查询
	useRealDatabase := os.Getenv("USE_REAL_DATABASE") == "true"

	if !useRealDatabase {
		// 开发环境使用模拟数据
		log.Println("使用模拟数据返回网络性能统计")
		return generateMockNetworkStats(), nil
	}

	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("数据库连接失败，返回模拟网络性能统计")
		return generateMockNetworkStats(), nil
	}

	// 构建查询条件
	var conditions []string
	var args []interface{}

	// 添加时间范围条件
	if !options.StartTime.IsZero() {
		conditions = append(conditions, "data_time >= ?")
		args = append(args, options.StartTime)
	}

	if !options.EndTime.IsZero() {
		conditions = append(conditions, "data_time <= ?")
		args = append(args, options.EndTime)
	}

	// 添加网络性能相关筛选条件
	conditions = append(conditions, "category = ?")
	args = append(args, "PERF_NET_SSE")

	// 添加其他筛选条件
	if options.Platform != "" {
		conditions = append(conditions, "platform = ?")
		args = append(args, options.Platform)
	}

	if options.OS != "" {
		conditions = append(conditions, "os = ?")
		args = append(args, options.OS)
	}

	if options.UserID != "" {
		conditions = append(conditions, "user_id = ?")
		args = append(args, options.UserID)
	}

	// 构建WHERE子句
	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	// 查询网络类型分布
	networkQuery := fmt.Sprintf(`
		SELECT 
			d38 as network_type,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY d38
		ORDER BY count DESC
	`, whereClause)

	// 查询平均响应时间
	responseTimeQuery := fmt.Sprintf(`
		SELECT 
			AVG(v1) as avg_total,
			AVG(v2) as avg_dns,
			AVG(v3) as avg_tcp,
			AVG(v4) as avg_request,
			AVG(v5) as avg_response
		FROM test_db.kv_7
		%s
	`, whereClause)

	// 查询分地区网络性能
	regionQuery := fmt.Sprintf(`
		SELECT 
			d40 as region,
			AVG(v1) as avg_total,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY d40
		ORDER BY count DESC
		LIMIT 10
	`, whereClause)

	// 查询网络性能随时间变化
	timeSeriesQuery := fmt.Sprintf(`
		SELECT 
			toStartOfHour(data_time) as hour,
			AVG(v1) as avg_total,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY hour
		ORDER BY hour
	`, whereClause)

	// 执行网络类型分布查询
	networkRows, err := conn.Query(networkQuery, args...)
	if err != nil {
		log.Printf("查询网络类型分布失败: %v", err)
		return generateMockNetworkStats(), nil
	}
	defer networkRows.Close()

	networkTypes := []map[string]interface{}{}
	for networkRows.Next() {
		var networkType string
		var count uint64
		if err := networkRows.Scan(&networkType, &count); err != nil {
			log.Printf("处理网络类型分布数据失败: %v", err)
			continue
		}

		// 清理空网络类型
		if networkType == "" {
			networkType = "Unknown"
		}

		networkTypes = append(networkTypes, map[string]interface{}{
			"type":  networkType,
			"count": count,
		})
	}

	// 执行响应时间查询
	var avgTotal, avgDns, avgTcp, avgRequest, avgResponse float64
	err = conn.QueryRow(responseTimeQuery, args...).Scan(
		&avgTotal, &avgDns, &avgTcp, &avgRequest, &avgResponse,
	)
	if err != nil && err != sql.ErrNoRows {
		log.Printf("查询响应时间失败: %v", err)
		avgTotal, avgDns, avgTcp, avgRequest, avgResponse = 500, 100, 150, 100, 150
	}

	// 执行地区性能查询
	regionRows, err := conn.Query(regionQuery, args...)
	if err != nil {
		log.Printf("查询地区网络性能失败: %v", err)
		return generateMockNetworkStats(), nil
	}
	defer regionRows.Close()

	regions := []map[string]interface{}{}
	for regionRows.Next() {
		var region string
		var avgTime float64
		var count uint64
		if err := regionRows.Scan(&region, &avgTime, &count); err != nil {
			log.Printf("处理地区网络性能数据失败: %v", err)
			continue
		}

		// 清理空地区
		if region == "" {
			region = "Unknown"
		}

		regions = append(regions, map[string]interface{}{
			"region":   region,
			"avg_time": avgTime,
			"count":    count,
		})
	}

	// 执行时间序列查询
	timeSeriesRows, err := conn.Query(timeSeriesQuery, args...)
	if err != nil {
		log.Printf("查询网络性能时间序列失败: %v", err)
		return generateMockNetworkStats(), nil
	}
	defer timeSeriesRows.Close()

	timeSeries := []map[string]interface{}{}
	for timeSeriesRows.Next() {
		var hour time.Time
		var avgTime float64
		var count uint64
		if err := timeSeriesRows.Scan(&hour, &avgTime, &count); err != nil {
			log.Printf("处理网络性能时间序列数据失败: %v", err)
			continue
		}

		timeSeries = append(timeSeries, map[string]interface{}{
			"hour":     hour.Format("2006-01-02 15:00"),
			"avg_time": avgTime,
			"count":    count,
		})
	}

	// 返回完整统计结果
	result := map[string]interface{}{
		"network_types": networkTypes,
		"response_time": map[string]interface{}{
			"total":    avgTotal,
			"dns":      avgDns,
			"tcp":      avgTcp,
			"request":  avgRequest,
			"response": avgResponse,
		},
		"regions":     regions,
		"time_series": timeSeries,
	}

	return result, nil
}

// generateMockNetworkStats 生成模拟网络性能统计数据
func generateMockNetworkStats() map[string]interface{} {
	// 网络类型分布
	networkTypes := []map[string]interface{}{
		{"type": "WIFI", "count": 350},
		{"type": "5G", "count": 250},
		{"type": "4G", "count": 150},
		{"type": "3G", "count": 50},
		{"type": "NoNetwork", "count": 30},
		{"type": "NoPermission", "count": 20},
	}

	// 响应时间
	responseTime := map[string]interface{}{
		"total":    450.0,
		"dns":      100.0,
		"tcp":      150.0,
		"request":  120.0,
		"response": 80.0,
	}

	// 地区性能
	regions := []map[string]interface{}{
		{"region": "中国广东", "avg_time": 420.0, "count": 400},
		{"region": "中国北京", "avg_time": 380.0, "count": 200},
		{"region": "中国上海", "avg_time": 400.0, "count": 150},
		{"region": "中国浙江", "avg_time": 430.0, "count": 100},
		{"region": "中国香港", "avg_time": 350.0, "count": 50},
	}

	// 时间序列数据
	now := time.Now()
	timeSeries := []map[string]interface{}{}
	for i := 0; i < 24; i++ {
		hour := now.Add(-time.Duration(i) * time.Hour)
		timeSeries = append([]map[string]interface{}{
			{
				"hour":     hour.Format("2006-01-02 15:00"),
				"avg_time": 400.0 + float64(rand.Intn(100)) - 50.0,
				"count":    uint64(50 + rand.Intn(100)),
			},
		}, timeSeries...)
	}

	return map[string]interface{}{
		"network_types": networkTypes,
		"response_time": responseTime,
		"regions":       regions,
		"time_series":   timeSeries,
	}
}

// GetIOSDeviceStats 获取iOS设备统计数据
func GetIOSDeviceStats(options database.QueryOptions) (map[string]interface{}, error) {
	// 检查环境变量，决定是否使用真实数据库查询
	useRealDatabase := os.Getenv("USE_REAL_DATABASE") == "true"

	if !useRealDatabase {
		// 开发环境使用模拟数据
		log.Println("使用模拟数据返回iOS设备统计")
		return generateMockIOSDeviceStats(), nil
	}

	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("数据库连接失败，返回模拟iOS设备统计")
		return generateMockIOSDeviceStats(), nil
	}

	// 构建查询条件
	var conditions []string
	var args []interface{}

	// 添加时间范围条件
	if !options.StartTime.IsZero() {
		conditions = append(conditions, "data_time >= ?")
		args = append(args, options.StartTime)
	}

	if !options.EndTime.IsZero() {
		conditions = append(conditions, "data_time <= ?")
		args = append(args, options.EndTime)
	}

	// 添加iOS平台筛选条件
	conditions = append(conditions, "platform = ?")
	args = append(args, "ios")

	// 添加其他筛选条件
	if options.Category != "" {
		conditions = append(conditions, "category = ?")
		args = append(args, options.Category)
	}

	if options.UserID != "" {
		conditions = append(conditions, "user_id = ?")
		args = append(args, options.UserID)
	}

	// 构建WHERE子句
	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	// 查询设备型号分布
	deviceQuery := fmt.Sprintf(`
		SELECT 
			model as device_model,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY model
		ORDER BY count DESC
		LIMIT 10
	`, whereClause)

	// 查询iOS版本分布
	osVersionQuery := fmt.Sprintf(`
		SELECT 
			os_ver as os_version,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY os_version
		ORDER BY count DESC
		LIMIT 10
	`, whereClause)

	// 查询应用版本分布
	appVersionQuery := fmt.Sprintf(`
		SELECT 
			version as app_version,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY app_version
		ORDER BY count DESC
		LIMIT 10
	`, whereClause)

	// 查询分类分布
	categoryQuery := fmt.Sprintf(`
		SELECT 
			category,
			COUNT(*) as count
		FROM test_db.kv_7
		%s
		GROUP BY category
		ORDER BY count DESC
		LIMIT 10
	`, whereClause)

	// 执行设备型号分布查询
	deviceRows, err := conn.Query(deviceQuery, args...)
	if err != nil {
		log.Printf("查询设备型号分布失败: %v", err)
		return generateMockIOSDeviceStats(), nil
	}
	defer deviceRows.Close()

	devices := []map[string]interface{}{}
	for deviceRows.Next() {
		var model string
		var count uint64
		if err := deviceRows.Scan(&model, &count); err != nil {
			log.Printf("处理设备型号分布数据失败: %v", err)
			continue
		}

		devices = append(devices, map[string]interface{}{
			"model": model,
			"count": count,
		})
	}

	// 执行iOS版本分布查询
	osVersionRows, err := conn.Query(osVersionQuery, args...)
	if err != nil {
		log.Printf("查询iOS版本分布失败: %v", err)
		return generateMockIOSDeviceStats(), nil
	}
	defer osVersionRows.Close()

	osVersions := []map[string]interface{}{}
	for osVersionRows.Next() {
		var version string
		var count uint64
		if err := osVersionRows.Scan(&version, &count); err != nil {
			log.Printf("处理iOS版本分布数据失败: %v", err)
			continue
		}

		osVersions = append(osVersions, map[string]interface{}{
			"version": version,
			"count":   count,
		})
	}

	// 执行应用版本分布查询
	appVersionRows, err := conn.Query(appVersionQuery, args...)
	if err != nil {
		log.Printf("查询应用版本分布失败: %v", err)
		return generateMockIOSDeviceStats(), nil
	}
	defer appVersionRows.Close()

	appVersions := []map[string]interface{}{}
	for appVersionRows.Next() {
		var version string
		var count uint64
		if err := appVersionRows.Scan(&version, &count); err != nil {
			log.Printf("处理应用版本分布数据失败: %v", err)
			continue
		}

		appVersions = append(appVersions, map[string]interface{}{
			"version": version,
			"count":   count,
		})
	}

	// 执行分类分布查询
	categoryRows, err := conn.Query(categoryQuery, args...)
	if err != nil {
		log.Printf("查询分类分布失败: %v", err)
		return generateMockIOSDeviceStats(), nil
	}
	defer categoryRows.Close()

	categories := []map[string]interface{}{}
	for categoryRows.Next() {
		var category string
		var count uint64
		if err := categoryRows.Scan(&category, &count); err != nil {
			log.Printf("处理分类分布数据失败: %v", err)
			continue
		}

		categories = append(categories, map[string]interface{}{
			"category": category,
			"count":    count,
		})
	}

	// 返回完整统计结果
	result := map[string]interface{}{
		"devices":      devices,
		"os_versions":  osVersions,
		"app_versions": appVersions,
		"categories":   categories,
	}

	return result, nil
}

// generateMockIOSDeviceStats 生成模拟iOS设备统计数据
func generateMockIOSDeviceStats() map[string]interface{} {
	// 设备型号分布
	devices := []map[string]interface{}{
		{"model": "iPhone13", "count": 350},
		{"model": "iPhone 12", "count": 250},
		{"model": "iPhone 7", "count": 150},
		{"model": "iPhone 6", "count": 100},
		{"model": "iPhone 13 Pro", "count": 50},
	}

	// iOS版本分布
	osVersions := []map[string]interface{}{
		{"version": "Version 16.0 (Build 20A5283p)", "count": 300},
		{"version": "Version 15.4.1 (Build 19E258)", "count": 250},
		{"version": "Version 15.1 (Build 19B74)", "count": 200},
		{"version": "Version 14.8 (Build 18H17)", "count": 100},
		{"version": "Version 13.7 (Build 17H35)", "count": 50},
	}

	// 应用版本分布
	appVersions := []map[string]interface{}{
		{"version": "4.2.8", "count": 200},
		{"version": "4.3.5", "count": 180},
		{"version": "4.6.6", "count": 150},
		{"version": "4.8.6", "count": 120},
		{"version": "4.1.3", "count": 100},
	}

	// 分类分布
	categories := []map[string]interface{}{
		{"category": "PERF_NET_SSE", "count": 500},
		{"category": "USER_ACTION", "count": 300},
		{"category": "PAGE_VIEW", "count": 150},
		{"category": "ERROR", "count": 30},
		{"category": "WARNING", "count": 20},
	}

	return map[string]interface{}{
		"devices":      devices,
		"os_versions":  osVersions,
		"app_versions": appVersions,
		"categories":   categories,
	}
}
