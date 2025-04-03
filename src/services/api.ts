import axios from 'axios';

// 服务器地址
const API_BASE_URL = 'http://localhost:8888/api';

// 创建Axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'dummy_token_for_demo'}`
  }
});

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 如果是网络错误且没有重试过，则重试一次
    if (error.message.includes('Network Error') && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('网络错误，正在重试请求...');
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token || '',
    'Content-Type': 'application/json'
  };
};

// 创建新文档
export const createDocument = async (title: string, content: string) => {
  try {
    const response = await apiClient.post('/documents', { title, content });
    return response.data;
  } catch (error) {
    console.error('创建文档失败', error);
    throw error;
  }
};

// 获取文档列表
export const getDocuments = async () => {
  try {
    const response = await apiClient.get('/documents');
    return response.data;
  } catch (error) {
    console.error('获取文档列表失败', error);
    throw error;
  }
};

// 获取文档详情
export const getDocument = async (id: string) => {
  try {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('获取文档详情失败', error);
    throw error;
  }
};

// 更新文档
export const updateDocument = async (id: string, title: string, content: string) => {
  try {
    const response = await apiClient.put(`/documents/${id}`, { title, content });
    return response.data;
  } catch (error) {
    console.error('更新文档失败', error);
    throw error;
  }
};

// 删除文档
export const deleteDocument = async (id: string) => {
  try {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除文档失败', error);
    throw error;
  }
};

// 获取最近数据
export const getRecentData = async (params: any) => {
  try {
    const response = await apiClient.get('/analytics/recent', { params });
    return response.data;
  } catch (error) {
    console.error('获取最近数据失败', error);
    return { success: false, error: '网络连接失败，请稍后再试' };
  }
};

// 获取事件分析数据
export const getEventAnalytics = async (params: any) => {
  try {
    const response = await apiClient.get('/analytics/events', { params });
    return response.data;
  } catch (error) {
    console.error('获取事件分析数据失败', error);
    return { success: false, error: '网络连接失败，请稍后再试' };
  }
};

// 获取用户分布数据
export const getUserDistribution = async (params: any) => {
  try {
    const response = await apiClient.get('/analytics/users', { params });
    return response.data;
  } catch (error) {
    console.error('获取用户分布数据失败', error);
    return { success: false, error: '网络连接失败，请稍后再试' };
  }
};

// 获取记录详情
export const getRecordDetail = async (id: string) => {
  try {
    const response = await apiClient.get('/analytics/record', { params: { id } });
    return response.data;
  } catch (error) {
    console.error('获取记录详情失败', error);
    return { success: false, error: '网络连接失败，请稍后再试' };
  }
};

// 日志查询相关API
export interface LogFilter {
  project?: string;
  log_type?: string;
  start_time?: string;
  end_time?: string;
  uid?: string;
  session_id?: string;
  aid?: string;
  msg_filter?: string;
  content_filter?: string;
  field_filter?: {[key: string]: string}; // 添加字段筛选
  level?: string; // 日志级别筛选
  sort_field?: string; // 排序字段
  sort_order?: 'asc' | 'desc'; // 排序方向
  ip?: string; // IP地址筛选
  device?: string; // 设备筛选
  browser?: string; // 浏览器筛选
  platform?: string; // 平台筛选
  os?: string; // 操作系统筛选
  region?: string; // 地区筛选
  page?: number;
  page_size?: number;
}

