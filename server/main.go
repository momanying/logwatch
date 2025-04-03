package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"server/controllers"
	"server/database"
)

func main() {
	// 初始化数据库
	_, err := database.InitClickHouse()
	if err != nil {
		log.Fatalf("无法初始化数据库连接: %v", err)
	}
	log.Println("数据库连接已建立")

	// 创建控制器实例
	analyticsController := controllers.NewAnalyticsController()

	// 设置路由
	mux := http.NewServeMux()
	mux.HandleFunc("/api/query", handleQuery)
	mux.HandleFunc("/api/health", handleHealth)

	// 新增kv_7表查询接口
	mux.HandleFunc("/api/query/kv7", analyticsController.QueryKV7Table)

	// 获取端口配置
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8888"
	}

	// 设置CORS
	handler := corsMiddleware(mux)

	// 启动服务器
	log.Printf("服务器启动在 http://localhost:%s", port)
	err = http.ListenAndServe(":"+port, handler)
	if err != nil {
		log.Fatalf("无法启动服务器: %v", err)
	}
}

// CORS中间件
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 设置CORS头
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 处理OPTIONS请求
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 传递给下一个处理器
		next.ServeHTTP(w, r)
	})
}

// 处理查询请求
func handleQuery(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "仅支持GET和POST请求")
		return
	}

	// 解析查询参数
	var tableName string
	var limit int
	var offset int
	var countRequested bool
	var startTime string
	var endTime string

	if r.Method == http.MethodGet {
		// 获取基本参数
		tableName = r.URL.Query().Get("table")
		limitStr := r.URL.Query().Get("limit")
		offsetStr := r.URL.Query().Get("offset")
		countStr := r.URL.Query().Get("count")
		startTime = r.URL.Query().Get("start_time")
		endTime = r.URL.Query().Get("end_time")

		// 解析limit参数
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit <= 0 {
			limit = 50 // 默认值
		}

		// 解析offset参数
		offset, err = strconv.Atoi(offsetStr)
		if err != nil || offset < 0 {
			offset = 0 // 默认值
		}

		// 解析count参数
		countRequested = countStr == "true" || countStr == "1"
	} else {
		// POST请求处理
		var requestData struct {
			Table     string `json:"table"`
			Limit     int    `json:"limit"`
			Offset    int    `json:"offset"`
			Count     bool   `json:"count"`
			StartTime string `json:"start_time"`
			EndTime   string `json:"end_time"`
		}
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&requestData); err != nil {
			respondWithError(w, http.StatusBadRequest, "无效的请求数据")
			return
		}

		tableName = requestData.Table
		limit = requestData.Limit
		offset = requestData.Offset
		countRequested = requestData.Count
		startTime = requestData.StartTime
		endTime = requestData.EndTime

		if limit <= 0 {
			limit = 50 // 默认值
		}

		if offset < 0 {
			offset = 0 // 默认值
		}
	}

	// 检查表名是否提供
	if tableName == "" {
		tableName = "kv_7" // 默认表名
	}

	// 创建上下文
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 执行查询
	log.Printf("查询请求: 表=%s, limit=%d, offset=%d, count=%v, start_time=%s, end_time=%s",
		tableName, limit, offset, countRequested, startTime, endTime)

	// 如果是kv_7表并且请求参数包含start_time或end_time，则调用增强的查询方法
	if tableName == "kv_7" && (startTime != "" || endTime != "" || countRequested) {
		// 调用封装的方法处理kv_7表的高级查询
		results, totalCount, err := database.QueryKV7WithFilters(ctx, limit, offset, countRequested, startTime, endTime)
		if err != nil {
			log.Printf("查询失败: %v", err)
			respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("查询执行失败: %v", err))
			return
		}

		// 构建响应
		response := map[string]interface{}{
			"success": true,
			"data":    results,
			"limit":   limit,
			"offset":  offset,
		}

		// 只有当请求要求获取总数时才返回总数
		if countRequested {
			response["total"] = totalCount
			response["count"] = totalCount
			response["dbTotalCount"] = totalCount
		}

		respondWithJSON(w, http.StatusOK, response)
		return
	}

	// 否则执行普通查询
	results, err := database.QueryLogs(ctx, tableName, limit)
	if err != nil {
		log.Printf("查询失败: %v", err)
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("查询执行失败: %v", err))
		return
	}

	// 返回结果
	respondWithJSON(w, http.StatusOK, results)
}

// 处理健康检查请求
func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondWithError(w, http.StatusMethodNotAllowed, "仅支持GET请求")
		return
	}

	status := map[string]interface{}{
		"status": "ok",
		"time":   time.Now().Format(time.RFC3339),
	}

	// 检查数据库连接
	db := database.GetDB()
	if db == nil {
		status["database"] = "连接失败"
		status["status"] = "warning"
	} else {
		if err := db.Ping(); err != nil {
			status["database"] = fmt.Sprintf("Ping失败: %v", err)
			status["status"] = "warning"
		} else {
			status["database"] = "连接正常"
		}
	}

	respondWithJSON(w, http.StatusOK, status)
}

// 返回JSON响应
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		log.Printf("无法序列化响应: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// 返回错误响应
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}
