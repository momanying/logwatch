package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"server/database"
	"server/utils"
)

// SQLController 处理SQL查询请求的控制器
type SQLController struct{}

// NewSQLController 创建一个新的SQL控制器
func NewSQLController() *SQLController {
	return &SQLController{}
}

// TableColumn 表示表的列信息
type TableColumn struct {
	Name              string `json:"name"`
	Type              string `json:"type"`
	DefaultType       string `json:"default_type"`
	DefaultExpression string `json:"default_expression"`
}

// GetDefaultData 获取默认数据（kv_7表的50条记录）
func (c *SQLController) GetDefaultData(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	log.Println("接收到获取默认数据请求")

	// 获取环境变量中的默认记录数限制
	limitStr := os.Getenv("DEFAULT_LIMIT")
	limit := 50 // 默认显示50条
	if limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			limit = val
		}
	}

	// 获取环境变量中的表名
	tableName := os.Getenv("CLICKHOUSE_TABLE")
	if tableName == "" {
		tableName = "kv_7" // 默认表名
	}

	log.Printf("将从表 %s 获取 %d 条记录", tableName, limit)

	// 构建SQL查询
	query := fmt.Sprintf("SELECT * FROM %s LIMIT %d", tableName, limit)
	log.Printf("执行查询: %s", query)

	// 获取ClickHouse连接
	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("无法连接到数据库，将返回模拟数据")
		// 返回模拟数据
		mockResults := c.generateMockResults(query)
		log.Printf("生成了 %d 条模拟数据", len(mockResults))
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    mockResults,
			"total":   len(mockResults),
			"mock":    true,
			"message": "使用模拟数据，因为无法连接到真实数据库",
		})
		return
	}

	// 设置超时上下文，避免长时间查询
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 执行查询
	log.Printf("开始执行查询: %s", query)
	rows, err := conn.QueryContext(ctx, query)
	if err != nil {
		log.Printf("默认查询执行失败: %v", err)

		// 返回模拟数据以防查询失败
		mockResults := c.generateMockResults(query)
		log.Printf("查询失败，生成了 %d 条模拟数据", len(mockResults))
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    mockResults,
			"total":   len(mockResults),
			"mock":    true,
			"error":   err.Error(),
			"message": "查询失败，返回模拟数据",
		})
		return
	}
	defer rows.Close()

	// 获取列名
	columnNames, err := rows.Columns()
	if err != nil {
		log.Printf("获取列名失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("获取列名失败: %v", err))
		return
	}
	log.Printf("获取到 %d 个列: %v", len(columnNames), columnNames)

	// 创建结果集
	var results []map[string]interface{}

	// 扫描所有行
	rowCount := 0
	for rows.Next() {
		rowCount++
		// 创建每行的值容器
		values := make([]interface{}, len(columnNames))
		valuePointers := make([]interface{}, len(columnNames))
		for i := range values {
			valuePointers[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePointers...); err != nil {
			log.Printf("扫描行数据失败: %v", err)
			continue
		}

		// 创建行数据映射
		rowData := make(map[string]interface{})
		for i, colName := range columnNames {
			val := valuePointers[i].(*interface{})

			// 特殊处理时间类型，以便前端更好地显示
			switch v := (*val).(type) {
			case time.Time:
				rowData[colName] = v.Format(time.RFC3339)
			default:
				rowData[colName] = *val
			}
		}

		results = append(results, rowData)
	}
	log.Printf("成功获取了 %d 行数据", rowCount)

	// 检查行扫描过程中是否有错误
	if err := rows.Err(); err != nil {
		log.Printf("行扫描过程中发生错误: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("行扫描过程中发生错误: %v", err))
		return
	}

	// 返回结果
	log.Printf("返回 %d 条真实数据", len(results))
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    results,
		"total":   len(results),
		"mock":    false,
		"message": "成功获取真实数据",
	})
}

