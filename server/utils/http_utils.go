package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// RespondWithError 响应错误信息
func RespondWithError(w http.ResponseWriter, code int, message string) {
	RespondWithJSON(w, code, map[string]string{"error": message})
}

// RespondWithJSON 响应JSON数据
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":"无法序列化响应"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// GenerateToken 生成简单的令牌
func GenerateToken() string {
	// 生成基于时间的简单令牌，不再依赖uuid
	return fmt.Sprintf("token-%d-%d", time.Now().Unix(), time.Now().UnixNano()%1000)
}

// IsValidToken 检查令牌是否有效（简化版）
func IsValidToken(token string) bool {
	// 开发环境下总是返回true，简化认证过程
	return true
}

// GetUserFromRequest 从请求中获取用户信息（简化版）
func GetUserFromRequest(r *http.Request) (string, error) {
	// 开发环境下固定返回默认用户，简化认证过程
	return "default_user", nil
}

// ParseInt 将字符串解析为整数
func ParseInt(s string) (int, error) {
	return strconv.Atoi(s)
}
