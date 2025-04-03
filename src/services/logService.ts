import { nanoid } from 'nanoid';

// 日志条目接口
export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  service?: string;
  instance?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
  aid?: string;
  requestId?: string;
  path?: string;
  method?: string;
  from?: string;
  referrer?: string;
  version?: string;
  country?: string;
  province?: string;
  city?: string;
  userAgent?: string;
  netType?: string;
  ip?: string;
  [key: string]: any; // 允许任意额外字段
}

// 过滤条件接口
export interface LogFilter {
  project?: string;
  logType?: string;
  timeRange?: [string, string];
  uid?: string;
  sessionId?: string;
  aid?: string;
  msgFilter?: string;
  contentFilter?: string;
}

// 模拟日志数据
const generateMockLogs = (count: number = 200): LogEntry[] => {
  const levels = ['ERROR', 'WARNING', 'INFO', 'DEBUG', 'TRACE'];
  const services = ['api-gateway', 'auth-service', 'document-service', 'user-service', 'storage-service'];
  const instances = ['instance-1', 'instance-2', 'instance-3', 'instance-4'];
  const operations = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'AUTHENTICATE', 'VALIDATE', 'PROCESS'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const paths = [
    '/api/v1/documents',
    '/api/v1/users',
    '/api/v1/auth/login',
    '/api/v1/auth/validate',
    '/api/v1/storage/upload',
    '/api/v1/analytics/logs'
  ];
  
  const logs: LogEntry[] = [];
  
  // 当前时间
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timeOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // 7天内的随机时间
    const timestamp = new Date(now.getTime() - timeOffset).toISOString();
    const level = levels[Math.floor(Math.random() * levels.length)] as any;
    const service = services[Math.floor(Math.random() * services.length)];
    const instance = instances[Math.floor(Math.random() * instances.length)];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const duration = Math.floor(Math.random() * 500);
    const traceId = nanoid();
    const spanId = nanoid(8);
    const userId = Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined;
    const requestId = nanoid(10);
    const resourceId = Math.random() > 0.4 ? `res-${Math.floor(Math.random() * 500)}` : undefined;
    
    let message = '';
    let stack: string | undefined = undefined;
    let code: string | undefined = undefined;
    
    // 根据不同级别生成不同的消息
    switch(level) {
      case 'ERROR':
        message = `Failed to ${operation.toLowerCase()} resource: internal server error`;
        code = `E${Math.floor(Math.random() * 1000)}`;
        stack = `Error: Failed to ${operation.toLowerCase()} resource\n    at ${service}.${operation.toLowerCase()} (/app/${service}/controllers/${operation.toLowerCase()}.js:42:15)\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)`;
        break;
      case 'WARNING':
        message = `Slow ${operation.toLowerCase()} operation detected, took ${duration}ms`;
        code = `W${Math.floor(Math.random() * 1000)}`;
        break;
      case 'INFO':
        message = `Successfully completed ${operation.toLowerCase()} operation for ${resourceId || 'resource'}`;
        break;
      case 'DEBUG':
        message = `Processing ${method} request to ${path} with parameters: { id: "${resourceId || 'unknown'}" }`;
        break;
      case 'TRACE':
        message = `Entering ${service}.${operation.toLowerCase()} with args: [${resourceId || 'null'}, ${userId || 'null'}]`;
        break;
    }
    
    logs.push({
      id: nanoid(),
      timestamp,
      level,
      message,
      service,
      instance,
      traceId,
      spanId,
      userId,
      requestId,
      resourceId,
      operation,
      duration,
      code,
      method,
      path,
      stack,
    });
  }
  
  // 按时间排序，最新的在前面
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 模拟日志数据
const mockLogs = generateMockLogs();