export interface LogEntry {
  id: string;
  data_time?: string;
  timestamp?: string;
  write_time?: string;
  time_hour?: string;
  time?: number;
  level?: string;
  message?: string;
  msg?: string; // 兼容不同的消息字段名
  category?: string;
  action?: string;
  platform?: string;
  userId?: string;
  user_id?: string; // 兼容不同的用户ID字段名
  app_id?: string;
  os?: string;
  OS?: string; // 兼容大写OS字段名
  browser?: string;
  version?: string;
  from?: string; // 来源URL
  referrer?: string; // 引用页面
  trace?: string; // 追踪ID
  url?: string; // 页面URL
  ip?: string; // IP地址
  userAgent?: string; // 用户代理
  netType?: string; // 网络类型
  country?: string; // 国家
  province?: string; // 省份
  city?: string; // 城市
  type?: string; // 日志类型
  device?: string; // 设备
  deviceId?: string; // 设备ID
  brand?: string; // 品牌
  engine?: string; // 浏览器引擎
  stackTrace?: string; // 堆栈跟踪
  extData?: any; // 扩展数据
  [key: string]: any; // 其他可能的字段
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  total?: number;
  dbTotalCount?: number; // 添加数据库总条数字段
  error?: string;
}

// 模拟日志数据
const mockLogData: LogEntry[] = [
  {
    "action":"",
    "app_id":"1358",
    "build_id":"17ef0b60-62b0-4b68-a59b-96280c05255c",
    "category":"PERF_NET_SSE",
    "d1":"http://hunyuanapi.com",
    "d2":"hunyuanapi.com",
    "d3":"deepSeek",
    "d36":"127.0.0.1",
    "d37":"中国",
    "d38":"NoPermission",
    "d39":"电信",
    "d40":"中国广东",
    "data_time":"2025-03-25T17:18:00+08:00",
    "device_id":"2B16B760-3FD8-4AE4-A931-D31330D702B9",
    "entrance_id":"e2f310cb-da63-47d2-a563-a56a4099cbd4",
    "entrance_time":1742894325613,
    "id":"3a55bfab-1e60-43ad-a717-8c68119c245a",
    "model":"iPhone13",
    "os":"ios",
    "os_ver":"Version 15.4.1 (Build 19E258)",
    "platform":"ios",
    "sdk_ver":"5.4.5",
    "stamp":1742894325,
    "time":1742891281659,
    "time_hour":"2025032509",
    "user_id":"123456789",
    "version":"4.4.1"
  },
  // 添加更多模拟数据以便分页
  {
    "action":"",
    "app_id":"1358",
    "build_id":"17ef0b60-62b0-4b68-a59b-96280c05255c",
    "category":"PERF_NET_SSE",
    "d1":"http://hunyuanapi.com",
    "d2":"hunyuanapi.com",
    "d3":"deepSeek",
    "d36":"127.0.0.1",
    "d37":"中国",
    "d38":"NoPermission",
    "d39":"电信",
    "d40":"中国广东",
    "data_time":"2025-03-25T17:19:00+08:00",
    "device_id":"2B16B760-3FD8-4AE4-A931-D31330D702B9",
    "entrance_id":"f3b70252-3f68-4907-a364-a889dfc738e7",
    "entrance_time":1742894325613,
    "id":"f3b70252-3f68-4907-a364-a889dfc738e7",
    "model":"iPhone13",
    "os":"ios",
    "os_ver":"Version 15.4.1 (Build 19E258)",
    "platform":"ios",
    "sdk_ver":"5.4.5",
    "stamp":1742894325,
    "time":1742891281659,
    "time_hour":"2025032509",
    "user_id":"123456789",
    "version":"4.4.1"
  },
  {
    "action":"",
    "app_id":"1358",
    "build_id":"17ef0b60-62b0-4b68-a59b-96280c05255c",
    "category":"PERF_NET_SSE",
    "d1":"http://hunyuanapi.com",
    "d2":"hunyuanapi.com",
    "d3":"deepSeek",
    "d36":"127.0.0.1",
    "d37":"中国",
    "d38":"NoPermission",
    "d39":"电信",
    "d40":"中国广东",
    "data_time":"2025-03-25T17:20:00+08:00",
    "device_id":"2B16B760-3FD8-4AE4-A931-D31330D702B9",
    "entrance_id":"4ae7bcfb-203b-4758-b853-3bd8436d8356",
    "entrance_time":1742894325613,
    "id":"4ae7bcfb-203b-4758-b853-3bd8436d8356",
    "model":"iPhone13",
    "os":"ios",
    "os_ver":"Version 15.4.1 (Build 19E258)",
    "platform":"ios",
    "sdk_ver":"5.4.5",
    "stamp":1742894325,
    "time":1742891281659,
    "time_hour":"2025032509",
    "user_id":"987654321",
    "version":"4.4.1"
  },
  {
    "action":"",
    "app_id":"1358",
    "build_id":"17ef0b60-62b0-4b68-a59b-96280c05255c",
    "category":"PERF_NET_SSE",
    "d1":"http://hunyuanapi.com",
    "d2":"hunyuanapi.com",
    "d3":"deepSeek",
    "d36":"127.0.0.1",
    "d37":"中国",
    "d38":"NoPermission",
    "d39":"电信",
    "d40":"中国广东",
    "data_time":"2025-03-25T17:21:00+08:00",
    "device_id":"2B16B760-3FD8-4AE4-A931-D31330D702B9",
    "entrance_id":"bdc8f47e-fcfc-4a7b-9a7f-1ebec04ee5cb",
    "entrance_time":1742894325613,
    "id":"bdc8f47e-fcfc-4a7b-9a7f-1ebec04ee5cb",
    "model":"iPhone13",
    "os":"ios",
    "os_ver":"Version 15.4.1 (Build 19E258)",
    "platform":"ios",
    "sdk_ver":"5.4.5",
    "stamp":1742894325,
    "time":1742891281659,
    "time_hour":"2025032509",
    "user_id":"987654321",
    "version":"4.4.1"
  },
  {
    "action":"",
    "app_id":"1359",
    "build_id":"17ef0b60-62b0-4b68-a59b-96280c05255c",
    "category":"PERF_NET_SSE",
    "d1":"http://hunyuanapi.com",
    "d2":"hunyuanapi.com",
    "d3":"deepSeek",
    "d36":"127.0.0.1",
    "d37":"中国",
    "d38":"NoPermission",
    "d39":"电信",
    "d40":"中国广东",
    "data_time":"2025-03-25T17:22:00+08:00",
    "device_id":"2B16B760-3FD8-4AE4-A931-D31330D702B9",
    "entrance_id":"c37c2b0f-5df7-45dc-9a6f-dd9a193c6721",
    "entrance_time":1742894325613,
    "id":"c37c2b0f-5df7-45dc-9a6f-dd9a193c6721",
    "model":"iPhone14",
    "os":"ios",
    "os_ver":"Version 16.0.0 (Build 20A362)",
    "platform":"ios",
    "sdk_ver":"5.4.6",
    "stamp":1742894325,
    "time":1742891281659,
    "time_hour":"2025032509",
    "user_id":"abcdef123456",
    "version":"4.5.0"
  },
];

