package controllers

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"server/database"
	"server/models"
	"server/utils"
)

// LogsController 处理日志查询相关请求
type LogsController struct{}

// 创建一个全局的LogsController实例
var logsController = NewLogsController()

// 暴露出的处理函数，用于路由绑定
var (
	QueryLogs    = logsController.QueryLogs
	GetLogDetail = logsController.GetLogDetail
	GetLogFields = logsController.GetLogFields
	GetProjects  = logsController.GetProjects
	GetLogTypes  = logsController.GetLogTypes
	ExportLogs   = logsController.ExportLogs
)

// NewLogsController 创建一个新的日志控制器
func NewLogsController() *LogsController {
	return &LogsController{}
}

// QueryLogs 查询日志记录
func (c *LogsController) QueryLogs(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 不再检查授权，直接让所有请求通过

	// 解析查询参数
	options := parseLogsQueryParams(r)

	// 检查是否请求了总条数
	countRequested := r.URL.Query().Get("count") == "true"

	// 从数据库获取日志数据或降级使用模拟数据
	logs, total, dbTotal, err := models.QueryLogs(options, countRequested)
	if err != nil {
		log.Printf("查询日志失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "查询日志失败")
		return
	}

	// 返回结果，包含总条数
	result := map[string]interface{}{
		"success": true,
		"data":    logs,
		"total":   total,
	}

	// 如果请求了总条数，添加dbTotalCount字段
	if countRequested {
		result["dbTotalCount"] = dbTotal
	}

	utils.RespondWithJSON(w, http.StatusOK, result)
}

// GetLogDetail 获取日志详情
func (c *LogsController) GetLogDetail(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 不再检查授权，直接让所有请求通过

	// 获取日志ID
	logID := r.URL.Query().Get("id")
	if logID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "日志ID不能为空")
		return
	}

	// 获取模拟日志记录而不是从ClickHouse获取
	record, err := models.GetFullKV7Record(logID)
	if err != nil {
		log.Printf("获取日志详情失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "获取日志详情失败")
		return
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    record,
	})
}

// GetLogFields 获取可用的日志字段
func (c *LogsController) GetLogFields(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 不再检查授权，直接让所有请求通过

	// 更新字段列表，使其与kv_7表的字段匹配
	fields := []map[string]string{
		{"key": "date", "label": "日期"},
		{"key": "time", "label": "时间"},
		{"key": "id", "label": "日志ID"},
		{"key": "platform", "label": "平台"},
		{"key": "category", "label": "类别"},
		{"key": "action", "label": "操作"},
		{"key": "os", "label": "操作系统"},
		{"key": "uid", "label": "用户ID"},
		{"key": "app_id", "label": "应用ID"},
		{"key": "version", "label": "版本"},
		{"key": "device_id", "label": "设备ID"},
		{"key": "model", "label": "设备型号"},
		{"key": "os_ver", "label": "系统版本"},
		{"key": "msg", "label": "消息内容"},
		{"key": "label", "label": "标签"},
		{"key": "state", "label": "状态"},
		{"key": "value", "label": "数值"},
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    fields,
	})
}

// GetProjects 获取可选的项目列表
func (c *LogsController) GetProjects(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 不再检查授权，直接让所有请求通过

	// 直接返回预定义的项目列表，不再从数据库获取
	projects := []map[string]string{
		{"value": "腾讯云前端监控项目Web-?20000.2:demo", "text": "腾讯云前端监控项目Web-?20000.2:demo"},
		{"value": "腾讯文档Web-10001", "text": "腾讯文档Web-10001"},
		{"value": "腾讯云音视频项目-30001", "text": "腾讯云音视频项目-30001"},
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    projects,
	})
}

// GetLogTypes 获取可选的日志类型
func (c *LogsController) GetLogTypes(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 不再检查授权，直接让所有请求通过

	// 直接返回预定义的日志类型列表，不再从数据库获取
	logTypes := []map[string]string{
		{"value": "全部日志", "text": "全部日志"},
		{"value": "错误日志", "text": "错误日志"},
		{"value": "警告日志", "text": "警告日志"},
		{"value": "信息日志", "text": "信息日志"},
		{"value": "调试日志", "text": "调试日志"},
	}

	// 返回结果
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    logTypes,
	})
}

