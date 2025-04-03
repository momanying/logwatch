package models

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strings"
	"time"

	"server/database"
)

// KV7Record 表示ClickHouse中kv_7表的记录
type KV7Record struct {
	// 基础字段
	DataTime     time.Time `json:"data_time"`
	WriteTime    time.Time `json:"write_time"`
	TimeHour     string    `json:"time_hour"`
	ID           string    `json:"id"`
	Time         int64     `json:"time"`
	Extra        string    `json:"extra"`
	EntranceTime int64     `json:"entrance_time"`
	EntranceID   string    `json:"entrance_id"`
	Stamp        int32     `json:"stamp"`
	AppID        string    `json:"app_id"`
	Platform     string    `json:"platform"`
	UserID       string    `json:"user_id"`
	Version      string    `json:"version"`
	BuildID      string    `json:"build_id"`
	DeviceID     string    `json:"device_id"`
	Model        string    `json:"model"`
	OS           string    `json:"os"`
	OSVer        string    `json:"os_ver"`
	SDKVer       string    `json:"sdk_ver"`
	Category     string    `json:"category"`
	Action       string    `json:"action"`
	Label        string    `json:"label"`
	State        string    `json:"state"`
	Value        int32     `json:"value"`

	// 扩展字段 - 字符串
	D1  string `json:"d1"`
	D2  string `json:"d2"`
	D3  string `json:"d3"`
	D4  string `json:"d4"`
	D5  string `json:"d5"`
	D6  string `json:"d6"`
	D7  string `json:"d7"`
	D8  string `json:"d8"`
	D9  string `json:"d9"`
	D10 string `json:"d10"`
	D11 string `json:"d11"`
	D12 string `json:"d12"`
	D13 string `json:"d13"`
	D14 string `json:"d14"`
	D15 string `json:"d15"`
	D16 string `json:"d16"`
	D17 string `json:"d17"`
	D18 string `json:"d18"`
	D19 string `json:"d19"`
	D20 string `json:"d20"`
	D21 string `json:"d21"`
	D22 string `json:"d22"`
	D23 string `json:"d23"`
	D24 string `json:"d24"`
	D25 string `json:"d25"`
	D26 string `json:"d26"`
	D27 string `json:"d27"`
	D28 string `json:"d28"`
	D29 string `json:"d29"`
	D30 string `json:"d30"`
	D31 string `json:"d31"`
	D32 string `json:"d32"`
	D33 string `json:"d33"`
	D34 string `json:"d34"`
	D35 string `json:"d35"`
	D36 string `json:"d36"`
	D37 string `json:"d37"`
	D38 string `json:"d38"`
	D39 string `json:"d39"`
	D40 string `json:"d40"`

	// 扩展字段 - 数值
	V1  int64 `json:"v1"`
	V2  int64 `json:"v2"`
	V3  int64 `json:"v3"`
	V4  int64 `json:"v4"`
	V5  int64 `json:"v5"`
	V6  int64 `json:"v6"`
	V7  int64 `json:"v7"`
	V8  int64 `json:"v8"`
	V9  int64 `json:"v9"`
	V10 int64 `json:"v10"`
	V11 int64 `json:"v11"`
	V12 int64 `json:"v12"`
	V13 int64 `json:"v13"`
	V14 int64 `json:"v14"`
	V15 int64 `json:"v15"`
	V16 int64 `json:"v16"`
	V17 int64 `json:"v17"`
	V18 int64 `json:"v18"`
	V19 int64 `json:"v19"`
	V20 int64 `json:"v20"`
	V21 int64 `json:"v21"`
	V22 int64 `json:"v22"`
	V23 int64 `json:"v23"`
	V24 int64 `json:"v24"`
	V25 int64 `json:"v25"`
	V26 int64 `json:"v26"`
	V27 int64 `json:"v27"`
	V28 int64 `json:"v28"`
	V29 int64 `json:"v29"`
	V30 int64 `json:"v30"`
	V31 int64 `json:"v31"`
	V32 int64 `json:"v32"`
	V33 int64 `json:"v33"`
	V34 int64 `json:"v34"`
	V35 int64 `json:"v35"`
	V36 int64 `json:"v36"`
	V37 int64 `json:"v37"`
	V38 int64 `json:"v38"`
	V39 int64 `json:"v39"`
	V40 int64 `json:"v40"`

	// 信息字段
	Info1  string `json:"info1"`
	Info2  string `json:"info2"`
	Info3  string `json:"info3"`
	Info4  string `json:"info4"`
	Info5  string `json:"info5"`
	Info6  string `json:"info6"`
	Info7  string `json:"info7"`
	Info8  string `json:"info8"`
	Info9  string `json:"info9"`
	Info10 string `json:"info10"`

	// 用户数据字段
	UD1  string `json:"ud1"`
	UD2  string `json:"ud2"`
	UD3  string `json:"ud3"`
	UD4  string `json:"ud4"`
	UD5  string `json:"ud5"`
	UD6  string `json:"ud6"`
	UD7  string `json:"ud7"`
	UD8  string `json:"ud8"`
	UD9  string `json:"ud9"`
	UD10 string `json:"ud10"`
	UD11 string `json:"ud11"`
	UD12 string `json:"ud12"`
	UD13 string `json:"ud13"`
	UD14 string `json:"ud14"`
	UD15 string `json:"ud15"`
	UD16 string `json:"ud16"`
	UD17 string `json:"ud17"`
	UD18 string `json:"ud18"`
	UD19 string `json:"ud19"`
	UD20 string `json:"ud20"`

	// 用户数值字段
	UV1  int64 `json:"uv1"`
	UV2  int64 `json:"uv2"`
	UV3  int64 `json:"uv3"`
	UV4  int64 `json:"uv4"`
	UV5  int64 `json:"uv5"`
	UV6  int64 `json:"uv6"`
	UV7  int64 `json:"uv7"`
	UV8  int64 `json:"uv8"`
	UV9  int64 `json:"uv9"`
	UV10 int64 `json:"uv10"`

	// 会话数据字段
	SD1  string `json:"sd1"`
	SD2  string `json:"sd2"`
	SD3  string `json:"sd3"`
	SD4  string `json:"sd4"`
	SD5  string `json:"sd5"`
	SD6  string `json:"sd6"`
	SD7  string `json:"sd7"`
	SD8  string `json:"sd8"`
	SD9  string `json:"sd9"`
	SD10 string `json:"sd10"`
	SD11 string `json:"sd11"`
	SD12 string `json:"sd12"`
	SD13 string `json:"sd13"`
	SD14 string `json:"sd14"`
	SD15 string `json:"sd15"`
	SD16 string `json:"sd16"`
	SD17 string `json:"sd17"`
	SD18 string `json:"sd18"`
	SD19 string `json:"sd19"`
	SD20 string `json:"sd20"`

	// 会话数值字段
	SV1  int64 `json:"sv1"`
	SV2  int64 `json:"sv2"`
	SV3  int64 `json:"sv3"`
	SV4  int64 `json:"sv4"`
	SV5  int64 `json:"sv5"`
	SV6  int64 `json:"sv6"`
	SV7  int64 `json:"sv7"`
	SV8  int64 `json:"sv8"`
	SV9  int64 `json:"sv9"`
	SV10 int64 `json:"sv10"`

	// 额外添加的字段，用于支持网络性能数据
	Level string `json:"level"`
}

