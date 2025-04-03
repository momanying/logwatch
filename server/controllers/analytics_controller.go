package controllers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"server/database"
	"server/models"
	"server/utils"
)

// AnalyticsController 处理数据分析相关请求
type AnalyticsController struct{}

// NewAnalyticsController 创建一个新的分析控制器
func NewAnalyticsController() *AnalyticsController {
	return &AnalyticsController{}
}

// GetRecentData 获取最近的数据记录
func (c *AnalyticsController) GetRecentData(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 检查是否已授权
	_, err := utils.GetUserFromRequest(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "未授权")
		return
	}

	// 解析请求参数
	startTimeStr := r.URL.Query().Get("start_time")
	endTimeStr := r.URL.Query().Get("end_time")
	category := r.URL.Query().Get("category")
	action := r.URL.Query().Get("action")
	platform := r.URL.Query().Get("platform")
	limitStr := r.URL.Query().Get("limit")

	// 处理时间参数
	var startTime, endTime time.Time
	if startTimeStr != "" {
		var err error
		startTime, err = time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "开始时间格式无效")
			return
		}
	}

	if endTimeStr != "" {
		var err error
		endTime, err = time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "结束时间格式无效")
			return
		}
	}

	// 处理限制参数
	limit := 100
	if limitStr != "" {
		var err error
		limit, err = utils.ParseInt(limitStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "限制参数无效")
			return
		}
	}

	// 从ClickHouse获取数据
	records, err := models.GetRecentRecords(startTime, endTime, category, action, platform, limit)
	if err != nil {
		log.Printf("获取ClickHouse数据失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "获取数据失败")
		return
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    records,
	})
}

// GetRecordDetail 获取单条记录的详细信息
func (c *AnalyticsController) GetRecordDetail(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 检查是否已授权
	_, err := utils.GetUserFromRequest(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "未授权")
		return
	}

	// 获取记录ID
	recordID := r.URL.Query().Get("id")
	if recordID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "记录ID不能为空")
		return
	}

	// 从ClickHouse获取完整记录
	record, err := models.GetFullKV7Record(recordID)
	if err != nil {
		log.Printf("获取记录详情失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "获取记录详情失败")
		return
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    record,
	})
}

// GetEventAnalytics 获取事件分析数据
func (c *AnalyticsController) GetEventAnalytics(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 检查是否已授权
	_, err := utils.GetUserFromRequest(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "未授权")
		return
	}

	// 解析请求参数
	startTimeStr := r.URL.Query().Get("start_time")
	endTimeStr := r.URL.Query().Get("end_time")

	// 处理时间参数
	var startTime, endTime time.Time
	if startTimeStr != "" {
		var err error
		startTime, err = time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "开始时间格式无效")
			return
		}
	}

	if endTimeStr != "" {
		var err error
		endTime, err = time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "结束时间格式无效")
			return
		}
	}

	// 从ClickHouse获取数据
	results, err := models.GetEventAnalytics(startTime, endTime)
	if err != nil {
		log.Printf("获取事件分析数据失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "获取事件分析数据失败")
		return
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    results,
	})
}

// GetUserDistribution 获取用户分布数据
func (c *AnalyticsController) GetUserDistribution(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 检查是否已授权
	_, err := utils.GetUserFromRequest(r)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "未授权")
		return
	}

	// 解析请求参数
	startTimeStr := r.URL.Query().Get("start_time")
	endTimeStr := r.URL.Query().Get("end_time")

	// 处理时间参数
	var startTime, endTime time.Time
	if startTimeStr != "" {
		var err error
		startTime, err = time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "开始时间格式无效")
			return
		}
	}

	if endTimeStr != "" {
		var err error
		endTime, err = time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "结束时间格式无效")
			return
		}
	}

	// 从ClickHouse获取数据
	results, err := models.GetUserDistribution(startTime, endTime)
	if err != nil {
		log.Printf("获取用户分布数据失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "获取用户分布数据失败")
		return
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    results,
	})
}

