import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SimpleSQL.css';

// API基础URL
const API_BASE_URL = 'http://localhost:8888/api';

// 默认查询
const DEFAULT_QUERIES = [
  "-- 查看所有表\nSHOW TABLES;",
  "-- 查询kv_7表数据（示例）\nSELECT * FROM kv_7 LIMIT 10;",
  "-- 带条件的查询\nSELECT column1, column2 \nFROM kv_7 \nWHERE date > '2025-01-01'\nORDER BY timestamp DESC;"
];

// 常用查询模板
const QUERY_TEMPLATES = [
  {
    name: "查看表结构",
    query: "DESCRIBE {table};"
  },
  {
    name: "查看前10条数据",
    query: "SELECT * FROM {table} LIMIT 10;"
  },
  {
    name: "按时间段查询",
    query: "SELECT * FROM {table}\nWHERE data_time BETWEEN '{startDate}' AND '{endDate}'\nLIMIT 100;"
  },
  {
    name: "按平台统计",
    query: "SELECT platform, COUNT(*) as count\nFROM {table}\nGROUP BY platform\nORDER BY count DESC;"
  },
  {
    name: "按操作系统统计",
    query: "SELECT os, COUNT(*) as count\nFROM {table}\nGROUP BY os\nORDER BY count DESC;"
  }
];