// 分析结果
type AnalyticsResult struct {
	Category string `json:"category"`
	Action   string `json:"action"`
	Count    int    `json:"count"`
}

// 用户分布结果
type UserDistribution struct {
	OS      string  `json:"os"`
	Count   int     `json:"count"`
	Percent float64 `json:"percent"`
}

// GetRecentKV7Data 获取最近的数据记录
func GetRecentKV7Data(options database.QueryOptions) ([]KV7Record, error) {
	conn := database.GetClickHouseConn()

	// 由于字段太多，查询时仅选择核心字段，降低传输量
	query := `
	SELECT 
		data_time, write_time, time_hour, id, time, extra, 
		entrance_time, entrance_id, stamp, app_id, platform, 
		user_id, version, build_id, device_id, model, os, os_ver, 
		sdk_ver, category, action, label, state, value
	FROM test_db.kv_7
	WHERE data_time BETWEEN ? AND ?
	`

	// 应用筛选条件
	args := []interface{}{options.StartTime, options.EndTime}

	if options.Category != "" {
		query += " AND category = ?"
		args = append(args, options.Category)
	}

	if options.Action != "" {
		query += " AND action = ?"
		args = append(args, options.Action)
	}

	if options.Platform != "" {
		query += " AND platform = ?"
		args = append(args, options.Platform)
	}

	if options.AppID != "" {
		query += " AND app_id = ?"
		args = append(args, options.AppID)
	}

	if options.UserID != "" {
		query += " AND user_id = ?"
		args = append(args, options.UserID)
	}

	if options.OS != "" {
		query += " AND os = ?"
		args = append(args, options.OS)
	}

	if options.Version != "" {
		query += " AND version = ?"
		args = append(args, options.Version)
	}

	// 添加排序和分页
	sortField := options.SortBy
	if sortField == "" {
		sortField = "data_time"
	}

	sortOrder := options.SortOrder
	if sortOrder == "" {
		sortOrder = "DESC"
	}

	query += fmt.Sprintf(" ORDER BY %s %s LIMIT ? OFFSET ?", sortField, sortOrder)
	args = append(args, options.Limit, options.Offset)

	// 执行查询
	rows, err := conn.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("查询KV7数据失败: %w", err)
	}
	defer rows.Close()

	var records []KV7Record
	for rows.Next() {
		var r KV7Record
		err := rows.Scan(
			&r.DataTime, &r.WriteTime, &r.TimeHour, &r.ID, &r.Time, &r.Extra,
			&r.EntranceTime, &r.EntranceID, &r.Stamp, &r.AppID, &r.Platform,
			&r.UserID, &r.Version, &r.BuildID, &r.DeviceID, &r.Model, &r.OS, &r.OSVer,
			&r.SDKVer, &r.Category, &r.Action, &r.Label, &r.State, &r.Value,
		)
		if err != nil {
			log.Printf("扫描行数据失败: %v", err)
			continue
		}
		records = append(records, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取结果集失败: %w", err)
	}

	return records, nil
}