export const queryLogs = async (filters: LogFilter): Promise<ApiResponse<LogEntry[]>> => {
  try {
    // 检查是否有示例数据可用
    let localData: LogEntry[] = mockLogData;
    
    // 模拟按时间过滤
    if (filters.start_time || filters.end_time) {
      localData = localData.filter(log => {
        const logDate = new Date(log.data_time || '2025-03-27T17:07:00').getTime();
        const startDate = filters.start_time ? new Date(filters.start_time).getTime() : 0;
        const endDate = filters.end_time ? new Date(filters.end_time).getTime() : Infinity;
        return logDate >= startDate && logDate <= endDate;
      });
    }
    
    // 模拟按用户ID过滤
    if (filters.uid) {
      localData = localData.filter(log => log.user_id && log.user_id.includes(filters.uid || ''));
    }
    
    // 模拟按会话ID过滤
    if (filters.session_id) {
      localData = localData.filter(log => log.entrance_id && log.entrance_id.includes(filters.session_id || ''));
    }
    
    // 模拟按应用ID过滤
    if (filters.aid) {
      localData = localData.filter(log => log.app_id && log.app_id.includes(filters.aid || ''));
    }
    
    // 模拟分页
    const startIndex = ((filters.page || 1) - 1) * (filters.page_size || 50);
    const endIndex = startIndex + (filters.page_size || 50);
    const paginatedData = localData.slice(startIndex, endIndex);
    
    // 生成一个比实际过滤后数据更大的模拟数据库总条数
    const dbTotalCount = Math.max(10000, localData.length * 5);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        success: true,
      data: paginatedData,
      total: localData.length,
      dbTotalCount: dbTotalCount // 添加数据库总条数
    };
  } catch (error) {
    console.error('查询日志错误:', error);
    return {
      success: false,
      error: '查询失败，请稍后再试'
    };
  }
};

