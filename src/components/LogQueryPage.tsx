import React, { useState, useEffect } from 'react';
import moment from 'moment';
import teaComponent from '../mock-tea-component-fixed';
import '../styles/LogQueryPage.css';
import { queryLogs, LogFilter, checkApiHealth, testDatabaseConnection, queryKV7Table } from '../services/api';
import axios from 'axios';

const { Checkbox, DatePicker } = teaComponent;
const { RangePicker } = DatePicker || {};

// 本地定义的日志条目类型
interface LogEntryType {
  date: string;
  id: string;
  msg: string;
  type?: string;
  level?: string;
  originalData?: any; // 添加originalData字段用于存储原始日志数据
}

// 创建更多的模拟数据，使内容可以滚动
const mockLogData: LogEntryType[] = [
  { 
    date: '2025-03-27 17:07:00.288', 
    id: '1743066417', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:07:00.288', 
    id: '1743066417', 
    msg: '自定义事件上报，用户页面上正在查看数据报表服务', 
    type: 'success'
  },
  { 
    date: '2025-03-27 17:07:00.288', 
    id: '1743066417', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:07:00.288', 
    id: '1743066417', 
    msg: '自定义事件上报，用户页面上正在查看数据报表服务', 
    type: 'success'
  },
  { 
    date: '2025-03-27 17:07:00.288', 
    id: '1743066417', 
    msg: 'Script error. @ (:0:0)', 
    type: 'error'
  },
  { 
    date: '2025-03-27 17:06:54.938', 
    id: '1743066412', 
    msg: 'JSON对象: {"id":"YRKRY18EXMI120000","uid":"1743066412","version":"1.39.1","aid":"4def574c-0cf0-466e-9197-5a3c2a267edb","env":"production","from":"https%3A%2F%2Faegis.qq.com%2Fuser%2F5%2Findex.html","platform":5}', 
    type: 'success'
  },
  { 
    date: '2025-03-27 17:06:54.938', 
    id: '1743066412', 
    msg: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/119.0.6045.123 Safari/537.36', 
    type: 'special'
  },
  { 
    date: '2025-03-27 17:06:54.938', 
    id: '1743066412', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:05:32.456', 
    id: '1743066399', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:05:32.456', 
    id: '1743066399', 
    msg: '用户登录成功，设备ID: DV20252703', 
    type: 'success'
  },
  { 
    date: '2025-03-27 17:05:30.123', 
    id: '1743066399', 
    msg: 'Network error: Failed to fetch API data', 
    type: 'error'
  },
  { 
    date: '2025-03-27 17:04:45.789', 
    id: '1743066385', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:04:45.790', 
    id: '1743066385', 
    msg: '用户配置已更新: {"theme":"dark","language":"zh-CN","notifications":true}', 
    type: 'success'
  },
  { 
    date: '2025-03-27 17:04:10.234', 
    id: '1743066375', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:04:10.235', 
    id: '1743066375', 
    msg: 'TypeError: Cannot read property \'length\' of undefined', 
    type: 'error'
  },
  { 
    date: '2025-03-27 17:03:45.123', 
    id: '1743066370', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:03:45.124', 
    id: '1743066370', 
    msg: '用户上传文件完成: report_data_2025.xlsx', 
    type: 'success'
  },
  { 
    date: '2025-03-27 17:02:30.456', 
    id: '1743066355', 
    msg: 'aegis.report 页面访问', 
    type: 'normal'
  },
  { 
    date: '2025-03-27 17:02:30.457', 
    id: '1743066355', 
    msg: 'Performance warning: Slow render detected (> 200ms)', 
    type: 'warning'
  },
  { 
    date: '2025-03-27 17:02:30.458', 
    id: '1743066355', 
    msg: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
    type: 'special'
  }
];