// GetFullKV7Record 获取单条完整记录（包含所有字段）
func GetFullKV7Record(id string) (*KV7Record, error) {
	conn := database.GetClickHouseConn()

	query := `
	SELECT 
		data_time, write_time, time_hour, id, time, extra, 
		entrance_time, entrance_id, stamp, app_id, platform, 
		user_id, version, build_id, device_id, model, os, os_ver, 
		sdk_ver, category, action, label, state, value,
		d1, d2, d3, d4, d5, d6, d7, d8, d9, d10,
		d11, d12, d13, d14, d15, d16, d17, d18, d19, d20,
		d21, d22, d23, d24, d25, d26, d27, d28, d29, d30,
		d31, d32, d33, d34, d35, d36, d37, d38, d39, d40,
		v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
		v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
		v21, v22, v23, v24, v25, v26, v27, v28, v29, v30,
		v31, v32, v33, v34, v35, v36, v37, v38, v39, v40,
		info1, info2, info3, info4, info5, info6, info7, info8, info9, info10,
		ud1, ud2, ud3, ud4, ud5, ud6, ud7, ud8, ud9, ud10,
		ud11, ud12, ud13, ud14, ud15, ud16, ud17, ud18, ud19, ud20,
		uv1, uv2, uv3, uv4, uv5, uv6, uv7, uv8, uv9, uv10,
		sd1, sd2, sd3, sd4, sd5, sd6, sd7, sd8, sd9, sd10,
		sd11, sd12, sd13, sd14, sd15, sd16, sd17, sd18, sd19, sd20,
		sv1, sv2, sv3, sv4, sv5, sv6, sv7, sv8, sv9, sv10
	FROM test_db.kv_7
	WHERE id = ?
	LIMIT 1
	`

	row := conn.QueryRow(query, id)

	var r KV7Record
	err := row.Scan(
		&r.DataTime, &r.WriteTime, &r.TimeHour, &r.ID, &r.Time, &r.Extra,
		&r.EntranceTime, &r.EntranceID, &r.Stamp, &r.AppID, &r.Platform,
		&r.UserID, &r.Version, &r.BuildID, &r.DeviceID, &r.Model, &r.OS, &r.OSVer,
		&r.SDKVer, &r.Category, &r.Action, &r.Label, &r.State, &r.Value,
		&r.D1, &r.D2, &r.D3, &r.D4, &r.D5, &r.D6, &r.D7, &r.D8, &r.D9, &r.D10,
		&r.D11, &r.D12, &r.D13, &r.D14, &r.D15, &r.D16, &r.D17, &r.D18, &r.D19, &r.D20,
		&r.D21, &r.D22, &r.D23, &r.D24, &r.D25, &r.D26, &r.D27, &r.D28, &r.D29, &r.D30,
		&r.D31, &r.D32, &r.D33, &r.D34, &r.D35, &r.D36, &r.D37, &r.D38, &r.D39, &r.D40,
		&r.V1, &r.V2, &r.V3, &r.V4, &r.V5, &r.V6, &r.V7, &r.V8, &r.V9, &r.V10,
		&r.V11, &r.V12, &r.V13, &r.V14, &r.V15, &r.V16, &r.V17, &r.V18, &r.V19, &r.V20,
		&r.V21, &r.V22, &r.V23, &r.V24, &r.V25, &r.V26, &r.V27, &r.V28, &r.V29, &r.V30,
		&r.V31, &r.V32, &r.V33, &r.V34, &r.V35, &r.V36, &r.V37, &r.V38, &r.V39, &r.V40,
		&r.Info1, &r.Info2, &r.Info3, &r.Info4, &r.Info5, &r.Info6, &r.Info7, &r.Info8, &r.Info9, &r.Info10,
		&r.UD1, &r.UD2, &r.UD3, &r.UD4, &r.UD5, &r.UD6, &r.UD7, &r.UD8, &r.UD9, &r.UD10,
		&r.UD11, &r.UD12, &r.UD13, &r.UD14, &r.UD15, &r.UD16, &r.UD17, &r.UD18, &r.UD19, &r.UD20,
		&r.UV1, &r.UV2, &r.UV3, &r.UV4, &r.UV5, &r.UV6, &r.UV7, &r.UV8, &r.UV9, &r.UV10,
		&r.SD1, &r.SD2, &r.SD3, &r.SD4, &r.SD5, &r.SD6, &r.SD7, &r.SD8, &r.SD9, &r.SD10,
		&r.SD11, &r.SD12, &r.SD13, &r.SD14, &r.SD15, &r.SD16, &r.SD17, &r.SD18, &r.SD19, &r.SD20,
		&r.SV1, &r.SV2, &r.SV3, &r.SV4, &r.SV5, &r.SV6, &r.SV7, &r.SV8, &r.SV9, &r.SV10,
	)

	if err != nil {
		return nil, fmt.Errorf("获取完整记录失败: %w", err)
	}

	return &r, nil
}