// 添加一个处理示例日志数据的函数
export const processExampleLogData = (jsonData: any): LogEntry[] => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return [];
  }
  
  // 将示例数据转换为LogEntry数组
  return jsonData.map(item => {
    // 确保每个对象都有id字段
    if (!item.id) {
      item.id = Math.random().toString(36).substring(2, 15);
    }
    
    return item as LogEntry;
  });
};

// 根据ID获取日志详情
export const getLogDetail = async (id: string): Promise<ApiResponse<LogEntry>> => {
  try {
    // 检查是否有示例数据可用
    const exampleData = {
      "action":"",
      "app_id":"1358",
      "build_id":"17ef0b60-62b0-4b68-a59b-96280c05255c",
      "category":"PERF_NET_SSE",
      "d1":"http://hunyuanapi.com",
      "d10":"",
      "d11":"",
      "d12":"127.0.0.1",
      "d13":"",
      "d14":"",
      "d15":"",
      "d16":"",
      "d17":"",
      "d18":"",
      "d19":"",
      "d2":"hunyuanapi.com",
      "d20":"",
      "d21":"",
      "d22":"",
      "d23":"",
      "d24":"",
      "d25":"",
      "d26":"",
      "d27":"",
      "d28":"",
      "d29":"",
      "d3":"deepSeek",
      "d30":"",
      "d31":"",
      "d32":"",
      "d33":"",
      "d34":"",
      "d35":"",
      "d36":"127.0.0.1",
      "d37":"中国",
      "d38":"NoPermission",
      "d39":"电信",
      "d4":"FALSE",
      "d40":"中国广东",
      "d5":"FALSE",
      "d6":"",
      "d7":"",
      "d8":"",
      "d9":"",
      "data_time":"2025-03-25T17:18:00+08:00",
      "device_id":"2B16B760-3FD8-4AE4-A931-D31330D702B9",
      "entrance_id":"e2f310cb-da63-47d2-a563-a56a4099cbd4",
      "entrance_time":1742894325613,
      "extra":"",
      "id":"3a55bfab-1e60-43ad-a717-8c68119c245a",
      "info1":"",
      "info10":"",
      "info2":"",
      "info3":"",
      "info4":"",
      "info5":"",
      "info6":"",
      "info7":"",
      "info8":"",
      "info9":"",
      "label":"",
      "model":"iPhone13",
      "os":"ios",
      "os_ver":"Version 15.4.1 (Build 19E258)",
      "platform":"ios",
      "sd1":"v2",
      "sd10":"",
      "sd11":"",
      "sd12":"",
      "sd13":"",
      "sd14":"",
      "sd15":"",
      "sd16":"",
      "sd17":"",
      "sd18":"",
      "sd19":"",
      "sd2":"",
      "sd20":"",
      "sd3":"",
      "sd4":"",
      "sd5":"",
      "sd6":"",
      "sd7":"",
      "sd8":"",
      "sd9":"",
      "sdk_ver":"5.4.5",
      "stamp":1742894325,
      "state":"",
      "sv1":0,
      "sv10":0,
      "sv2":0,
      "sv3":0,
      "sv4":0,
      "sv5":0,
      "sv6":0,
      "sv7":0,
      "sv8":0,
      "sv9":0,
      "time":1742891281659,
      "time_hour":"2025032509",
      "ud1":"",
      "ud10":"",
      "ud11":"",
      "ud12":"",
      "ud13":"",
      "ud14":"",
      "ud15":"",
      "ud16":"",
      "ud17":"",
      "ud18":"",
      "ud19":"",
      "ud2":"",
      "ud20":"",
      "ud3":"",
      "ud4":"",
      "ud5":"",
      "ud6":"",
      "ud7":"",
      "ud8":"",
      "ud9":"",
      "user_id":"123456789",
      "uv1":0,
      "uv10":0,
      "uv2":0,
      "uv3":0,
      "uv4":0,
      "uv5":0,
      "uv6":0,
      "uv7":0,
      "uv8":0,
      "uv9":0,
      "v1":282,
      "v10":0,
      "v11":0,
      "v12":0,
      "v13":0,
      "v14":0,
      "v15":0,
      "v16":0,
      "v17":0,
      "v18":0,
      "v19":0,
      "v2":173,
      "v20":0,
      "v21":0,
      "v22":0,
      "v23":0,
      "v24":0,
      "v25":0,
      "v26":0,
      "v27":0,
      "v28":0,
      "v29":0,
      "v3":80,
      "v30":0,
      "v31":0,
      "v32":0,
      "v33":0,
      "v34":0,
      "v35":0,
      "v36":0,
      "v37":0,
      "v38":0,
      "v39":0,
      "v4":21,
      "v40":0,
      "v5":8,
      "v6":0,
      "v7":1742894324395,
      "v8":1742894324568,
      "v9":1742894325067,
      "value":0,
      "version":"4.4.1"
    };
    
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: exampleData as LogEntry
    };
  } catch (error) {
    console.error('获取日志详情失败', error);
    return {
      success: false,
      error: '获取日志详情失败，请重试'
    };
  }
};