// 获取日志数据
export const getLogs = async (
  filters: LogFilter,
  page: number = 1,
  pageSize: number = 20
): Promise<{ logs: LogEntry[]; total: number }> => {
  // 在真实项目中，这里会调用后端API
  // 这里模拟延时和数据
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟日志数据
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: '2025-03-27 17:07:00.288',
          level: 'INFO',
          message: 'aegis.report 页面访问',
          service: 'web',
          instance: 'instance-1',
          traceId: 'trace-001',
          spanId: 'span-001',
          userId: '1743066417',
          requestId: 'req-001',
          path: '/user/3/index.html',
          method: 'GET',
          from: 'https://aegis.qq.com/user/3/index.html',
          referrer: 'https://aegis.qq.com/test.html',
          version: '1.39.1',
          country: '中国',
          province: '安徽省',
          city: '合肥市',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/119.0.6045.123 Safari/537.36',
          netType: '4G',
          ip: '39.145.33.121'
        },
        {
          id: '2',
          timestamp: '2025-03-27 17:07:00.288',
          level: 'INFO',
          message: '自定义数据上报, 用户页面上正在查看报别的数据',
          service: 'web',
          instance: 'instance-1',
          traceId: 'trace-002',
          spanId: 'span-002',
          userId: '1743066417',
          requestId: 'req-002'
        },
        {
          id: '3',
          timestamp: '2025-03-27 17:07:00.288',
          level: 'INFO',
          message: 'aegis.report 页面访问',
          service: 'web',
          instance: 'instance-1',
          traceId: 'trace-003',
          spanId: 'span-003',
          userId: '1743066417',
          requestId: 'req-003'
        },
        {
          id: '4',
          timestamp: '2025-03-27 17:07:00.288',
          level: 'INFO',
          message: '自定义数据上报, 用户页面上正在查看报别的数据',
          service: 'web',
          instance: 'instance-1',
          traceId: 'trace-004',
          spanId: 'span-004',
          userId: '1743066417',
          requestId: 'req-004'
        },
        {
          id: '5',
          timestamp: '2025-03-27 17:07:00.288',
          level: 'ERROR',
          message: 'Script error, @ (:0:0)',
          service: 'web',
          instance: 'instance-1',
          traceId: 'trace-005',
          spanId: 'span-005',
          userId: '1743066417',
          requestId: 'req-005'
        },
        {
          id: '6',
          timestamp: '2025-03-27 17:06:54.938',
          level: 'DEBUG',
          message: 'JSON数据...',
          service: 'web',
          instance: 'instance-1',
          traceId: 'trace-006',
          spanId: 'span-006',
          userId: '1743066412',
          requestId: 'req-006'
        }
      ];
      
      const total = 109293; // 模拟总日志数量
      resolve({ logs: mockLogs, total });
    }, 500);
  });
};

// 获取所有可用字段
export const getAvailableFields = async (): Promise<string[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    'timestamp',
    'level',
    'message',
    'service',
    'instance',
    'traceId',
    'spanId',
    'userId',
    'requestId',
    'resourceId',
    'operation',
    'duration',
    'code',
    'method',
    'path',
    'stack'
  ];
};

// 获取单个日志详情
export const getLogDetail = async (logId: string): Promise<LogEntry | null> => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟单条日志数据
      const mockLog: LogEntry = {
        id: logId,
        timestamp: '2025-03-27 17:07:00.288',
        level: 'INFO',
        message: 'aegis.report 页面访问',
        service: 'web',
        instance: 'instance-1',
        traceId: 'trace-001',
        spanId: 'span-001',
        userId: '1743066417',
        requestId: 'req-001',
        path: '/user/3/index.html',
        method: 'GET',
        from: 'https://aegis.qq.com/user/3/index.html',
        referrer: 'https://aegis.qq.com/test.html',
        version: '1.39.1',
        country: '中国',
        province: '安徽省',
        city: '合肥市',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/119.0.6045.123 Safari/537.36',
        netType: '4G',
        ip: '39.145.33.121',
        extraInfo: {
          browser: 'Chrome',
          browserVersion: '119.0.6045.123',
          os: 'Linux',
          deviceType: 'Desktop'
        }
      };
      
      resolve(mockLog);
    }, 300);
  });
};

// 获取服务列表
export const getServices = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['web', 'api', 'backend', 'mobile']);
    }, 200);
  });
};

// 获取实例列表
export const getInstances = async (service?: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['instance-1', 'instance-2', 'instance-3']);
    }, 200);
  });
};

// 获取操作列表
export const getOperations = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['页面访问', '点击事件', '表单提交', '错误', '自定义事件']);
    }, 200);
  });
};

// 导出日志为CSV
export const exportLogsToCSV = async (filters: LogFilter): Promise<string> => {
  // 在真实项目中，这里通常会调用API下载文件
  // 这里只是模拟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟返回一个下载URL
      resolve('download/logs_export_20250327.csv');
    }, 500);
  });
}; 