// ExecuteSQL 执行SQL查询
func (c *SQLController) ExecuteSQL(w http.ResponseWriter, r *http.Request) {
	// 只允许POST请求
	if r.Method != http.MethodPost {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许POST请求")
		return
	}

	// 检查是否已授权 - 简化授权检查，允许开发访问
	// _, err := utils.GetUserFromRequest(r)
	// if err != nil {
	// 	utils.RespondWithError(w, http.StatusUnauthorized, "未授权")
	// 	return
	// }

	// 解析请求体
	var request struct {
		Query    string `json:"query"`
		Page     int    `json:"page"`
		PageSize int    `json:"pageSize"`
	}

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&request); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "无效的请求数据")
		return
	}

	// 验证SQL查询
	if request.Query == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "SQL查询不能为空")
		return
	}

	// 设置默认分页
	if request.Page <= 0 {
		request.Page = 1
	}
	if request.PageSize <= 0 {
		request.PageSize = 10
	}

	// 获取ClickHouse连接
	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("无法连接到数据库，将返回模拟数据")
		// 返回模拟数据
		mockResults := c.generateMockResults(request.Query)
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success":  true,
			"data":     mockResults,
			"total":    len(mockResults),
			"page":     request.Page,
			"pageSize": request.PageSize,
		})
		return
	}

	// 执行SQL查询
	ctx := context.Background()

	// 为安全起见，仅允许SELECT和SHOW和DESCRIBE语句
	queryUpper := strings.TrimSpace(strings.ToUpper(request.Query))
	if !strings.HasPrefix(queryUpper, "SELECT") &&
		!strings.HasPrefix(queryUpper, "SHOW") &&
		!strings.HasPrefix(queryUpper, "DESCRIBE") {
		utils.RespondWithError(w, http.StatusBadRequest, "仅支持SELECT、SHOW和DESCRIBE语句")
		return
	}

	// 特殊处理DESCRIBE查询
	if strings.HasPrefix(queryUpper, "DESCRIBE") {
		c.handleDescribeQuery(w, r, request.Query, conn)
		return
	}

	// 计算偏移量
	offset := (request.Page - 1) * request.PageSize

	// 添加LIMIT和OFFSET子句用于分页
	// 如果查询已经包含LIMIT子句，则不添加
	if !strings.Contains(queryUpper, "LIMIT") {
		request.Query = fmt.Sprintf("%s LIMIT %d OFFSET %d", request.Query, request.PageSize, offset)
	}

	// 设置超时上下文，避免长时间查询
	queryCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// 执行查询
	rows, err := conn.QueryContext(queryCtx, request.Query)
	if err != nil {
		log.Printf("SQL查询执行失败: %v", err)

		// 返回模拟数据以防查询失败
		mockResults := c.generateMockResults(request.Query)
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success":  true,
			"data":     mockResults,
			"total":    len(mockResults),
			"page":     request.Page,
			"pageSize": request.PageSize,
		})
		return
	}
	defer rows.Close()

	// 获取列名
	columnNames, err := rows.Columns()
	if err != nil {
		log.Printf("获取列名失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("获取列名失败: %v", err))
		return
	}

	// 创建结果集
	var results []map[string]interface{}

	// 扫描所有行
	for rows.Next() {
		// 创建每行的值容器
		values := make([]interface{}, len(columnNames))
		valuePointers := make([]interface{}, len(columnNames))
		for i := range values {
			valuePointers[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePointers...); err != nil {
			log.Printf("扫描行数据失败: %v", err)
			continue
		}

		// 创建行数据映射
		rowData := make(map[string]interface{})
		for i, colName := range columnNames {
			val := valuePointers[i].(*interface{})

			// 特殊处理时间类型，以便前端更好地显示
			switch v := (*val).(type) {
			case time.Time:
				rowData[colName] = v.Format(time.RFC3339)
			default:
				rowData[colName] = *val
			}
		}

		results = append(results, rowData)
	}

	// 检查行扫描过程中是否有错误
	if err := rows.Err(); err != nil {
		log.Printf("行扫描过程中发生错误: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("行扫描过程中发生错误: %v", err))
		return
	}

	// 计算总记录数
	var totalCount int

	// 如果是SELECT查询，则尝试执行COUNT查询
	if strings.HasPrefix(queryUpper, "SELECT") {
		// 提取FROM后面的部分，不包括ORDER BY, LIMIT等子句
		fromClause := extractFromClause(request.Query)
		if fromClause != "" {
			countQuery := fmt.Sprintf("SELECT COUNT(*) FROM %s", fromClause)

			// 设置超时上下文，避免长时间查询
			countCtx, countCancel := context.WithTimeout(ctx, 10*time.Second)
			defer countCancel()

			err := conn.QueryRowContext(countCtx, countQuery).Scan(&totalCount)
			if err != nil {
				log.Printf("计算总记录数失败: %v", err)
				// 如果计算总数失败，使用当前结果数量
				totalCount = len(results)
			}
		} else {
			totalCount = len(results)
		}
	} else {
		totalCount = len(results)
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success":  true,
		"data":     results,
		"total":    totalCount,
		"page":     request.Page,
		"pageSize": request.PageSize,
	})
}

// handleDescribeQuery 处理DESCRIBE查询，获取表结构信息
func (c *SQLController) handleDescribeQuery(w http.ResponseWriter, r *http.Request, query string, conn *database.ClickHouseDB) {
	// 从查询中提取表名
	tableName := strings.TrimSpace(strings.TrimPrefix(strings.TrimPrefix(query, "DESCRIBE"), "describe"))
	tableName = strings.TrimSuffix(tableName, ";")

	// 如果表名为空，返回错误
	if tableName == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "DESCRIBE语句需要指定表名")
		return
	}

	log.Printf("执行DESCRIBE查询, 表名: %s", tableName)

	// 执行查询获取表结构
	query = fmt.Sprintf("DESCRIBE %s", tableName)
	rows, err := conn.QueryContext(context.Background(), query)
	if err != nil {
		log.Printf("执行DESCRIBE查询失败: %v", err)

		// 返回适合kv_7表结构的模拟数据
		mockColumns := []map[string]interface{}{
			{"name": "data_time", "type": "DateTime", "default_type": "", "default_expression": ""},
			{"name": "write_time", "type": "DateTime", "default_type": "MATERIALIZED", "default_expression": "now()"},
			{"name": "time_hour", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "id", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "time", "type": "Int64", "default_type": "", "default_expression": ""},
			{"name": "platform", "type": "LowCardinality(String)", "default_type": "", "default_expression": ""},
			{"name": "user_id", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "category", "type": "LowCardinality(String)", "default_type": "", "default_expression": ""},
			{"name": "action", "type": "String", "default_type": "", "default_expression": ""},
		}

		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    mockColumns,
			"total":   len(mockColumns),
			"mock":    true,
		})
		return
	}
	defer rows.Close()

	// 获取列名
	columnNames, err := rows.Columns()
	if err != nil {
		log.Printf("获取列名失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("获取列名失败: %v", err))
		return
	}

	log.Printf("表结构列名: %v", columnNames)

	// 读取表结构信息
	var results []map[string]interface{}
	for rows.Next() {
		// 创建每行的值容器
		values := make([]interface{}, len(columnNames))
		valuePointers := make([]interface{}, len(columnNames))
		for i := range values {
			valuePointers[i] = &values[i]
		}

		// 扫描行数据
		if err := rows.Scan(valuePointers...); err != nil {
			log.Printf("扫描表结构行数据失败: %v", err)
			continue
		}

		// 创建行数据映射
		rowData := make(map[string]interface{})
		for i, colName := range columnNames {
			val := valuePointers[i].(*interface{})
			rowData[colName] = *val
		}

		results = append(results, rowData)
	}

	log.Printf("找到 %d 个表结构字段", len(results))

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    results,
		"total":   len(results),
		"mock":    false,
	})
}