export const getLogFields = async () => {
  try {
    console.log('获取日志字段列表');
    const response = await apiClient.get('/logs/fields');
    return response.data;
  } catch (error) {
    console.error('获取日志字段列表失败', error);
    // 返回默认字段
    return { 
      success: true, 
      data: [
        { key: 'date', label: '日期' },
        { key: 'level', label: '级别' },
        { key: 'uid', label: '用户ID' },
        { key: 'sessionId', label: '会话ID' },
        { key: 'aid', label: '应用ID' },
        { key: 'msg', label: '消息' },
        { key: 'from', label: '来源' },
        { key: 'trace', label: '跟踪' },
        { key: 'referrer', label: '引用' },
        { key: 'version', label: '版本' },
        { key: 'country', label: '国家' },
        { key: 'province', label: '省份' },
        { key: 'city', label: '城市' },
        { key: 'ip', label: 'IP地址' },
        { key: 'userAgent', label: '用户代理' },
        { key: 'netType', label: '网络类型' }
      ]
    };
  }
};

export const getProjects = async () => {
  try {
    console.log('获取项目列表');
    const response = await apiClient.get('/logs/projects');
    return response.data;
  } catch (error) {
    console.error('获取项目列表失败', error);
    // 返回默认项目
    return { 
      success: true, 
      data: [
        { value: '腾讯云前端监控项目Web-?20000.2:demo', text: '腾讯云前端监控项目Web-?20000.2:demo' },
        { value: '腾讯文档Web-10001', text: '腾讯文档Web-10001' },
        { value: '腾讯云音视频项目-30001', text: '腾讯云音视频项目-30001' }
      ]
    };
  }
};

export const getLogTypes = async () => {
  try {
    console.log('获取日志类型列表');
    const response = await apiClient.get('/logs/types');
    return response.data;
  } catch (error) {
    console.error('获取日志类型列表失败', error);
    // 返回默认日志类型
    return { 
      success: true, 
      data: [
        { value: '全部日志', text: '全部日志' },
        { value: '错误日志', text: '错误日志' },
        { value: '警告日志', text: '警告日志' },
        { value: '信息日志', text: '信息日志' },
        { value: '调试日志', text: '调试日志' }
      ]
    };
  }
};

