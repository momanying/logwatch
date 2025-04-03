package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"server/utils"
)

// DocumentController 处理文档相关请求
type DocumentController struct{}

// Document 表示文档数据结构
type Document struct {
	ID         string    `json:"id"`
	Title      string    `json:"title"`
	Type       string    `json:"type"`
	Content    string    `json:"content,omitempty"`
	CreateTime string    `json:"createTime"`
	CreateAt   time.Time `json:"-"`
	UpdateAt   time.Time `json:"-"`
}

// 存储文档的内存数据库（模拟数据）
var documents = []Document{
	{
		ID:         "1",
		Title:      "项目计划书",
		Type:       "document",
		Content:    "这是项目计划书的内容",
		CreateTime: "2023-05-15",
		CreateAt:   time.Now(),
		UpdateAt:   time.Now(),
	},
	{
		ID:         "2",
		Title:      "销售数据分析",
		Type:       "spreadsheet",
		Content:    "这是销售数据分析的内容",
		CreateTime: "2023-05-20",
		CreateAt:   time.Now(),
		UpdateAt:   time.Now(),
	},
	{
		ID:         "3",
		Title:      "产品规划",
		Type:       "document",
		Content:    "这是产品规划的内容",
		CreateTime: "2023-05-25",
		CreateAt:   time.Now(),
		UpdateAt:   time.Now(),
	},
}

// NewDocumentController 创建一个新的文档控制器
func NewDocumentController() *DocumentController {
	return &DocumentController{}
}

// HandleDocuments 处理文档列表请求
func (c *DocumentController) HandleDocuments(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		c.GetDocuments(w, r)
	case http.MethodPost:
		c.CreateDocument(w, r)
	default:
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "仅支持GET和POST请求")
	}
}

// HandleDocument 处理单个文档请求
func (c *DocumentController) HandleDocument(w http.ResponseWriter, r *http.Request) {
	// 从URL中提取文档ID
	id := strings.TrimPrefix(r.URL.Path, "/api/documents/")

	// 根据HTTP方法调用不同处理函数
	switch r.Method {
	case http.MethodGet:
		c.GetDocument(w, r, id)
	case http.MethodPut:
		c.UpdateDocument(w, r, id)
	case http.MethodDelete:
		c.DeleteDocument(w, r, id)
	default:
		utils.RespondWithError(w, http.StatusMethodNotAllowed, "仅支持GET、PUT和DELETE请求")
	}
}

// GetDocuments 获取文档列表
func (c *DocumentController) GetDocuments(w http.ResponseWriter, r *http.Request) {
	// 简化版：返回不包含内容的文档列表
	docsWithoutContent := make([]Document, len(documents))
	for i, doc := range documents {
		doc.Content = "" // 不返回内容
		docsWithoutContent[i] = doc
	}

	utils.RespondWithJSON(w, http.StatusOK, docsWithoutContent)
}

// GetDocument 获取单个文档
func (c *DocumentController) GetDocument(w http.ResponseWriter, r *http.Request, id string) {
	for _, doc := range documents {
		if doc.ID == id {
			utils.RespondWithJSON(w, http.StatusOK, doc)
			return
		}
	}

	utils.RespondWithError(w, http.StatusNotFound, "文档不存在")
}

// CreateDocument 创建新文档
func (c *DocumentController) CreateDocument(w http.ResponseWriter, r *http.Request) {
	var newDoc Document
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&newDoc); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "无效的请求数据")
		return
	}

	// 设置新文档属性
	now := time.Now()
	newDoc.ID = utils.GenerateToken()[:8]
	newDoc.CreateTime = now.Format("2006-01-02")
	newDoc.CreateAt = now
	newDoc.UpdateAt = now

	// 添加到文档列表
	documents = append(documents, newDoc)

	log.Printf("创建了新文档: ID=%s, 标题=%s", newDoc.ID, newDoc.Title)
	utils.RespondWithJSON(w, http.StatusCreated, newDoc)
}

// UpdateDocument 更新文档
func (c *DocumentController) UpdateDocument(w http.ResponseWriter, r *http.Request, id string) {
	var updatedDoc Document
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&updatedDoc); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "无效的请求数据")
		return
	}

	for i, doc := range documents {
		if doc.ID == id {
			// 更新文档
			updatedDoc.ID = id
			updatedDoc.CreateTime = doc.CreateTime
			updatedDoc.CreateAt = doc.CreateAt
			updatedDoc.UpdateAt = time.Now()
			documents[i] = updatedDoc

			log.Printf("更新了文档: ID=%s, 标题=%s", id, updatedDoc.Title)
			utils.RespondWithJSON(w, http.StatusOK, updatedDoc)
			return
		}
	}

	utils.RespondWithError(w, http.StatusNotFound, "文档不存在")
}

// DeleteDocument 删除文档
func (c *DocumentController) DeleteDocument(w http.ResponseWriter, r *http.Request, id string) {
	for i, doc := range documents {
		if doc.ID == id {
			// 删除文档
			documents = append(documents[:i], documents[i+1:]...)

			log.Printf("删除了文档: ID=%s", id)
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "文档已删除"})
			return
		}
	}

	utils.RespondWithError(w, http.StatusNotFound, "文档不存在")
}