const LogQueryPage: React.FC = () => {
  // 日期范围
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(7, 'days').startOf('day'),
    moment().endOf('day')
  ]);
  
  // 字段的显示和翻译映射
  const fieldMap = {
    date: 'date',
    level: 'level',
    id: 'id',
    sessionId: 'sessionId',
    aid: 'aid',
    msg: 'msg',
    domain: 'domain',
    origin: 'origin',
    model: 'model',
    deviceId: 'deviceId',
    platform: 'platform',
    os: 'os',
    osVer: 'osVer',
    version: 'version',
    sdkVer: 'sdkVer',
    country: 'country',
    province: 'province',
    city: 'city',
    isp: 'isp',
    ip: 'ip'
  };
  
  // 选中字段
  const [checkedFields, setCheckedFields] = useState({
    date: true,
    level: false,
    id: true,
    sessionId: false,
    aid: false,
    msg: true,
    domain: false,
    origin: false,
    model: false,
    deviceId: false,
    platform: false,
    os: false,
    osVer: false,
    version: false,
    sdkVer: false,
    country: false,
    province: false,
    city: false,
    isp: false,
    ip: false
  });

  // Lucene语法
  const [useLucene, setUseLucene] = useState(true);
  
  // 折叠相似日志
  const [foldSimilar, setFoldSimilar] = useState(true);
  
  // 时间分布
  const [timeDistribution, setTimeDistribution] = useState(false);
  
  // 表格数据
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // 添加状态
  const [logs, setLogs] = useState<LogEntryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 查询条件
  const [filters, setFilters] = useState<LogFilter>({
    start_time: dateRange[0].format('YYYY-MM-DD HH:mm'),
    end_time: dateRange[1].format('YYYY-MM-DD HH:mm'),
    page: 1,
    page_size: 50
  });
  
  // 添加网络状态检测
  const [networkStatus, setNetworkStatus] = useState<'online'|'offline'>('online');
  
  // 添加服务状态检测
  const [apiStatus, setApiStatus] = useState<'online'|'offline'|'degraded'|'unknown'>('unknown');
  const [dbStatus, setDbStatus] = useState<'connected'|'error'|'unknown'>('unknown');
  
  // 获取日志数据
  useEffect(() => {
    fetchLogs();
  }, []);
  
  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 初始设置
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // 检测API和数据库状态
  useEffect(() => {
    const checkServices = async () => {
      // 检查API健康状态
      const apiHealth = await checkApiHealth();
      setApiStatus(apiHealth.status as any);
      
      // 如果API在线，检查数据库连接
      if (apiHealth.status === 'online') {
        const dbTest = await testDatabaseConnection();
        setDbStatus(dbTest.status as any);
      }
    };
    
    // 立即执行一次
    checkServices();
    
    // 设置定时器，每30秒检查一次
    const timer = setInterval(checkServices, 30000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // 加载日志数据
  const fetchLogs = async (retry = false) => {
    setLoading(true);
    
    try {
      console.log('请求参数:', {
        start_time: dateRange[0].format('YYYY-MM-DD HH:mm'),
        end_time: dateRange[1].format('YYYY-MM-DD HH:mm')
      });
      
      // 使用queryKV7Table API获取日志数据
      const response = await queryKV7Table({
        limit: 50, // 固定获取50条数据
        offset: 0,
        count: true, // 请求数据库总条数
        start_time: dateRange[0].format('YYYY-MM-DD HH:mm'),
        end_time: dateRange[1].format('YYYY-MM-DD HH:mm')
      });
      
      if (response.success) {
        // 获取数据和总条数
        const dataList = response.data || [];
        const totalCount = response.dbTotalCount || 0; // 使用dbTotalCount作为数据库总条数
        
        // 转换数据格式
        const formattedLogs = dataList.map((log: any) => {
          const formattedLog: LogEntryType = {
            date: log.data_time || log.date || new Date().toISOString(),
            id: log.id || log.user_id || log.uid || '',
            msg: log.d1 || log.msg || log.message || '',
            type: getLogType(log.category, log.action),
            level: log.level || log.category || '',
            originalData: log // 保存原始数据用于详情显示
          };
          return formattedLog;
        });
        
        setLogs(formattedLogs);
        setTotal(totalCount); // 设置数据库总条数
        setError(null);
        
        // 成功获取数据，设置API和数据库状态为正常
        setApiStatus('online');
        setDbStatus('connected');
        
        console.log('获取到的日志数据:', formattedLogs, '总条数:', totalCount);

        // 缓存成功获取的数据到localStorage
        try {
          localStorage.setItem('cachedLogData', JSON.stringify({
            success: true,
            data: formattedLogs,
            total: totalCount,
            dbTotalCount: totalCount,
            timestamp: new Date().getTime()
          }));
        } catch (e) {
          console.error('缓存数据失败', e);
        }
      } else {
        console.error('API返回错误:', response.error);
        setError(`API返回错误: ${response.error}`);
        
        // 使用模拟数据
        setLogs(mockLogData);
      }
    } catch (error) {
      console.error('查询日志失败', error);
      
      // 设置API状态为离线
      setApiStatus('offline');
      setDbStatus('error');
      
      // 如果是首次失败且网络在线，尝试重试一次
      if (!retry && networkStatus === 'online') {
        console.log('尝试重新加载数据...');
        setTimeout(() => fetchLogs(true), 1000);
        return;
      }
      
      setError('网络错误：无法连接到服务器，请检查网络连接或联系管理员');
      
      // 尝试从缓存获取数据
      const cachedData = localStorage.getItem('cachedLogData');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.success && Array.isArray(parsed.data)) {
            console.log('使用本地缓存数据');
            setLogs(parsed.data);
            setTotal(parsed.dbTotalCount || parsed.total || parsed.data.length || 0);
            return;
          }
        } catch (e) {
          console.error('解析缓存数据失败', e);
        }
      }
      
      setLogs(mockLogData); // 缓存不可用时使用模拟数据
    } finally {
      setLoading(false);
    }
  };
  
  // 根据日志分类和动作获取日志类型
  const getLogType = (category: string, action: string): string => {
    if (!category && !action) return 'normal';
    
    if (category === 'ERROR' || category?.toLowerCase().includes('error')) {
      return 'error';
    } else if (category === 'WARNING' || category?.toLowerCase().includes('warn')) {
      return 'warning';
    } else if (category === 'SUCCESS' || action === 'success' || 
              category?.toLowerCase().includes('success') || 
              action?.toLowerCase().includes('success')) {
      return 'success';
    } else if (category?.toLowerCase().includes('user') || 
              action?.toLowerCase().includes('user')) {
      return 'special';
    }
    
    return 'normal';
  };
  
  // 统计信息显示
  const renderStats = () => {
    if (loading) {
      return <span className="stats">加载中...</span>;
    }
    
    return (
      <span className="stats">已加载 {logs.length} 条，总条数: 1000</span>
    );
  };
  
  // 处理日期范围变化
  const handleDateChange = (dates: any) => {
    if (dates && Array.isArray(dates) && dates.length === 2) {
      // 确保转换为 moment 对象
      const newDateRange: [moment.Moment, moment.Moment] = [
        moment(dates[0]), 
        moment(dates[1])
      ];
      setDateRange(newDateRange);
      
      // 更新筛选条件
      setFilters({
        ...filters,
        start_time: newDateRange[0].format('YYYY-MM-DD HH:mm'),
        end_time: newDateRange[1].format('YYYY-MM-DD HH:mm')
      });
    }
  };
  
  // 执行筛选
  const handleFilter = () => {
    console.log('筛选日期范围:', dateRange[0].format('YYYY-MM-DD HH:mm'), '至', dateRange[1].format('YYYY-MM-DD HH:mm'));
    
    // 更新筛选条件
    setFilters({
      ...filters,
      start_time: dateRange[0].format('YYYY-MM-DD HH:mm'),
      end_time: dateRange[1].format('YYYY-MM-DD HH:mm')
    });
    
    // 调用搜索方法
    fetchLogs();
  };
  
  // 将moment对象转换为Date对象以适应RangePicker的类型要求
  const dateRangeAsDate: [Date, Date] = [
    dateRange[0].toDate(),
    dateRange[1].toDate()
  ];
  
  // 展开/收起日志详情
  const toggleRowExpand = (index: number) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };
  
  // 获取行类型对应的指示器颜色
  const getIndicatorClass = (type: string | undefined) => {
    switch (type) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'special': return 'blue';
      default: return '';
    }
  };
  
  // 选择所有字段
  const selectAllFields = () => {
    const newCheckedFields = { ...checkedFields };
    Object.keys(newCheckedFields).forEach(field => {
      newCheckedFields[field as keyof typeof checkedFields] = true;
    });
    setCheckedFields(newCheckedFields);
    
    // 更新表格显示的列
    updateDisplayColumns();
  };
  
  // 清空所有字段选择
  const clearAllFields = () => {
    const newCheckedFields = { ...checkedFields };
    Object.keys(newCheckedFields).forEach(field => {
      newCheckedFields[field as keyof typeof checkedFields] = false;
    });
    setCheckedFields(newCheckedFields);
    
    // 更新表格显示的列
    updateDisplayColumns();
  };
  
  // 更新表格显示的列
  const updateDisplayColumns = () => {
    // 获取所有选中的字段
    const selectedColumnFields = Object.entries(checkedFields)
      .filter(([_, isChecked]) => isChecked)
      .map(([field]) => field);
    
    console.log('选中的字段:', selectedColumnFields);
    
    // 这里可以更新表格列的显示状态
    // 在实际应用中，这里会设置表格组件的columns属性
  };
  
  // 当字段选择变化时更新表格
  const handleFieldToggle = (field: string) => {
    const newCheckedFields = { ...checkedFields };
    newCheckedFields[field as keyof typeof checkedFields] = !checkedFields[field as keyof typeof checkedFields];
    setCheckedFields(newCheckedFields);
    
    // 更新表格显示的列
    updateDisplayColumns();
  };
  
  // 错误提示组件
  const renderErrorBanner = () => {
    if (!error) return null;
    
    return (
      <div className="error-banner">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <div className="error-close" onClick={() => setError(null)}>×</div>
      </div>
    );
  };
  
  // 网络状态提示
  const renderNetworkStatus = () => {
    if (networkStatus === 'online') return null;
    
    return (
      <div className="network-status offline">
        <div className="status-icon">🔌</div>
        <div className="status-message">网络连接已断开，正在使用缓存数据</div>
      </div>
    );
  };
  
  // 服务状态显示
  const renderServiceStatus = () => {
    // 如果两者状态都是正常，不显示任何提示
    if (apiStatus === 'online' && dbStatus === 'connected') return null;
    
    // 根据状态定制消息和样式
    let statusClass = 'warning';
    let statusIcon = '⚠️';
    let statusMessage = '数据库连接异常，可能返回模拟数据';
    
    if (apiStatus !== 'online') {
      statusClass = 'error';
      statusIcon = '❌';
      statusMessage = '服务器连接失败，使用本地数据';
    }
    
    return (
      <div className={`service-status ${statusClass}`}>
        <div className="status-icon">{statusIcon}</div>
        <div className="status-message">{statusMessage}</div>
        <button 
          className="retry-button" 
          onClick={() => {
            checkApiHealth().then(result => setApiStatus(result.status as any));
            testDatabaseConnection().then(result => setDbStatus(result.status as any));
            fetchLogs();
          }}
        >
          重试
        </button>
      </div>
    );
  };
  
  return (
    <div className="app-container">
      <div className="header">
        <div className="title">日志查询</div>
        <div className="location">
          <span>广州</span>
          <svg className="down-arrow" viewBox="0 0 24 24" width="16" height="16">
            <path d="M7 10l5 5 5-5z" fill="#333"/>
          </svg>
        </div>
      </div>
      
      {renderNetworkStatus()}
      {renderServiceStatus()}
      {renderErrorBanner()}
      
      <div className="main-content">
        <div className="content-area">
          <div className="tabs">
            <div className="tab active">历史日志</div>
            <div className="tab">页面访问日志</div>
            <div className="tab">自定义事件日志</div>
          </div>
          
          <div className="query-container">
            <div className="selectors">
              <div className="select-container">
                <select className="select">
                  <option>腾讯云函数监控项目Web-?20000.2:demo</option>
                </select>
              </div>
              
              <div className="select-container">
                <select className="select">
                  <option>全部日志</option>
                </select>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-label">日期区间</div>
              <div className="date-range-wrapper">
                {RangePicker ? (
                  <RangePicker
                    value={dateRangeAsDate}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD HH:mm"
                  />
                ) : (
                  <div className="mock-date-range-picker">
                    <input
                      type="text"
                      className="date-input"
                      placeholder="YYYY-MM-DD - YYYY-MM-DD"
                      value={`${dateRange[0].format('YYYY-MM-DD HH:mm')} - ${dateRange[1].format('YYYY-MM-DD HH:mm')}`}
                      readOnly
                    />
                    <div className="date-picker-icon">
                      <span className="calendar-icon">
                        <svg viewBox="0 0 1024 1024" width="14" height="14">
                          <path d="M896 128h-160v-32c0-17.7-14.3-32-32-32s-32 14.3-32 32v32h-256v-32c0-17.7-14.3-32-32-32s-32 14.3-32 32v32h-160c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h704c17.7 0 32-14.3 32-32v-736c0-17.7-14.3-32-32-32z m-32 736h-640v-544h640v544z m0-608h-640v-96h160v32c0 17.7 14.3 32 32 32s32-14.3 32-32v-32h256v32c0 17.7 14.3 32 32 32s32-14.3 32-32v-32h96v96z" fill="#999"></path>
                          <path d="M384 512h-64v-64h64v64z m192 0h-64v-64h64v64z m192 0h-64v-64h64v64z m-384 192h-64v-64h64v64z m192 0h-64v-64h64v64z m192 0h-64v-64h64v64z" fill="#999"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button className="filter-button" onClick={handleFilter}>筛选</button>
              <button className="reset-button">重置</button>
            </div>
            
            <div className="input-row">
              <input 
                type="text" 
                className="input" 
                placeholder="输入 UID (用户唯一标识)"
              />
              
              <input 
                type="text" 
                className="input" 
                placeholder="输入 SessionID"
              />
              
              <input 
                type="text" 
                className="input" 
                placeholder="输入 AID"
              />
            </div>
            
            <div className="input-row">
              <input 
                type="text" 
                className="input" 
                placeholder="日志信息msg字段搜索"
              />
              
              <input 
                type="text" 
                className="input" 
                placeholder="日志信息内容字段搜索"
              />
              
              <div className="analysis-button">聚合分析</div>
            </div>
          </div>
          
          <div className="field-container">
            <div className="field-list">
              <div className="field-header">
                <div className="field-title">字段</div>
                <div className="field-actions">
                  <span className="action" onClick={selectAllFields}>全选</span>
                  <span className="action" onClick={clearAllFields}>清除</span>
                </div>
              </div>
              
              {Object.entries(fieldMap).map(([key, label]) => (
                <label key={key} className="field-item">
                  <Checkbox 
                    checked={checkedFields[key as keyof typeof checkedFields]} 
                    onChange={() => handleFieldToggle(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}

              <div className="lucene-switch">
                <div className="switch-container">
                  <input 
                    type="checkbox" 
                    className="switch" 
                    checked={useLucene} 
                    onChange={() => setUseLucene(!useLucene)}
                  />
                  <span className="switch-slider"></span>
                </div>
                <span className="switch-label">启用 Lucene 语法</span>
              </div>
            </div>
            
            <div className="log-section">
              <div className="field-options-row">
                <div className="field-options-left">
                  {renderStats()}
                </div>
                
                <div className="field-options-right">
                  <label className="checkbox-wrapper">
                    <Checkbox checked={foldSimilar} onChange={() => setFoldSimilar(!foldSimilar)} />
                    <span>折叠相似日志</span>
                  </label>
                  
                  <label className="checkbox-wrapper">
                    <Checkbox checked={timeDistribution} onChange={() => setTimeDistribution(!timeDistribution)} />
                    <span>时间段分布</span>
                  </label>
                  
                  <div className="download">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="#666"/>
                    </svg>
                    下载
                  </div>
                </div>
              </div>
              
              <div className="log-table-container">
                <table className="log-table">
                  <thead>
                    <tr>
                      {checkedFields.date && (
                        <th className="date-column">
                          date
                          <svg className="sort-icon" viewBox="0 0 1024 1024" width="12" height="12">
                            <path d="M510.148571 347.428571l227.401143 284.278858h-455.972571z" fill="#333"/>
                          </svg>
                        </th>
                      )}
                      {checkedFields.id && <th>id</th>}
                      {checkedFields.msg && <th>msg</th>}
                      {checkedFields.level && <th>level</th>}
                      {checkedFields.sessionId && <th>sessionId</th>}
                      {checkedFields.aid && <th>aid</th>}
                      {checkedFields.domain && <th>domain</th>}
                      {checkedFields.origin && <th>origin</th>}
                      {checkedFields.model && <th>model</th>}
                      {checkedFields.deviceId && <th>deviceId</th>}
                      {checkedFields.platform && <th>platform</th>}
                      {checkedFields.os && <th>os</th>}
                      {checkedFields.osVer && <th>osVer</th>}
                      {checkedFields.version && <th>version</th>}
                      {checkedFields.sdkVer && <th>sdkVer</th>}
                      {checkedFields.ip && <th>ip</th>}
                      {checkedFields.country && <th>country</th>}
                      {checkedFields.province && <th>province</th>}
                      {checkedFields.city && <th>city</th>}
                      {checkedFields.isp && <th>isp</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <React.Fragment key={index}>
                        <tr 
                          className={`${index % 2 === 0 ? 'even-row' : ''} ${expandedRow === index ? 'expanded-row' : ''}`}
                          onClick={() => toggleRowExpand(index)}
                        >
                          {checkedFields.date && (
                            <td>
                              {log.type && <div className={`row-indicator ${getIndicatorClass(log.type)}`}></div>}
                              {log.date}
                            </td>
                          )}
                          {checkedFields.id && <td>{log.id}</td>}
                          {checkedFields.msg && <td>{log.msg}</td>}
                          {checkedFields.level && <td>{log.level || '-'}</td>}
                          {checkedFields.sessionId && <td>{log.originalData?.sessionId || log.originalData?.entrance_id || '-'}</td>}
                          {checkedFields.aid && <td>{log.originalData?.aid || log.originalData?.app_id || '-'}</td>}
                          {checkedFields.domain && <td>{log.originalData?.domain || log.originalData?.d2 || '-'}</td>}
                          {checkedFields.origin && <td>{log.originalData?.origin || log.originalData?.d3 || '-'}</td>}
                          {checkedFields.model && <td>{log.originalData?.model || '-'}</td>}
                          {checkedFields.deviceId && <td>{log.originalData?.device_id || '-'}</td>}
                          {checkedFields.platform && <td>{log.originalData?.platform || '-'}</td>}
                          {checkedFields.os && <td>{log.originalData?.os || '-'}</td>}
                          {checkedFields.osVer && <td>{log.originalData?.os_ver || '-'}</td>}
                          {checkedFields.version && <td>{log.originalData?.version || '-'}</td>}
                          {checkedFields.sdkVer && <td>{log.originalData?.sdk_ver || '-'}</td>}
                          {checkedFields.ip && <td>{log.originalData?.ip || log.originalData?.d36 || '-'}</td>}
                          {checkedFields.country && <td>{log.originalData?.country || log.originalData?.d37 || '-'}</td>}
                          {checkedFields.province && <td>{log.originalData?.province || log.originalData?.d40 || '-'}</td>}
                          {checkedFields.city && <td>{log.originalData?.city || log.originalData?.d38 || '-'}</td>}
                          {checkedFields.isp && <td>{log.originalData?.isp || log.originalData?.d39 || '-'}</td>}
                        </tr>
                        {expandedRow === index && (
                          <tr className="detail-row">
                            <td colSpan={3}>
                              <div className="log-detail">
                                <div className="detail-section">
                                  <div className="detail-header">字段</div>
                                  <div className="detail-content">
                                    {log.originalData && Object.entries(log.originalData).map(([key, value]) => {
                                      // 不显示太复杂的对象和空值
                                      if (typeof value === 'object' || value === null || value === undefined || value === '') {
                                        return null;
                                      }
                                      
                                      // 排除一些原始字段，因为它们会在其他部分显示
                                      const excludedFields = ['originalData', 'type'];
                                      if (excludedFields.includes(key)) {
                                        return null;
                                      }
                                      
                                      return (
                                        <div className="detail-row" key={key}>
                                          <div className="detail-label">{key}</div>
                                          <div className="detail-value">{String(value)}</div>
                                        </div>
                                      );
                                    })}
                                    
                                    {!log.originalData && (
                                      <>
                                    <div className="detail-row">
                                      <div className="detail-label">@timestamp</div>
                                      <div className="detail-value">{log.date}</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">date</div>
                                      <div className="detail-value">1743066420288</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">env</div>
                                      <div className="detail-value">production</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">errorMsg</div>
                                      <div className="detail-value"></div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">from</div>
                                      <div className="detail-value">https://aegis.qq.com/user/3/index.html</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">id</div>
                                      <div className="detail-value">120000</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">level</div>
                                          <div className="detail-value">{log.level || 'aegis.report'}</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">msg</div>
                                      <div className="detail-value">{log.msg}</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">referrer</div>
                                      <div className="detail-value">https://aegis.qq.com/test.html</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">type</div>
                                      <div className="detail-value">log</div>
                                    </div>
                                    <div className="detail-row">
                                      <div className="detail-label">url</div>
                                      <div className="detail-value">aegis.qq.com/user/3/index.html</div>
                                    </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {log.originalData && log.originalData.netType && (
                                  <div className="detail-section">
                                    <div className="detail-header">网络</div>
                                    <div className="detail-content">
                                      <div className="detail-row">
                                        <div className="detail-label">netType</div>
                                        <div className="detail-value">{log.originalData.netType}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">uid</div>
                                        <div className="detail-value">{log.originalData.userId || log.originalData.user_id || log.id}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">aid</div>
                                        <div className="detail-value">{log.originalData.aid || '-'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">sessionid</div>
                                        <div className="detail-value">{log.originalData.sessionId || `session-${log.id}17574`}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {log.originalData && (log.originalData.country || log.originalData.ip) && (
                                  <div className="detail-section">
                                    <div className="detail-header">地域</div>
                                    <div className="detail-content">
                                      <div className="detail-row">
                                        <div className="detail-label">ip</div>
                                        <div className="detail-value">{log.originalData.ip || '39.145.33.121'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">ipVersion</div>
                                        <div className="detail-value">ipv4</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">isAbroad</div>
                                        <div className="detail-value">{log.originalData.country !== '中国' ? '1' : '0'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">country</div>
                                        <div className="detail-value">{log.originalData.country || '中国'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">province</div>
                                        <div className="detail-value">{log.originalData.province || '安徽省'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">city</div>
                                        <div className="detail-value">{log.originalData.city || '合肥市'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">isp</div>
                                        <div className="detail-value">{log.originalData.isp || 'Telstra Corporation Limited'}</div>
                                      </div>
                                      <div className="detail-row">
                                        <div className="detail-label">region</div>
                                        <div className="detail-value">{log.originalData.city || '合肥市'}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {log.originalData && (log.originalData.browser || log.originalData.os) && (
                                  <div className="detail-section">
                                    <div className="detail-header">设备</div>
                                    <div className="detail-content device-info">
                                      {log.originalData.browser && log.originalData.browser.includes('Safari') && (
                                      <div className="device-icon safari">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMjU2IDhhMjQ4IDI0OCAwIDEgMCAwIDQ5NiAyNDggMjQ4IDAgMCAwIDAtNDk2em0tOTIuMDkgMjk4LjE4Yy0xNi41OSAyNS43OS0zOC44IDQzLjktNjcuNTEgNDUuNzYtMTUuNDctOTcuNzQgMzEuMzQtMTY0LjkgMTAyLTIxNC44LTkuNTUgMTIuNzMtMTcuMzEgMjcuODctMjEuNjMgNDQuMjZDMTU3LjggMjMyLjUxIDE1NS40OSAyNzIuNTkgMTYzLjkxIDMwNi4xOHptMTAwLjg2LTk3Lji2LjQgNzEuMjgtNS4xMyAzLjAzLTYuOTQtNjguMy02MC40LTE1LjQ0LTEzLjYzLTYwLjMgNzIuMTggMTcuNTEgMTUuMzUgMzYuOCA2Mi42OSAxNS40M3oiIHN0eWxlPSJmaWxsOiMzMzM7Ii8+PC9zdmc+" alt="Safari" />
                                      </div>
                                      )}
                                      <div className="device-label">{log.originalData.browser || 'Safari/119.0.6045.123'}</div>
                                      
                                      {log.originalData.os && log.originalData.os.includes('Linux') && (
                                      <div className="device-icon linux">
                                          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBkPSJNMTk2LjEgMTIzLjZjLS4yLTEuNCA1LjEtNy44IDEwLjktMTUuMiA5LjgtMTIuMiAxMC40LTEzLjg2LjMtMjguMjgtOC44Ni0xMi45LTkuMS0yMS45Ni00LTMwLjA2IDUuOC05LjE2IDkuOS0xNiA3LjE2LTI4LjIzLTEuNi03IDIuNS0yMC44IDEwLjgtMjIuMiAyMS44LTMuOSAzOS4zLTEyLjUgNDkuNCAtMjMuNSA2LjQtNyA5LjgtMTkuNyAwLTI2LjItMTYuOS0xMS4yLS44LTIzLjMgMTcuYS0yOCAxMy4zLTMuNiANi0zLjEgMi40LTkuNi04LjlDMzA4IDUuMTggMzIyIDQ3LjMzIDMyMiA5OS42MnY4Ny42YzAgNTkuNDIgMzUuNCAxMDUuMTEgODQuOTcgMTI2LjE4IDEzLjUgNS40IDExIDE4LjIgOC41IDI3LjgtMi4yIDguNS04LjYgMjEuNCA0MC4zIDggMTguNy01LjIgMjEuNSA0LjIgMTUuNCAyNC44LTIuNyA5IDQuMyAyNy4zIDI0LjQgMjAiLz48L3N2Zz4=" alt="Linux" />
                                      </div>
                                      )}
                                      <div className="device-label">{log.originalData.os || log.originalData.OS || 'Linux x86_64'}</div>
                                      
                                      <div className="browser-info">
                                        <div className="detail-tag">browser</div>
                                        <div className="detail-tag-value">{log.originalData.browser || 'Safari/119.0.6045.123'}</div>
                                      </div>
                                      
                                      <div className="os-info">
                                        <div className="detail-tag">os</div>
                                        <div className="detail-tag-value">{log.originalData.os || log.originalData.OS || 'Linux x86_64'}</div>
                                      </div>
                                      
                                      <div className="platform-info">
                                        <div className="detail-tag">platform</div>
                                        <div className="detail-tag-value">{log.originalData.platform || 'Linux'}</div>
                                      </div>
                                      
                                      <div className="brand-info">
                                        <div className="detail-tag">brand</div>
                                        <div className="detail-tag-value">{log.originalData.brand || 'X11'}</div>
                                      </div>
                                      
                                      <div className="engine-info">
                                        <div className="detail-tag">engine</div>
                                        <div className="detail-tag-value">{log.originalData.engine || 'AppleWebKit/537.36'}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogQueryPage; 