export const exportLogs = async (filters: LogFilter) => {
  try {
    console.log('导出日志，参数:', filters);
    const response = await apiClient.get('/logs/export', {
      params: filters,
      responseType: 'blob',
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=logs_export.csv'
      }
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'logs_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    console.error('导出日志失败', error);
    return { success: false, error: '导出失败，请检查网络连接' };
  }
};

// 获取网络性能统计数据
export const getNetworkPerformance = async (params: {
  startTime?: string;
  endTime?: string;
  platform?: string;
  os?: string;
  userId?: string;
}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/network`, {
      params: {
        start_time: params.startTime,
        end_time: params.endTime,
        platform: params.platform,
        os: params.os,
        user_id: params.userId
      },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('获取网络性能统计数据失败:', error);
    throw error;
  }
};

// 获取iOS设备统计数据
export const getIOSDeviceStats = async (params: {
  startTime?: string;
  endTime?: string;
  category?: string;
  userId?: string;
}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/ios`, {
      params: {
        start_time: params.startTime,
        end_time: params.endTime,
        category: params.category,
        user_id: params.userId
      },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('获取iOS设备统计数据失败:', error);
    throw error;
  }
};

// SQL查询相关API
export const getDefaultData = async () => {
  try {
    console.log('获取默认SQL查询数据');
    const response = await apiClient.get('/query/default');
    return response.data;
  } catch (error) {
    console.error('获取默认数据失败', error);
    return { success: false, error: '网络连接失败，请稍后再试' };
  }
};

export const executeQuery = async (sql: string) => {
  try {
    console.log('执行SQL查询', sql);
    const response = await apiClient.post('/query', { sql });
    return response.data;
  } catch (error) {
    console.error('执行SQL查询失败', error);
    return { success: false, error: '网络连接失败，请稍后再试' };
  }
};

export const getTableNames = async () => {
  try {
    console.log('获取数据表列表');
    const response = await apiClient.get('/tables');
    return response.data;
  } catch (error) {
    console.error('获取数据表列表失败', error);
    return { success: false, error: '网络连接失败，请稍后再试', data: [] };
  }
};

export const getTableStructure = async (tableName: string) => {
  try {
    console.log('获取表结构', tableName);
    const response = await apiClient.get(`/table/structure/${tableName}`);
    return response.data;
  } catch (error) {
    console.error('获取表结构失败', error);
    return { success: false, error: '网络连接失败，请稍后再试', data: [] };
  }
};

// 健康检查
export const checkApiHealth = async () => {
  try {
    // 设置较短的超时时间用于健康检查
    const response = await apiClient.get('/health', { 
      timeout: 3000
    });
    return {
      status: 'online',
      message: '服务正常',
      details: response.data
    };
  } catch (error: any) {
    console.error('健康检查失败:', error);
    
    // 错误细分
    if (error.response) {
      // 服务器响应了，但状态码不在2xx范围内
      return {
        status: 'degraded',
        message: `服务响应异常(${error.response.status})`,
        error: error.response.data
      };
    } else if (error.request) {
      // 发送了请求但没有收到响应
      return {
        status: 'offline',
        message: '服务无响应',
        error: '无法连接到服务器'
      };
    } else {
      // 请求配置错误
      return {
        status: 'error',
        message: '连接错误',
        error: error.message
      };
    }
  }
};

// 测试数据库连接
export const testDatabaseConnection = async () => {
  try {
    // 首先尝试直接查询KV7表数据，如果能获取数据就意味着数据库连接正常
    const response = await axios.get('http://localhost:8888/api/query?table=kv_7&limit=1', { 
      timeout: 5000 
    });
    
    // 如果能正常获取数据（返回数组），则说明数据库连接正常
    if (Array.isArray(response.data)) {
      console.log('数据库连接测试成功：已成功查询到数据');
      return {
        status: 'connected',
        message: '数据库连接正常，已成功查询到数据',
        details: { success: true, count: response.data.length }
      };
    }
    
    // 如果不是数组，再尝试调用专门的数据库测试接口
    const testResponse = await axios.get(`${API_BASE_URL}/test/database`, { 
      timeout: 5000 
    });
    
    return {
      status: testResponse.data.success ? 'connected' : 'error',
      message: testResponse.data.message || '数据库连接测试完成',
      details: testResponse.data
    };
  } catch (error: any) {
    console.error('数据库连接测试失败:', error);
    
    // 尝试再次使用不同的端点测试
    try {
      // 使用健康检查接口尝试判断数据库状态
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, { 
        timeout: 3000 
      });
      
      if (healthResponse.data && healthResponse.data.database === 'connected') {
        return {
          status: 'connected',
          message: '通过健康检查API确认数据库连接正常',
          details: healthResponse.data
        };
      }
    } catch (healthError) {
      console.error('健康检查API调用失败:', healthError);
    }
    
    return {
      status: 'error',
      message: '数据库连接测试失败',
      error: error.message || '未知错误'
    };
  }
};