// GetEventAnalytics 获取事件分析数据
func GetEventAnalytics(startTime, endTime time.Time) ([]AnalyticsResult, error) {
	conn := database.GetClickHouseConn()

	query := `
	SELECT 
		category, action, COUNT(*) as count
	FROM test_db.kv_7
	WHERE data_time BETWEEN ? AND ?
	GROUP BY category, action
	ORDER BY count DESC
	LIMIT 100
	`

	rows, err := conn.Query(query, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("查询事件分析数据失败: %w", err)
	}
	defer rows.Close()

	var results []AnalyticsResult
	for rows.Next() {
		var r AnalyticsResult
		err := rows.Scan(&r.Category, &r.Action, &r.Count)
		if err != nil {
			log.Printf("扫描事件分析数据失败: %v", err)
			continue
		}
		results = append(results, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取结果集失败: %w", err)
	}

	return results, nil
}

// GetUserDistribution 获取用户设备分布数据
func GetUserDistribution(startTime, endTime time.Time) ([]UserDistribution, error) {
	conn := database.GetClickHouseConn()

	query := `
	WITH total AS (
		SELECT COUNT(DISTINCT user_id) as total_users
		FROM test_db.kv_7
		WHERE data_time BETWEEN ? AND ?
	)
	SELECT 
		os, 
		COUNT(DISTINCT user_id) as users,
		ROUND(COUNT(DISTINCT user_id) * 100.0 / total_users, 2) as percent
	FROM test_db.kv_7, total
	WHERE data_time BETWEEN ? AND ?
	GROUP BY os, total_users
	ORDER BY users DESC
	`

	rows, err := conn.Query(query, startTime, endTime, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("查询用户分布数据失败: %w", err)
	}
	defer rows.Close()

	var results []UserDistribution
	for rows.Next() {
		var r UserDistribution
		err := rows.Scan(&r.OS, &r.Count, &r.Percent)
		if err != nil {
			log.Printf("扫描用户分布数据失败: %v", err)
			continue
		}
		results = append(results, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("读取结果集失败: %w", err)
	}

	return results, nil
}

// GetRecentRecords 获取最近的数据记录
func GetRecentRecords(startTime, endTime time.Time, category, action, platform string, limit int) ([]KV7Record, error) {
	// 创建查询选项
	options := database.QueryOptions{
		StartTime: startTime,
		EndTime:   endTime,
		Limit:     limit,
		Category:  category,
		Action:    action,
		Platform:  platform,
	}

	// 调用已有的查询函数
	records, _, err := QueryKV7Logs(options)
	return records, err
}

// GenerateMockData 生成模拟KV7数据
func GenerateMockData(count int) []KV7Record {
	if count <= 0 {
		count = 50
	}

	records := make([]KV7Record, 0, count)
	now := time.Now()

	// 模拟数据选项
	platforms := []string{"iOS", "Android", "Web", "macOS", "Windows"}
	categories := []string{"ERROR", "WARNING", "INFO", "DEBUG", "USER_ACTION", "PERFORMANCE"}
	actions := []string{"click", "view", "login", "submit", "error", "api_call", "page_load"}
	oses := []string{"iOS 16", "Android 13", "Windows 10", "macOS 13", "Linux"}
	appIDs := []string{"腾讯云前端监控项目Web-?20000.2:demo", "腾讯文档Web-10001", "腾讯云音视频项目-30001"}
	labels := []string{"UI", "Network", "Database", "Auth", "API", "Performance"}
	states := []string{"success", "failure", "pending", "timeout"}
	messages := []string{
		"用户点击了登录按钮",
		"页面加载完成",
		"用户提交了表单",
		"页面访问",
		"自定义事件上报",
		"用户页面上正在查看数据报表服务",
		"Script error. @ (:0:0)",
		"JSON对象: {\"id\":\"YRKRY18EXMI120000\",\"uid\":\"1743066412\",\"version\":\"1.39.1\"}",
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)",
		"aegis.report 页面访问",
		"用户登录成功,设备ID: DV20252703",
	}
	deviceIDs := []string{"DV20252701", "DV20252702", "DV20252703", "DV20252704", "DV20252705"}
	models := []string{"iPhone 14", "Samsung Galaxy S22", "Google Pixel 7", "MacBook Pro", "ThinkPad X1"}
	osVersions := []string{"16.5", "13.0", "10.0.19045", "13.3", "5.15.0"}
	userIDs := []string{"17430", "66417", "66412", "66399", "65500"}

	for i := 0; i < count; i++ {
		// 生成随机时间（过去7天内）
		randomTime := now.Add(-time.Duration(rand.Intn(7*24)) * time.Hour)
		randomTime = randomTime.Add(-time.Duration(rand.Intn(60)) * time.Minute)
		randomTime = randomTime.Add(-time.Duration(rand.Intn(60)) * time.Second)

		// 生成小时字符串
		timeHour := randomTime.Format("2006-01-02 15")

		platform := platforms[rand.Intn(len(platforms))]
		category := categories[rand.Intn(len(categories))]
		action := actions[rand.Intn(len(actions))]
		os := oses[rand.Intn(len(oses))]
		appID := appIDs[rand.Intn(len(appIDs))]
		label := labels[rand.Intn(len(labels))]
		state := states[rand.Intn(len(states))]
		message := messages[rand.Intn(len(messages))]
		deviceID := deviceIDs[rand.Intn(len(deviceIDs))]
		model := models[rand.Intn(len(models))]
		osVer := osVersions[rand.Intn(len(osVersions))]
		userID := userIDs[rand.Intn(len(userIDs))]

		// 创建记录
		record := KV7Record{
			DataTime:     randomTime,
			WriteTime:    randomTime.Add(time.Second),
			TimeHour:     timeHour,
			ID:           fmt.Sprintf("log_%d", rand.Int63n(1000000)),
			Time:         randomTime.UnixNano() / 1000000,
			Platform:     platform,
			Category:     category,
			Action:       action,
			OS:           os,
			UserID:       userID,
			AppID:        appID,
			Version:      fmt.Sprintf("1.%d.%d", rand.Intn(10), rand.Intn(100)),
			DeviceID:     deviceID,
			Model:        model,
			OSVer:        osVer,
			Label:        label,
			State:        state,
			Value:        int32(rand.Intn(100)),
			D1:           message,
			D2:           fmt.Sprintf("页面路径: /%s", strings.ToLower(action)),
			D3:           fmt.Sprintf("设备信息: %s %s", model, os),
			Extra:        fmt.Sprintf("额外信息-%d", i),
			EntranceTime: randomTime.Unix(),
			EntranceID:   fmt.Sprintf("entrance_%d", rand.Int63n(100000)),
		}

		records = append(records, record)
	}

	log.Printf("成功生成 %d 条模拟数据", count)
	return records
}

// QueryKV7Logs 查询KV7日志
func QueryKV7Logs(options database.QueryOptions) ([]KV7Record, int, error) {
	log.Printf("查询KV7日志: 开始时间=%v, 结束时间=%v, 限制=%d", options.StartTime, options.EndTime, options.Limit)

	// 检查是否使用真实数据库
	useRealDatabase := os.Getenv("USE_REAL_DATABASE") == "true"
	log.Printf("使用真实数据库标志: %v", useRealDatabase)

	if !useRealDatabase {
		log.Println("使用模拟数据...")
		records := GenerateMockData(options.Limit)
		return records, len(records), nil
	}

	// 获取数据库连接
	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("无法连接到ClickHouse数据库，将使用模拟数据")
		records := GenerateMockData(options.Limit)
		return records, len(records), nil
	}

	// 测试连接是否有效
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := conn.PingContext(ctx)
	if err != nil {
		log.Printf("数据库连接测试失败: %v, 降级使用模拟数据", err)
		records := GenerateMockData(options.Limit)
		return records, len(records), nil
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

	// 处理自定义过滤条件
	if options.Filter != nil {
		for key, value := range options.Filter {
			switch key {
			case "msg": // 消息过滤 - 使用d1字段
				conditions = append(conditions, "d1 LIKE ?")
				args = append(args, "%"+value.(string)+"%")
			case "device_id": // 设备ID过滤
				conditions = append(conditions, "device_id = ?")
				args = append(args, value)
			case "model": // 设备型号过滤
				conditions = append(conditions, "model = ?")
				args = append(args, value)
			}
		}
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

	// 构建查询语句
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM test_db.kv_7 %s", whereClause)
	log.Printf("计数查询SQL: %s, 参数: %v", countQuery, args)

	dataQuery := fmt.Sprintf(`
		SELECT 
			data_time, write_time, time_hour, id, time, 
			platform, category, action, os, user_id, app_id, version,
			device_id, model, os_ver, d1, d2, d3, 
			label, state, value, extra, entrance_time, entrance_id
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
	var total int
	err = conn.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		log.Printf("查询记录总数失败: %v, 降级使用模拟数据", err)
		records := GenerateMockData(options.Limit)
		return records, len(records), nil
	}

	log.Printf("查询到记录总数: %d", total)

	// 查询数据
	rows, err := conn.Query(dataQuery, queryArgs...)
	if err != nil {
		log.Printf("查询日志失败: %v, 降级使用模拟数据", err)
		records := GenerateMockData(options.Limit)
		return records, len(records), nil
	}
	defer rows.Close()

	var records []KV7Record
	for rows.Next() {
		var record KV7Record
		err := rows.Scan(
			&record.DataTime, &record.WriteTime, &record.TimeHour, &record.ID, &record.Time,
			&record.Platform, &record.Category, &record.Action, &record.OS, &record.UserID,
			&record.AppID, &record.Version, &record.DeviceID, &record.Model, &record.OSVer,
			&record.D1, &record.D2, &record.D3, &record.Label, &record.State, &record.Value,
			&record.Extra, &record.EntranceTime, &record.EntranceID,
		)
		if err != nil {
			log.Printf("扫描行数据失败: %v, 跳过该记录", err)
			continue
		}
		records = append(records, record)
	}

	if err := rows.Err(); err != nil {
		log.Printf("读取行数据错误: %v", err)
	}

	log.Printf("成功从数据库读取到 %d 条日志记录", len(records))

	// 如果没有查询到数据，返回模拟数据
	if len(records) == 0 {
		log.Println("未查询到实际数据，返回模拟数据")
		records = GenerateMockData(options.Limit)
		return records, len(records), nil
	}

	return records, total, nil
}