// ExportLogs 导出日志数据
func (c *LogsController) ExportLogs(w http.ResponseWriter, r *http.Request) {
	// 只允许GET请求
	if r.Method != http.MethodGet {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "只允许GET请求")
		return
	}

	// 不再检查授权，直接让所有请求通过

	// 解析查询参数
	options := parseLogsQueryParams(r)

	// 设置导出的数量限制
	options.Limit = 10000 // 最多导出1万条记录

	// 从数据库获取日志数据或降级使用模拟数据
	logs, _, _, err := models.QueryLogs(options, false)
	if err != nil {
		log.Printf("导出日志失败: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "导出日志失败")
		return
	}

	// 设置响应头，指示这是CSV文件下载
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=logs_export.csv")

	// 生成CSV内容
	csvContent := "data_time,id,user_id,platform,os,action,message\n"
	for _, record := range logs {
		// 避免CSV注入
		csvContent += escapeCSV(record.DataTime.Format(time.RFC3339)) + ","
		csvContent += escapeCSV(record.ID) + ","
		csvContent += escapeCSV(record.UserID) + ","
		csvContent += escapeCSV(record.Platform) + ","
		csvContent += escapeCSV(record.OS) + ","
		csvContent += escapeCSV(record.Action) + ","
		csvContent += escapeCSV(record.D1) + "\n" // 假设D1存储了message
	}

	// 写入响应
	w.Write([]byte(csvContent))
}

// parseLogsQueryParams 解析日志查询参数
func parseLogsQueryParams(r *http.Request) database.QueryOptions {
	options := database.DefaultQueryOptions()

	// 解析时间范围
	startTimeStr := r.URL.Query().Get("start_time")
	endTimeStr := r.URL.Query().Get("end_time")

	if startTimeStr != "" {
		startTime, err := time.Parse("2006-01-02 15:04", startTimeStr)
		if err == nil {
			options.StartTime = startTime
		}
	}

	if endTimeStr != "" {
		endTime, err := time.Parse("2006-01-02 15:04", endTimeStr)
		if err == nil {
			options.EndTime = endTime
		}
	}

	// 解析分页参数
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")

	page := 1
	pageSize := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	// 计算offset和limit
	options.Offset = (page - 1) * pageSize
	options.Limit = pageSize

	// 解析其他筛选参数 - 根据前端表单字段名调整
	options.UserID = r.URL.Query().Get("user_id")    // 用户ID
	options.Platform = r.URL.Query().Get("platform") // 平台
	options.OS = r.URL.Query().Get("os")             // 操作系统
	options.Category = r.URL.Query().Get("category") // 日志类别
	options.Action = r.URL.Query().Get("action")     // 操作类型

	// 项目和日志类型筛选（可根据实际需求调整字段映射）
	project := r.URL.Query().Get("project")
	logType := r.URL.Query().Get("log_type")

	if project != "" && project != "全部项目" {
		options.AppID = project
	}

	if logType != "" && logType != "全部日志" {
		switch logType {
		case "错误日志":
			options.Category = "ERROR"
		case "警告日志":
			options.Category = "WARNING"
		case "信息日志":
			options.Category = "INFO"
		case "调试日志":
			options.Category = "DEBUG"
		}
	}

	// 添加字段搜索 - 这些需要在frontend.QueryOptions中添加处理
	msgFilter := r.URL.Query().Get("msg_filter")
	deviceID := r.URL.Query().Get("device_id")
	modelFilter := r.URL.Query().Get("model")

	// 添加到自定义过滤条件中
	if msgFilter != "" {
		options.Filter["msg"] = msgFilter // 对应d1字段
	}

	if deviceID != "" {
		options.Filter["device_id"] = deviceID
	}

	if modelFilter != "" {
		options.Filter["model"] = modelFilter
	}

	// 排序配置
	sortField := r.URL.Query().Get("sort_field")
	sortOrder := r.URL.Query().Get("sort_order")

	if sortField != "" {
		options.SortBy = sortField
	}

	if sortOrder != "" {
		options.SortOrder = sortOrder
	}

	return options
}

// escapeCSV 转义CSV字段，防止CSV注入
func escapeCSV(field string) string {
	if strings.Contains(field, ",") || strings.Contains(field, "\"") || strings.Contains(field, "\n") {
		// 如果字段包含逗号、双引号或换行符，需要用双引号包围，并将字段中的双引号替换为两个双引号
		return "\"" + strings.ReplaceAll(field, "\"", "\"\"") + "\""
	}
	return field
}
