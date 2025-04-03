// 日志条目类型
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
  user_id?: string; // 用户ID
  app_id?: string;
  os?: string;
  OS?: string; // 兼容大写OS字段名
  browser?: string;
  version?: string;
  entrance_id?: string; // 会话ID
  entrance_time?: number;
  device_id?: string; // 设备ID
  build_id?: string;
  model?: string; // 设备型号
  os_ver?: string; // 系统版本
  sdk_ver?: string; // SDK版本
  stamp?: number;
  state?: string;
  extra?: string;
  label?: string;
  value?: number;
  // 地理位置信息
  d36?: string; // IP
  d37?: string; // 国家
  d38?: string; // 城市
  d39?: string; // ISP
  d40?: string; // 省份
  // 自定义数据字段
  d1?: string;
  d2?: string;
  d3?: string;
  [key: string]: any; // 其他可能的字段
}

// 日志过滤条件
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
  field_filter?: {[key: string]: string}; // 字段筛选
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