// parseQueryParams 解析查询参数
func parseQueryParams(r *http.Request) database.QueryOptions {
	options := database.DefaultQueryOptions()

	// 解析时间范围
	startTimeStr := r.URL.Query().Get("start_time")
	if startTimeStr != "" {
		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err == nil {
			options.StartTime = startTime
		}
	}

	endTimeStr := r.URL.Query().Get("end_time")
	if endTimeStr != "" {
		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err == nil {
			options.EndTime = endTime
		}
	}

	// 解析分页参数
	limitStr := r.URL.Query().Get("limit")
	if limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err == nil && limit > 0 {
			options.Limit = limit
		}
	}

	offsetStr := r.URL.Query().Get("offset")
	if offsetStr != "" {
		offset, err := strconv.Atoi(offsetStr)
		if err == nil && offset >= 0 {
			options.Offset = offset
		}
	}

	// 解析筛选参数
	options.Category = r.URL.Query().Get("category")
	options.Action = r.URL.Query().Get("action")
	options.Platform = r.URL.Query().Get("platform")
	options.AppID = r.URL.Query().Get("app_id")
	options.UserID = r.URL.Query().Get("user_id")
	options.OS = r.URL.Query().Get("os")
	options.Version = r.URL.Query().Get("version")

	// 解析排序参数
	sortBy := r.URL.Query().Get("sort_by")
	if sortBy != "" {
		options.SortBy = sortBy
	}

	sortOrder := r.URL.Query().Get("sort_order")
	if sortOrder == "asc" || sortOrder == "desc" {
		options.SortOrder = sortOrder
	}

	return options
}

// GetNetworkPerformance 获取网络性能统计数据
func (c *AnalyticsController) GetNetworkPerformance(w http.ResponseWriter, r *http.Request) {
	// 检查请求方法
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "方法不允许")
		return
	}

	// 验证授权
	token := r.Header.Get("Authorization")
	if !utils.IsValidToken(token) {
		utils.RespondWithError(w, http.StatusUnauthorized, "未授权访问")
		return
	}

	// 解析查询参数
	queryParams := r.URL.Query()
	startTimeStr := queryParams.Get("start_time")
	endTimeStr := queryParams.Get("end_time")
	platform := queryParams.Get("platform")
	os := queryParams.Get("os")
	userID := queryParams.Get("user_id")

	// 创建查询选项
	options := database.QueryOptions{
		Platform: platform,
		OS:       os,
		UserID:   userID,
	}

	// 解析时间参数
	if startTimeStr != "" {
		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err == nil {
			options.StartTime = startTime
		}
	}

	if endTimeStr != "" {
		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err == nil {
			options.EndTime = endTime
		}
	}

	// 获取网络性能统计数据
	results, err := models.GetNetworkPerformanceStats(options)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "获取网络性能统计失败")
		return
	}

	// 返回数据
	utils.RespondWithJSON(w, http.StatusOK, results)
}

// GetIOSDeviceStats 获取iOS设备统计数据
func (c *AnalyticsController) GetIOSDeviceStats(w http.ResponseWriter, r *http.Request) {
	// 检查请求方法
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "方法不允许")
		return
	}

	// 验证授权
	token := r.Header.Get("Authorization")
	if !utils.IsValidToken(token) {
		utils.RespondWithError(w, http.StatusUnauthorized, "未授权访问")
		return
	}

	// 解析查询参数
	queryParams := r.URL.Query()
	startTimeStr := queryParams.Get("start_time")
	endTimeStr := queryParams.Get("end_time")
	category := queryParams.Get("category")
	userID := queryParams.Get("user_id")

	// 创建查询选项
	options := database.QueryOptions{
		Category: category,
		UserID:   userID,
	}

	// 解析时间参数
	if startTimeStr != "" {
		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err == nil {
			options.StartTime = startTime
		}
	}

	if endTimeStr != "" {
		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err == nil {
			options.EndTime = endTime
		}
	}

	// 获取iOS设备统计数据
	results, err := models.GetIOSDeviceStats(options)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "获取iOS设备统计失败")
		return
	}

	// 返回数据
	utils.RespondWithJSON(w, http.StatusOK, results)
}