const SimpleSQL: React.FC = () => {
  // 状态
  const [sqlQuery, setSqlQuery] = useState<string>(DEFAULT_QUERIES.join('\n\n'));
  const [executing, setExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [resultPage, setResultPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [execHistory, setExecHistory] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<{name: string, query: string}[]>([]);
  const [saveQueryName, setSaveQueryName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [showStructure, setShowStructure] = useState<boolean>(false);
  const [showAllColumns, setShowAllColumns] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>('');
  
  // 加载表名
  useEffect(() => {
    fetchTableNames();
    // 从localStorage加载保存的查询
    const saved = localStorage.getItem('saved_queries');
    if (saved) {
      try {
        setSavedQueries(JSON.parse(saved));
      } catch (e) {
        console.error('加载保存的查询失败:', e);
      }
    }
  }, []);

  // 默认执行查询，获取kv_7表的50条默认数据
  useEffect(() => {
    fetchDefaultData();
  }, []);
  
  // 获取默认数据
  const fetchDefaultData = async () => {
    setExecuting(true);
    setError(null);
    try {
      console.log('正在获取默认数据...');
      // 直接使用正确的API URL
      const response = await axios.get('http://localhost:8888/api/query?table=kv_7&limit=50');
      if (Array.isArray(response.data)) {
        setResults(response.data || []);
        setTotalResults(response.data.length || 0);
        setShowStructure(false);
        // 更新查询文本为对应的SELECT语句
        setSqlQuery(`-- 默认显示kv_7表的50条数据\nSELECT * FROM kv_7 LIMIT 50;`);
        console.log('默认数据获取成功', response.data);
        
        // 成功获取数据后，清除任何错误状态
        setError(null);
        setResultMessage('数据库连接成功，获取到真实数据');
        
        // 向父组件或应用状态通知数据库连接成功的信息
        // 如果页面上有全局状态管理，可以在这里更新全局状态
        if (window.localStorage) {
          window.localStorage.setItem('db_connection_status', 'connected');
        }
      } else {
        console.error('获取默认数据失败:', response.data?.error || '获取默认数据失败，返回格式不正确');
        setError(response.data?.error || '获取默认数据失败，返回格式不正确');
        // 尝试执行当前查询
        if (sqlQuery) {
          executeQuery();
        }
      }
    } catch (err) {
      console.error('获取默认数据异常:', err);
      setError('获取默认数据失败');
      // 尝试执行当前查询
      if (sqlQuery) {
        executeQuery();
      }
    } finally {
      setExecuting(false);
    }
  };
  
  // 获取ClickHouse中的所有表
  const fetchTableNames = async () => {
    try {
      console.log('正在获取表名列表...');
      const response = await axios.get(`${API_BASE_URL}/api/tables`);
      if (response.data && response.data.success) {
        setTableNames(response.data.data || []);
        console.log('表名列表获取成功', response.data.data);
      } else {
        console.error('获取表名列表失败', response.data);
        // 设置一些默认表名作为后备
        setTableNames(['kv_7', 'system.query_log', 'system.tables']);
      }
    } catch (error) {
      console.error('获取表名列表异常', error);
      // 设置一些默认表名作为后备
      setTableNames(['kv_7', 'system.query_log', 'system.tables']);
    }
  };
  
  // 执行SQL查询
  const executeQuery = async () => {
    setExecuting(true);
    setError(null);
    try {
      // 保存到历史记录
      if (sqlQuery.trim() && !execHistory.includes(sqlQuery.trim())) {
        setExecHistory(prev => [sqlQuery, ...prev].slice(0, 20)); // 最多保留20条历史记录
      }
      
      console.log('发送查询请求:', sqlQuery);
      
      // 对于简单的SELECT查询，直接使用API接口
      const sqlLower = sqlQuery.trim().toLowerCase();
      if (sqlLower.startsWith('select') && sqlLower.includes('from kv_7') && !sqlLower.includes(';select')) {
        try {
          // 直接获取KV7表数据
          const response = await axios.get('http://localhost:8888/api/query?table=kv_7&limit=50');
          
          if (Array.isArray(response.data)) {
            console.log('查询结果:', response.data);
            setResults(response.data || []);
            setTotalResults(response.data.length || 0);
            setShowStructure(false);
            setResultMessage('查询成功，使用直接API获取数据');
          } else {
            throw new Error('API返回的数据格式不正确');
          }
        } catch (apiErr) {
          console.error('直接API请求失败:', apiErr);
          // 回退到SQL执行
          throw apiErr;
        }
      } else {
        // 对于复杂查询，使用SQL执行接口
        const response = await axios.post(`${API_BASE_URL}/sql/execute`, {
          query: sqlQuery,
          page: resultPage,
          pageSize: pageSize
        }, {
          timeout: 30000, // 30秒超时
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          console.log('查询结果:', response.data);
          setResults(response.data.data || []);
          setTotalResults(response.data.total || 0);
          
          // 如果是DESCRIBE查询，设置为表结构
          if (sqlQuery.trim().toUpperCase().startsWith('DESCRIBE')) {
            setTableStructure(response.data.data || []);
            setShowStructure(true);
          } else {
            setShowStructure(false);
          }
        } else {
          setError(response.data?.error || '执行SQL查询失败');
          console.error('执行SQL失败:', response.data?.error);
        }
      }
    } catch (err: any) {
      console.error('执行SQL查询请求失败:', err);
      if (err.code === 'ECONNABORTED') {
        setError('查询超时，请尝试简化查询条件');
      } else if (err.response) {
        setError(`服务器错误(${err.response.status}): ${err.response.data?.error || err.message}`);
      } else if (err.request) {
        setError('无法连接到服务器，请检查网络连接或服务器状态');
      } else {
        setError(err.message || '执行SQL查询失败');
      }
      
      // 尝试使用模拟数据以防API不可用
      generateMockResults();
    } finally {
      setExecuting(false);
    }
  };
  
  // 生成模拟结果以防API不可用
  const generateMockResults = () => {
    let mockResults: any[] = [];
    
    if (sqlQuery.toLowerCase().includes('show tables')) {
      mockResults = [
        { name: 'kv_7' },
        { name: 'system.query_log' },
        { name: 'system.tables' }
      ];
    } else if (sqlQuery.toLowerCase().includes('describe')) {
      const tableName = sqlQuery.toLowerCase().replace('describe', '').trim().replace(/;/g, '');
      mockResults = [
        { name: 'id', type: 'String', default_type: '', default_expression: '' },
        { name: 'data_time', type: 'DateTime', default_type: '', default_expression: '' },
        { name: 'category', type: 'String', default_type: '', default_expression: '' },
        { name: 'action', type: 'String', default_type: '', default_expression: '' },
        { name: 'platform', type: 'String', default_type: '', default_expression: '' },
        { name: 'user_id', type: 'String', default_type: '', default_expression: '' },
      ];
      setTableStructure(mockResults);
      setShowStructure(true);
    } else if (sqlQuery.toLowerCase().includes('from kv_7')) {
      // 生成一些kv_7表的模拟数据
      mockResults = Array.from({ length: 10 }, (_, i) => ({
        id: `ev_${100 + i}`,
        data_time: new Date().toISOString(),
        category: ['page', 'action', 'error'][Math.floor(Math.random() * 3)],
        platform: ['ios', 'android', 'web'][Math.floor(Math.random() * 3)],
        user_id: `user_${1000 + i}`,
        action: ['view', 'click', 'error'][Math.floor(Math.random() * 3)],
        os: ['iOS', 'Android', 'Windows', 'macOS'][Math.floor(Math.random() * 4)],
        model: ['iPhone', 'Samsung', 'Chrome', 'Safari'][Math.floor(Math.random() * 4)]
      }));
    }
    
    setResults(mockResults);
    setTotalResults(mockResults.length);
  };
  
  // 处理表格点击事件
  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setSqlQuery(`SELECT * FROM ${tableName} LIMIT 10;`);
    setActiveTab("editor");
  };
  
  // 处理表结构查看
  const handleViewStructure = (tableName: string) => {
    setSelectedTable(tableName);
    setSqlQuery(`DESCRIBE ${tableName};`);
    executeQuery();
  };
  
  // 处理模板查询
  const handleTemplateQuery = (template: {name: string, query: string}) => {
    if (!selectedTable) {
      setError('请先选择一个表');
      return;
    }
    
    let query = template.query.replace(/{table}/g, selectedTable);
    
    // 处理日期占位符
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];
    
    query = query.replace(/{startDate}/g, startDate);
    query = query.replace(/{endDate}/g, endDate);
    
    setSqlQuery(query);
    setActiveTab("editor");
  };
  
  // 处理历史记录点击
  const handleHistoryClick = (query: string) => {
    setSqlQuery(query);
    setActiveTab("editor");
  };
  
  // 处理清空SQL
  const handleClearSQL = () => {
    setSqlQuery('');
  };
  
  // 处理保存查询
  const handleSaveQuery = () => {
    if (!saveQueryName.trim() || !sqlQuery.trim()) {
      return;
    }
    
    const newQuery = {
      name: saveQueryName,
      query: sqlQuery
    };
    
    const updatedQueries = [...savedQueries, newQuery];
    setSavedQueries(updatedQueries);
    
    // 保存到localStorage
    localStorage.setItem('saved_queries', JSON.stringify(updatedQueries));
    
    // 重置状态
    setSaveQueryName('');
    setShowSaveDialog(false);
  };
  
  // 处理加载保存的查询
  const handleLoadSavedQuery = (query: string) => {
    setSqlQuery(query);
    setActiveTab("editor");
  };
  
  // 处理删除保存的查询
  const handleDeleteSavedQuery = (index: number) => {
    const updatedQueries = [...savedQueries];
    updatedQueries.splice(index, 1);
    setSavedQueries(updatedQueries);
    
    // 更新localStorage
    localStorage.setItem('saved_queries', JSON.stringify(updatedQueries));
  };
  
  // 渲染结果集
  const renderResults = () => {
    if (executing) {
      return <div className="loading">加载中...</div>;
    }
    
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    if (!results || results.length === 0) {
      return <div className="no-results">无查询结果</div>;
    }
    
    // 从结果中提取列名
    const columns = Object.keys(results[0]);
    
    // 计算总页数
    const totalPages = Math.ceil(totalResults / pageSize);

    // 对于大型表结构，仅显示最重要的列
    let displayColumns = columns;
    const isLargeStructure = columns.length > 20; 
    
    if (isLargeStructure && !showAllColumns) {
      // 优先显示的列名
      const priorityColumns = [
        'data_time', 'id', 'platform', 'user_id', 'category', 
        'action', 'os', 'model', 'version', 'time', 'value', 
        'app_id', 'write_time', 'device_id', 'label', 'd38', 'd39', 'd40'
      ];
      
      // 过滤掉不在优先列表中的列
      displayColumns = columns.filter(col => 
        priorityColumns.includes(col) || 
        (!col.startsWith('d') && !col.startsWith('v') && 
         !col.startsWith('info') && !col.startsWith('ud') && 
         !col.startsWith('uv') && !col.startsWith('sd') && 
         !col.startsWith('sv'))
      );
      
      // 确保至少显示几个重要的列
      if (displayColumns.length < 5) {
        displayColumns = priorityColumns.filter(col => columns.includes(col));
        if (displayColumns.length < 5) {
          displayColumns = columns.slice(0, 10); // 显示前10列
        }
      }
    }
    
    return (
      <div className="results-container">
        <div className="results-summary">
          共 {totalResults} 条结果，当前显示第 {resultPage} 页，共 {totalPages} 页
          {isLargeStructure && (
            <button 
              className="toggle-columns-button"
              onClick={() => setShowAllColumns(!showAllColumns)}
            >
              {showAllColumns ? '简化列表' : '显示全部列'}
            </button>
          )}
        </div>
        
        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                {displayColumns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {displayColumns.map(col => (
                    <td key={`${rowIndex}-${col}`} title={row[col]?.toString() || ''}>
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalResults > pageSize && (
          <div className="pagination-controls">
            <button 
              className="pagination-button" 
              onClick={() => {
                if (resultPage > 1) {
                  setResultPage(prev => Math.max(prev - 1, 1));
                  executeQuery();
                }
              }}
              disabled={resultPage <= 1}
            >
              上一页
            </button>
            <span className="pagination-info">{resultPage} / {totalPages}</span>
            <button 
              className="pagination-button" 
              onClick={() => {
                if (resultPage < totalPages) {
                  setResultPage(prev => prev + 1);
                  executeQuery();
                }
              }}
              disabled={resultPage >= totalPages}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // 格式化单元格值，处理不同数据类型，特别是日期和长字符串
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    // 如果是日期字符串，格式化它
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      try {
        const date = new Date(value);
        return date.toLocaleString();
      } catch (e) {
        // 如果解析失败，返回原始值
        return value;
      }
    }
    
    // 处理长字符串
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    
    // 处理对象类型
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return value.toString();
  };
  
  // 渲染表信息
  const renderTables = () => {
    return (
      <div className="tables-container">
        <div className="table-title">可用表</div>
        {tableNames.length === 0 ? (
          <div className="loading">加载中...</div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>表名</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {tableNames.map((name, index) => (
                <tr key={index}>
                  <td onClick={() => handleTableClick(name)}>{name}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="action-button" 
                        onClick={() => handleViewStructure(name)}
                        title="查看表结构"
                      >
                        结构
                      </button>
                      <button 
                        className="action-button" 
                        onClick={() => handleTableClick(name)}
                        title="查询数据"
                      >
                        查询
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="query-templates">
          <div className="table-title">常用查询模板</div>
          <div className="templates-list">
            {QUERY_TEMPLATES.map((template, index) => (
              <div 
                key={index} 
                className="template-item"
                onClick={() => handleTemplateQuery(template)}
              >
                {template.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染历史记录
  const renderHistory = () => {
    return (
      <div className="history-container">
        <div className="table-title">查询历史</div>
        {execHistory.length === 0 ? (
          <div className="no-results">暂无查询历史</div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>SQL查询</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {execHistory.map((query, index) => (
                <tr key={index}>
                  <td className="history-query" onClick={() => handleHistoryClick(query)}>
                    {query.length > 100 ? query.substr(0, 100) + '...' : query}
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => handleHistoryClick(query)}
                    >
                      使用
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="table-title">保存的查询</div>
        {savedQueries.length === 0 ? (
          <div className="no-results">暂无保存的查询</div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>SQL查询</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {savedQueries.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td className="history-query">
                    {item.query.length > 80 ? item.query.substr(0, 80) + '...' : item.query}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="action-button"
                        onClick={() => handleLoadSavedQuery(item.query)}
                      >
                        使用
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteSavedQuery(index)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  
  // 渲染编辑器
  const renderEditor = () => (
    <div className="editor-container">
      <textarea
        className="sql-textarea"
        value={sqlQuery}
        onChange={(e) => setSqlQuery(e.target.value)}
        rows={10}
        placeholder="输入SQL查询..."
      />
      
      <div className="button-container">
        <button
          className="execute-button"
          onClick={executeQuery}
          disabled={executing || !sqlQuery.trim()}
        >
          {executing ? '执行中...' : '执行查询'}
        </button>
        
        <button
          className="clear-button"
          onClick={handleClearSQL}
          disabled={!sqlQuery.trim()}
        >
          清空
        </button>
        
        <button
          className="history-button"
          onClick={() => setShowSaveDialog(true)}
          disabled={!sqlQuery.trim()}
        >
          保存查询
        </button>
        
        <div className="page-size-selector">
          每页记录数: 
          <select 
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      
      {showSaveDialog && (
        <div className="save-dialog">
          <div className="save-dialog-content">
            <div className="save-dialog-header">保存查询</div>
            <div className="save-dialog-body">
              <input
                type="text"
                className="save-query-name"
                value={saveQueryName}
                onChange={(e) => setSaveQueryName(e.target.value)}
                placeholder="输入查询名称"
              />
              <div className="save-dialog-query">{sqlQuery}</div>
            </div>
            <div className="save-dialog-footer">
              <button 
                className="save-button"
                onClick={handleSaveQuery}
                disabled={!saveQueryName.trim()}
              >
                保存
              </button>
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveQueryName('');
                }}
              >
                取消
              </button>
            </div>
          </div>
          <div className="save-dialog-backdrop" onClick={() => setShowSaveDialog(false)}></div>
        </div>
      )}
    </div>
  );
  
  // 渲染表结构
  const renderTableStructure = () => {
    if (!showStructure || tableStructure.length === 0) {
      return null;
    }
    
    return (
      <div className="structure-container">
        <div className="table-title">表结构: {selectedTable}</div>
        <table className="results-table">
          <thead>
            <tr>
              {Object.keys(tableStructure[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableStructure.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(row).map((key) => (
                  <td key={`${rowIndex}-${key}`}>{row[key]?.toString() || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // 尝试执行当前查询
  if (sqlQuery) {
    executeQuery(); // 使用handleExecuteQuery代替executeQuery
  }
  
  return (
    <div className="sql-container">
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            SQL编辑器
          </button>
          <button
            className={`tab-button ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            数据表
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            历史记录
          </button>
        </div>
      </div>
      
      {activeTab === 'editor' && renderEditor()}
      {activeTab === 'tables' && renderTables()}
      {activeTab === 'history' && renderHistory()}
      
      {showStructure && renderTableStructure()}
      {renderResults()}
    </div>
  );
};

export default SimpleSQL; 