// 查询kv_7表数据
export const queryKV7Table = async (params: {
  limit?: number;
  offset?: number;
  count?: boolean; // 添加count参数
  start_time?: string; // 开始时间
  end_time?: string; // 结束时间
  filters?: {[key: string]: any}; // 其他筛选条件
}) => {
  const startTime = new Date().getTime();
  const requestParams = {
    table: 'kv_7',
    limit: params.limit || 100,
    offset: params.offset || 0,
    count: params.count, // 是否返回总条数
    start_time: params.start_time || params.filters?.start_time, // 支持两种方式传递时间
    end_time: params.end_time || params.filters?.end_time
  };
  
  console.log(`[API请求开始] queryKV7Table - 参数:`, requestParams);
  
  try {
    // 构建URL，添加所有参数
    let url = `/query?table=kv_7&limit=${params.limit || 100}&offset=${params.offset || 0}`;
    
    // 添加count参数
    if (params.count) {
      url += '&count=true';
    }
    
    // 添加时间范围
    const startTimeValue = params.start_time || params.filters?.start_time;
    const endTimeValue = params.end_time || params.filters?.end_time;
    
    if (startTimeValue) {
      url += `&start_time=${encodeURIComponent(startTimeValue)}`;
    }
    
    if (endTimeValue) {
      url += `&end_time=${encodeURIComponent(endTimeValue)}`;
    }
    
    // 添加其他过滤条件
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (key !== 'start_time' && key !== 'end_time' && value) {
          url += `&${key}=${encodeURIComponent(String(value))}`;
        }
      });
    }
    
    console.log(`尝试请求URL: ${url}`);
    
    const response = await apiClient.get(url, {
      timeout: 5000  // 5秒超时
    });
    
    const endTime = new Date().getTime();
    console.log(`[API请求成功] queryKV7Table - 耗时: ${endTime - startTime}ms`);
    
    if (response.status === 200) {
      // 处理两种可能的响应格式:
      // 1. 直接数组，不包含总条数
      // 2. 对象格式，包含 data 和 total
      
      // 数据结构判断
      let data: any[] = [];
      let total = 0;
      
      if (Array.isArray(response.data)) {
        // 老格式：直接返回数组
        data = response.data;
        total = response.headers['x-total-count'] ? 
          parseInt(response.headers['x-total-count'] as string) : data.length;
        
        console.log(`KV7表查询成功，返回${data.length}条记录，总计${total}条`);
      } 
      else if (response.data && typeof response.data === 'object') {
        // 新格式：返回包含data和total的对象
        data = Array.isArray(response.data.data) ? response.data.data : [];
        total = response.data.total || response.data.count || data.length;
        
        console.log(`KV7表查询成功，返回${data.length}条记录，总计${total}条`);
      }
      else {
        console.error('KV7表查询返回数据格式错误:', response.data);
        throw new Error('服务器返回的数据格式不正确');
      }
        
        // 缓存成功获取的数据
        try {
          localStorage.setItem('kv7_cache', JSON.stringify({
            timestamp: new Date().getTime(),
            data: data,
            total: total, // 数据库总条数
            currentCount: data.length // 当前数据量
          }));
        } catch (e) {
          console.warn('缓存KV7数据失败:', e);
        }
        
      // 构造与之前格式兼容的返回结果，包含总条数
        return {
          success: true,
          data: data,
          total: data.length, // 当前返回的数据量
          dbTotalCount: total // 数据库中的总条数
        };
    } else {
      console.error('KV7表查询返回状态码错误:', response.status);
      throw new Error(`服务器返回状态码: ${response.status}`);
    }
  } catch (error: any) {
    console.error('查询KV7表失败，错误:', error);
    
    // 详细的错误信息处理
    let errorMessage = '查询失败: 未知错误';
    let isNetworkError = false;
    
    if (error.response) {
      // 服务器返回错误
      errorMessage = `查询失败: 服务器返回${error.response.status}状态码`;
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.request) {
      // 请求已发送但没收到响应
      errorMessage = '查询失败: 服务器无响应，请检查网络连接或服务器状态';
      isNetworkError = true;
    } else if (error.message) {
      // 其他错误
      errorMessage = `查询失败: ${error.message}`;
      if (error.message.includes('timeout') || error.message.includes('Network Error')) {
        isNetworkError = true;
      }
    }
    
    // 如果是网络错误，尝试重新请求一次，增加超时时间
    if (isNetworkError) {
      try {
        console.log('检测到网络错误，尝试以更长超时时间重新请求...');
        // 同样使用直接的URL格式，添加count参数
        let url = `/query?table=kv_7&limit=${params.limit || 100}&offset=${params.offset || 0}`;
        
        // 添加count参数
        if (params.count) {
          url += '&count=true';
        }
        
        // 添加时间范围
        const startTimeValue = params.start_time || params.filters?.start_time;
        const endTimeValue = params.end_time || params.filters?.end_time;
        
        if (startTimeValue) {
          url += `&start_time=${encodeURIComponent(startTimeValue)}`;
        }
        
        if (endTimeValue) {
          url += `&end_time=${encodeURIComponent(endTimeValue)}`;
        }
        
        const retryResponse = await apiClient.get(url, {
          timeout: 15000  // 增加到15秒
        });
        
        if (retryResponse.status === 200) {
          // 同样处理不同格式的返回结果
          let data: any[] = [];
          let total = 0;
          
          if (Array.isArray(retryResponse.data)) {
            data = retryResponse.data;
            total = retryResponse.headers['x-total-count'] ? 
              parseInt(retryResponse.headers['x-total-count'] as string) : data.length;
          } 
          else if (retryResponse.data && typeof retryResponse.data === 'object') {
            data = Array.isArray(retryResponse.data.data) ? retryResponse.data.data : [];
            total = retryResponse.data.total || retryResponse.data.count || data.length;
          }
          
          const endTime = new Date().getTime();
          console.log(`[API重试成功] queryKV7Table - 耗时: ${endTime - startTime}ms`);
          return {
            success: true,
            data: data,
            total: data.length, // 当前返回的数据量
            dbTotalCount: total // 数据库中的总条数
          };
        }
      } catch (retryError) {
        console.error('KV7表重试请求也失败了:', retryError);
      }
    }
    
    // 尝试从本地缓存获取数据
    try {
      const cachedData = localStorage.getItem('kv7_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = new Date().getTime() - parsed.timestamp;
        
        // 只使用一天以内的缓存数据
        if (cacheAge < 24 * 60 * 60 * 1000) {
          console.log(`使用本地缓存的KV7数据 (${Math.round(cacheAge / 1000 / 60)}分钟前的数据)`);
          return {
            success: true,
            data: parsed.data,
            total: parsed.data.length, // 当前加载的数据量
            dbTotalCount: parsed.total, // 从缓存读取的数据库总数
            fromCache: true,
            cacheTime: new Date(parsed.timestamp).toLocaleString()
          };
        } else {
          console.log('本地缓存数据已过期');
        }
      }
    } catch (e) {
      console.error('解析本地缓存数据失败:', e);
    }
    
    return { 
      success: false, 
      error: errorMessage,
      data: [] as any[],
      total: 0,
      dbTotalCount: 0
    };
  }
}; 