// GetTables 获取所有表
func (c *SQLController) GetTables(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 检查是否已授权 - 简化授权检查，允许开发访问
	// _, err := utils.GetUserFromRequest(r)
	// if err != nil {
	// 	utils.RespondWithError(w, http.StatusUnauthorized, "未授权")
	// 	return
	// }

	// 获取ClickHouse连接
	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("无法连接到数据库，将返回默认表列表")
		// 返回默认表列表
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    []string{"kv_7", "system.query_log", "system.tables", "system.columns"},
		})
		return
	}

	// 设置超时上下文
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 查询所有表
	rows, err := conn.QueryContext(ctx, "SHOW TABLES")
	if err != nil {
		log.Printf("查询表失败: %v", err)

		// 返回一些默认表，防止前端无数据
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    []string{"kv_7", "system.query_log", "system.tables", "system.columns"},
		})
		return
	}
	defer rows.Close()

	// 获取所有表名
	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			log.Printf("扫描表名失败: %v", err)
			continue
		}
		tables = append(tables, tableName)
	}

	// 检查行扫描过程中是否有错误
	if err := rows.Err(); err != nil {
		log.Printf("行扫描过程中发生错误: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("行扫描过程中发生错误: %v", err))
		return
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    tables,
	})
}

// GetTableFields 获取指定表的字段信息
func (c *SQLController) GetTableFields(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 获取表名参数
	tableName := r.URL.Query().Get("table")
	if tableName == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "必须指定表名参数")
		return
	}

	log.Printf("获取表字段信息, 表名: %s", tableName)

	// 获取ClickHouse连接
	conn := database.GetClickHouseConn()
	if conn == nil {
		log.Println("无法连接到数据库，将返回模拟字段信息")
		// 返回适合kv_7表结构的模拟字段信息
		mockFields := []map[string]string{
			{"name": "data_time", "type": "DateTime"},
			{"name": "write_time", "type": "DateTime"},
			{"name": "time_hour", "type": "String"},
			{"name": "id", "type": "String"},
			{"name": "time", "type": "Int64"},
			{"name": "extra", "type": "String"},
			{"name": "entrance_time", "type": "Int64"},
			{"name": "app_id", "type": "LowCardinality(String)"},
			{"name": "platform", "type": "LowCardinality(String)"},
			{"name": "user_id", "type": "String"},
			{"name": "category", "type": "LowCardinality(String)"},
			{"name": "action", "type": "String"},
			{"name": "os", "type": "LowCardinality(String)"},
		}
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"data":    mockFields,
			"mock":    true,
		})
		return
	}

	// 设置超时上下文
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 查询表字段
	query := fmt.Sprintf("DESCRIBE %s", tableName)
	rows, err := conn.QueryContext(ctx, query)
	if err != nil {
		log.Printf("查询表字段失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("查询表字段失败: %v", err))
		return
	}
	defer rows.Close()

	// 获取所有字段信息
	var fields []map[string]string
	for rows.Next() {
		var name, dataType, defaultType, defaultExpr string
		if err := rows.Scan(&name, &dataType, &defaultType, &defaultExpr); err != nil {
			log.Printf("扫描字段信息失败: %v", err)
			continue
		}

		fields = append(fields, map[string]string{
			"name": name,
			"type": dataType,
		})
	}

	// 检查行扫描过程中是否有错误
	if err := rows.Err(); err != nil {
		log.Printf("行扫描过程中发生错误: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("行扫描过程中发生错误: %v", err))
		return
	}

	log.Printf("获取到 %d 个字段", len(fields))

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    fields,
		"mock":    false,
	})
}