// QueryKV7Table 查询kv_7表数据
func (c *AnalyticsController) QueryKV7Table(w http.ResponseWriter, r *http.Request) {
	// 检查请求方法
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "方法不允许")
		return
	}

	// 解析查询参数
	queryParams := r.URL.Query()
	limitStr := queryParams.Get("limit")
	offsetStr := queryParams.Get("offset")
	countStr := queryParams.Get("count")
	startTime := queryParams.Get("start_time")
	endTime := queryParams.Get("end_time")

	// 设置默认值和解析参数
	limit := 100
	offset := 0
	needCount := false

	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// 判断是否需要获取总记录数
	if countStr != "" {
		needCount = countStr == "true" || countStr == "1"
	}

	// 获取kv_7表数据
	db := database.GetClickHouseConn()
	if db == nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "数据库连接失败")
		return
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

	// 判断是否需要获取总记录数
	var totalCount int
	if needCount {
		// 构建COUNT查询
		countQuery := "SELECT COUNT(*) FROM kv_7 " + whereClause

		// 执行COUNT查询
		countRow := db.QueryRow(countQuery, whereParams...)
		if err := countRow.Scan(&totalCount); err != nil {
			log.Printf("获取kv_7表总记录数失败: %v", err)
			totalCount = 0 // 失败时使用0作为默认值
		}

		log.Printf("总记录数查询: %s, 参数: %v, 结果: %d", countQuery, whereParams, totalCount)
	}

	// 构建数据查询
	query := `
		SELECT * 
		FROM kv_7
		` + whereClause + `
		ORDER BY data_time DESC
		LIMIT ? OFFSET ?
	`

	// 添加分页参数
	finalParams := append(whereParams, limit, offset)

	log.Printf("执行查询: %s, 参数: %v", query, finalParams)

	// 执行查询
	rows, err := db.Query(query, finalParams...)
	if err != nil {
		log.Printf("查询kv_7表失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "查询数据失败")
		return
	}
	defer rows.Close()

	// 处理查询结果
	var results []map[string]interface{}
	columns, err := rows.Columns()
	if err != nil {
		log.Printf("获取列名失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "处理查询结果失败")
		return
	}

	// 创建接收数据的切片
	count := len(columns)
	values := make([]interface{}, count)
	valuePtrs := make([]interface{}, count)

	for i := range columns {
		valuePtrs[i] = &values[i]
	}

	// 遍历结果集
	for rows.Next() {
		err := rows.Scan(valuePtrs...)
		if err != nil {
			log.Printf("扫描行数据失败: %v", err)
			continue
		}

		// 将数据转换为map
		entry := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]

			// 处理不同类型的数据
			switch v := val.(type) {
			case []byte:
				entry[col] = string(v)
			default:
				entry[col] = v
			}
		}

		results = append(results, entry)
	}

	// 检查遍历过程中是否有错误
	if err = rows.Err(); err != nil {
		log.Printf("遍历结果集时发生错误: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "处理查询结果失败")
		return
	}

	// 日志记录接收到的请求和返回的数据量
	log.Printf("KV7查询: limit=%d, offset=%d, start_time=%s, end_time=%s, needCount=%v, 返回数据量=%d, 总记录数=%d",
		limit, offset, startTime, endTime, needCount, len(results), totalCount)

	// 返回结果
	response := map[string]interface{}{
		"success": true,
		"data":    results,
		"limit":   limit,
		"offset":  offset,
	}

	// 只有当请求要求获取总数时才返回总数
	if needCount {
		response["total"] = totalCount
		response["count"] = totalCount
		response["dbTotalCount"] = totalCount
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}