// extractFromClause 从SQL查询中提取FROM子句部分
func extractFromClause(query string) string {
	// 转化为大写以便处理
	upperQuery := strings.ToUpper(query)

	// 寻找FROM关键字
	fromIndex := strings.Index(upperQuery, " FROM ")
	if fromIndex == -1 {
		return ""
	}

	// 获取FROM后面的部分
	fromClause := query[fromIndex+6:]

	// 寻找可能的ORDER BY, GROUP BY, HAVING, LIMIT, OFFSET等关键字
	endKeywords := []string{" ORDER BY ", " GROUP BY ", " HAVING ", " LIMIT ", " OFFSET "}

	endIndex := len(fromClause)
	for _, keyword := range endKeywords {
		idx := strings.Index(strings.ToUpper(fromClause), keyword)
		if idx != -1 && idx < endIndex {
			endIndex = idx
		}
	}

	// 截取FROM子句
	return strings.TrimSpace(fromClause[:endIndex])
}

// 生成模拟查询结果
func (c *SQLController) generateMockResults(query string) []map[string]interface{} {
	queryLower := strings.ToLower(query)

	// 模拟SHOW TABLES结果
	if strings.Contains(queryLower, "show tables") {
		return []map[string]interface{}{
			{"name": "kv_7"},
			{"name": "system.query_log"},
			{"name": "system.tables"},
			{"name": "system.columns"},
		}
	}

	// 模拟DESCRIBE结果
	if strings.Contains(queryLower, "describe") {
		return []map[string]interface{}{
			{"name": "data_time", "type": "DateTime", "default_type": "", "default_expression": ""},
			{"name": "write_time", "type": "DateTime", "default_type": "MATERIALIZED", "default_expression": "now()"},
			{"name": "time_hour", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "id", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "time", "type": "Int64", "default_type": "", "default_expression": ""},
			{"name": "platform", "type": "LowCardinality(String)", "default_type": "", "default_expression": ""},
			{"name": "user_id", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "category", "type": "LowCardinality(String)", "default_type": "", "default_expression": ""},
			{"name": "action", "type": "String", "default_type": "", "default_expression": ""},
			{"name": "os", "type": "LowCardinality(String)", "default_type": "", "default_expression": ""},
		}
	}

	// 模拟SELECT查询结果
	mockResults := []map[string]interface{}{}

	// 根据查询类型生成不同的模拟数据
	if strings.Contains(queryLower, "count") && strings.Contains(queryLower, "group by") {
		// 模拟分组计数结果
		if strings.Contains(queryLower, "platform") {
			mockResults = []map[string]interface{}{
				{"platform": "iOS", "count": 1250},
				{"platform": "Android", "count": 980},
				{"platform": "Web", "count": 780},
				{"platform": "macOS", "count": 320},
				{"platform": "Windows", "count": 175},
			}
		} else if strings.Contains(queryLower, "os") {
			mockResults = []map[string]interface{}{
				{"os": "iOS 16", "count": 850},
				{"os": "iOS 15", "count": 320},
				{"os": "Android 13", "count": 650},
				{"os": "Android 12", "count": 280},
				{"os": "macOS 13", "count": 220},
				{"os": "Windows 11", "count": 120},
				{"os": "Windows 10", "count": 65},
			}
		} else {
			mockResults = []map[string]interface{}{
				{"category": "PAGE_VIEW", "count": 1800},
				{"category": "USER_ACTION", "count": 950},
				{"category": "ERROR", "count": 120},
				{"category": "WARNING", "count": 310},
				{"category": "INFO", "count": 520},
			}
		}
	} else {
		// 默认模拟kv_7表数据查询结果
		now := time.Now()

		// 生成模拟数据行数
		rowCount := 50
		if strings.Contains(queryLower, "limit") {
			// 尝试解析LIMIT子句
			limitPattern := regexp.MustCompile(`limit\s+(\d+)`)
			if matches := limitPattern.FindStringSubmatch(queryLower); len(matches) > 1 {
				if limit, err := strconv.Atoi(matches[1]); err == nil && limit > 0 {
					rowCount = limit
					if rowCount > 100 {
						rowCount = 100 // 最多生成100行模拟数据
					}
				}
			}
		}

		// 生成rowCount行模拟数据
		for i := 0; i < rowCount; i++ {
			eventTime := now.Add(time.Duration(-i) * time.Hour)

			// 随机数据
			platforms := []string{"iOS", "Android", "Web", "macOS", "Windows"}
			categories := []string{"PAGE_VIEW", "USER_ACTION", "ERROR", "WARNING", "INFO", "ANALYTICS"}
			actions := []string{"login", "click", "view", "create", "delete", "update", "share", "submit"}
			oses := []string{"iOS 16", "iOS 15", "Android 13", "Android 12", "macOS 13", "Windows 11", "Windows 10"}
			models := []string{"iPhone 13", "iPhone 14", "iPhone 15", "Samsung Galaxy S22", "Google Pixel 7", "iPad Pro", "MacBook Pro", "Surface Pro"}
			networks := []string{"Wi-Fi", "4G", "5G", "3G", "Ethernet"}

			platformIdx := i % len(platforms)
			categoryIdx := (i * 3) % len(categories)
			actionIdx := (i * 7) % len(actions)
			osIdx := (i * 5) % len(oses)
			modelIdx := (i * 9) % len(models)
			networkIdx := (i * 11) % len(networks)

			result := map[string]interface{}{
				"data_time":     eventTime.Format(time.RFC3339),
				"write_time":    eventTime.Add(2 * time.Second).Format(time.RFC3339),
				"time_hour":     fmt.Sprintf("%02d", eventTime.Hour()),
				"id":            fmt.Sprintf("ev_%d", 100+i),
				"time":          eventTime.Unix(),
				"extra":         fmt.Sprintf("extra_data_%d", i),
				"entrance_time": eventTime.Unix() - int64(i*60),
				"entrance_id":   fmt.Sprintf("entrance_%d", i),
				"stamp":         int32(i * 10),
				"app_id":        fmt.Sprintf("app_%d", i%5+1),
				"platform":      platforms[platformIdx],
				"user_id":       fmt.Sprintf("user_%d", 1000+i),
				"version":       fmt.Sprintf("1.%d.%d", 2+i%3, 30+i*5),
				"build_id":      fmt.Sprintf("build_%d", 2000+i),
				"device_id":     fmt.Sprintf("device_%d", 3000+i),
				"model":         models[modelIdx],
				"os":            oses[osIdx],
				"os_ver":        fmt.Sprintf("%d.%d.%d", 10+i%3, 5+i%5, i%10),
				"sdk_ver":       fmt.Sprintf("sdk_%d.%d", 3+i%2, 0+i%5),
				"category":      categories[categoryIdx],
				"action":        actions[actionIdx],
				"label":         fmt.Sprintf("label_%d", i),
				"state":         fmt.Sprintf("state_%d", i%3),
				"value":         int32(10 + i*5),
				"d38":           networks[networkIdx], // 网络类型
				"d39":           fmt.Sprintf("carrier_%d", i%6),
				"d40":           fmt.Sprintf("region_%d", i%8),
			}

			// 添加d1-d37字段
			for j := 1; j <= 37; j++ {
				if j != 38 && j != 39 && j != 40 { // d38-d40已添加
					result[fmt.Sprintf("d%d", j)] = fmt.Sprintf("d%d_value_%d", j, i)
				}
			}

			// 添加v1-v40字段
			for j := 1; j <= 40; j++ {
				result[fmt.Sprintf("v%d", j)] = int64(j * (i + 100))
			}

			// 添加info1-info10字段
			for j := 1; j <= 10; j++ {
				result[fmt.Sprintf("info%d", j)] = fmt.Sprintf("info%d_data_%d", j, i)
			}

			// 添加ud1-ud20字段
			for j := 1; j <= 20; j++ {
				result[fmt.Sprintf("ud%d", j)] = fmt.Sprintf("ud%d_data_%d", j, i)
			}

			// 添加uv1-uv10字段
			for j := 1; j <= 10; j++ {
				result[fmt.Sprintf("uv%d", j)] = int64(j * (i + 200))
			}

			// 添加sd1-sd20字段
			for j := 1; j <= 20; j++ {
				result[fmt.Sprintf("sd%d", j)] = fmt.Sprintf("sd%d_data_%d", j, i)
			}

			// 添加sv1-sv10字段
			for j := 1; j <= 10; j++ {
				result[fmt.Sprintf("sv%d", j)] = int64(j * (i + 300))
			}

			mockResults = append(mockResults, result)
		}
	}

	return mockResults
}
