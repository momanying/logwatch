import React, { useEffect, useState } from 'react';
import { Button, Icon, Loading } from '@tencent/tea-component';
import '../styles/LogViewer.css';
import { 
  LogEntry, LogFilter, queryLogs, getLogDetail, 
  getLogFields, getProjects, getLogTypes, exportLogs 
} from '../services/api';
import DynamicLogForm from './DynamicLogForm';

// 导入修复后的组件
import teaComponent from '../mock-tea-component-fixed';

const { 
  Table, Card, Form, Radio, Checkbox, Select, 
  Input, Text, Tabs, DatePicker, Justify, Grid, Row, Col 
} = teaComponent;

const { TabPanel } = Tabs;
const { RangePicker } = DatePicker;
const { Group: RadioGroup } = Radio;

// 日志查询接口响应类型更新
interface LogQueryResponse {
  success: boolean;
  data?: LogEntry[];
  total?: number;
  dbTotalCount?: number; // 添加数据库总条数字段
  error?: string;
}

const LogViewer: React.FC = () => {
  // 状态
  const [activeTab, setActiveTab] = useState<string>('history');
  const [activeNavTab, setActiveNavTab] = useState<string>('history');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [fields, setFields] = useState<Array<{key: string, label: string}>>([]);
  const [projects, setProjects] = useState<Array<{value: string, text: string}>>([]);
  const [logTypes, setLogTypes] = useState<Array<{value: string, text: string}>>([]);
  
  // 分页
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [total, setTotal] = useState<number>(0);
  const [dbTotalCount, setDbTotalCount] = useState<number>(0); // 添加数据库总条数
  
  // 过滤器
  const [filters, setFilters] = useState<LogFilter>({
    project: '腾讯云前端监控项目Web-?20000.2:demo',
    log_type: '全部日志',
    start_time: '2025-03-27 13:07',
    end_time: '2025-03-27 17:07',
    uid: '',
    session_id: '',
    aid: '',
    msg_filter: '',
    content_filter: '',
    page: 1,
    page_size: 50
  });
  
  // 字段选择
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'data_time', 'user_id', 'd1'
  ]);
  const [useLucene, setUseLucene] = useState<boolean>(true);
  const [isTimeDistribution, setIsTimeDistribution] = useState<boolean>(false);
  const [collapseLogs, setCollapseLogs] = useState<boolean>(true);
  
  // 添加错误状态
  const [error, setError] = useState<string | null>(null);
  
  // UI字段名到数据库字段的映射
  const uiToDBFieldMapping = {
    "date": "data_time",
    "id": "id",
    "sessionId": "entrance_id",
    "level": "category",
    "msg": "d1",
    "domain": "d2",
    "origin": "d3",
    "country": "d37",
    "province": "d40",
    "city": "d38",
    "isp": "d39",
    "ip": "d36",
    "platform": "platform",
    "os": "os",
    "osVer": "os_ver",
    "model": "model",
    "deviceId": "device_id",
    "version": "version",
    "sdkVer": "sdk_ver",
    "aid": "app_id"
  };

  // 数据库字段到UI字段名的映射
  const dbToUIFieldMapping = {
    "data_time": "date",
    "id": "id",
    "entrance_id": "sessionId",
    "category": "level",
    "d1": "msg",
    "d2": "domain",
    "d3": "origin",
    "d37": "country",
    "d40": "province",
    "d38": "city",
    "d39": "isp",
    "d36": "ip",
    "platform": "platform",
    "os": "os",
    "os_ver": "osVer",
    "model": "model",
    "device_id": "deviceId",
    "version": "version",
    "sdk_ver": "sdkVer",
    "app_id": "aid"
  };
  
  // 初始化数据
  useEffect(() => {
    // 加载字段列表
    const fetchLogFields = async () => {
      try {
        const response = await getLogFields();
        if (response.success) {
          setFields(response.data || []);
        }
      } catch (error) {
        console.error('获取日志字段失败', error);
      }
    };
    
    // 加载项目列表
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        if (response.success) {
          setProjects(response.data || []);
        }
      } catch (error) {
        console.error('获取项目列表失败', error);
      }
    };
    
    // 加载日志类型列表
    const fetchLogTypes = async () => {
      try {
        const response = await getLogTypes();
        if (response.success) {
          setLogTypes(response.data || []);
        }
      } catch (error) {
        console.error('获取日志类型列表失败', error);
      }
    };
    
    // 初始加载日志
    loadLogs();
    
    // 加载其他数据
    fetchLogFields();
    fetchProjects();
    fetchLogTypes();
  }, []);
  
  // 加载日志数据
  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await queryLogs({
        ...filters,
        page: currentPage,
        page_size: pageSize
      });
      
      if (response.success) {
        setLogs(response.data || []);
        setTotal(response.total || 0);
        // 更新数据库总条数
        if (response.dbTotalCount) {
          setDbTotalCount(response.dbTotalCount);
        }
        
        // 如果成功获取数据，清除错误消息
        setError(null);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      console.error('查询日志失败', error);
      setError('网络错误：无法连接到服务器，请检查网络连接或联系管理员');
    } finally {
      setLoading(false);
    }
  };
  
  // 分页变化时重新加载
  useEffect(() => {
    loadLogs();
  }, [currentPage, pageSize]);
  
  // 处理标签页变更
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  // 处理顶部导航栏变更
  const handleNavTabChange = (key: string) => {
    setActiveNavTab(key);
    
    // 根据导航栏选择调整筛选条件
    if (key === 'page') {
      setFilters({
        ...filters,
        log_type: '页面访问日志'
      });
    } else if (key === 'custom') {
      setFilters({
        ...filters,
        log_type: '自定义事件日志'
      });
    } else {
      setFilters({
        ...filters,
        log_type: '全部日志'
      });
    }
  };
  
  // 处理筛选条件变更
  const handleFilterChange = (name: string, value: any) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // 搜索日志
  const handleSearch = () => {
    setCurrentPage(1); // 重置为第一页
    loadLogs();
  };
  
  // 清空筛选条件
  const handleClear = () => {
    setFilters({
      project: '腾讯云前端监控项目Web-?20000.2:demo',
      log_type: '全部日志',
      start_time: '2025-03-27 13:07',
      end_time: '2025-03-27 17:07',
      uid: '',
      session_id: '',
      aid: '',
      msg_filter: '',
      content_filter: '',
      page: 1,
      page_size: 50
    });
  };
  
  // 重置按钮
  const handleReset = () => {
    handleClear();
    loadLogs();
  };
  
  // 导出日志数据
  const handleExport = () => {
    exportLogs(filters)
      .then(() => {
        // 导出成功，不需要额外操作，因为exportLogs函数中已经处理了下载
      })
      .catch(error => {
        console.error('导出日志失败', error);
        alert('导出失败，请重试');
      });
  };
  
  // 修改toggleField函数，使用新的接口
  const handleFieldSelect = (fieldKeys: string[]) => {
    // 保存选中的字段
    setSelectedFields(fieldKeys);
    
    // 如果没有字段被选中，确保表格不会完全空白
    if (fieldKeys.length === 0) {
      console.log('没有选中任何字段');
    }
  };
  
  // 查看日志详情
  const handleViewLogDetail = async (log: LogEntry) => {
    try {
      const response = await getLogDetail(log.id);
      if (response.success) {
        setSelectedLog(response.data || null);
        setShowDetailPanel(true);
      }
    } catch (error) {
      console.error('获取日志详情失败', error);
    }
  };
  
  // 关闭日志详情
  const handleCloseDetail = () => {
    setShowDetailPanel(false);
    setSelectedLog(null);
  };
  
  // 根据日志级别获取样式
  const getSeverityClass = (level: string) => {
    if (level === 'ERROR' || level === 'error') return 'red';
    if (level === 'WARNING' || level === 'warning') return 'orange';
    if (level === 'INFO' || level === 'info') return 'green';
    if (level === 'DEBUG' || level === 'debug') return 'blue';
    return 'grey';
  };
  
  // 替换之前的renderFieldSelector函数
  const renderFieldSelector = () => {
    // 如果有选中的日志，传给DynamicLogForm组件
    const logData = selectedLog || (logs.length > 0 ? logs[0] : null);
    
    return (
      <div className="field-selector">
        <DynamicLogForm 
          data={logData} 
          onFieldSelect={handleFieldSelect}
          selectedFields={selectedFields}
        />
      </div>
    );
  };
  
  // 渲染网络部分
  const renderNetworkSection = () => {
    if (!selectedLog) return null;
    
    return (
      <div className="log-network-section">
        <h3>网络</h3>
        <div className="network-tags">
          <div className="tag-item">
            <span className="tag-label">netType</span>
            <span className="tag-value">{selectedLog.netType || '4G'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">uid</span>
            <span className="tag-value">{selectedLog.userId || selectedLog.user_id || '1743066417'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">aid</span>
            <span className="tag-value">{selectedLog.aid || '5902907f-297f-4003-959a-c07ae03a21...'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">sessionid</span>
            <span className="tag-value">{selectedLog.sessionId || 'session-174306647574'}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染地域部分
  const renderRegionSection = () => {
    if (!selectedLog) return null;
    
    return (
      <div className="log-region-section">
        <h3>地域</h3>
        <div className="region-tags">
          <div className="tag-item">
            <span className="tag-label">ip</span>
            <span className="tag-value">{selectedLog.ip || '39.145.33.121'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">ipVersion</span>
            <span className="tag-value">ipv4</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">isAbroad</span>
            <span className="tag-value">1</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">country</span>
            <span className="tag-value">{selectedLog.country || '中国'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">province</span>
            <span className="tag-value">{selectedLog.province || '安徽省'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">city</span>
            <span className="tag-value">{selectedLog.city || '合肥市'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">isp</span>
            <span className="tag-value">{'Telstra Corporation Limited'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">region</span>
            <span className="tag-value">{'合肥市'}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染设备部分
  const renderDeviceSection = () => {
    if (!selectedLog) return null;
    
    return (
      <div className="log-device-section">
        <h3>设备</h3>
        <div className="device-icons">
          <div className="device-icon">
            <div className="browser-icon">
              <Icon type="browser" />
              <span>Safari/119.0.6045.123</span>
            </div>
          </div>
          <div className="device-icon">
            <div className="os-icon">
              <Icon type="linux" />
              <span>Linux x86_64</span>
            </div>
          </div>
        </div>
        <div className="device-tags">
          <div className="tag-item">
            <span className="tag-label">browser</span>
            <span className="tag-value">{selectedLog.browser || 'Safari/119.0.6045.123'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">os</span>
            <span className="tag-value">{selectedLog.os || selectedLog.OS || 'Linux x86_64'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">platform</span>
            <span className="tag-value">{selectedLog.platform || 'Linux'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">brand</span>
            <span className="tag-value">{selectedLog.brand || 'X11'}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">device</span>
            <span className="tag-value">{selectedLog.device || selectedLog.deviceId || ''}</span>
          </div>
          <div className="tag-item">
            <span className="tag-label">engine</span>
            <span className="tag-value">{selectedLog.engine || 'AppleWebKit/537.36'}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // 日志详情部分改为动态渲染所有字段
  const renderLogDetails = () => {
    if (!selectedLog) return null;
    
    // 将selectedLog对象的所有字段分类
    const basicProps = ['id', 'data_time', 'time', 'category', 'app_id', 'entrance_id', 'entrance_time', 'stamp'];
    const contentProps = ['d1', 'd2', 'd3', 'action', 'label', 'value', 'state', 'extra'];
    const deviceProps = ['os', 'os_ver', 'platform', 'model', 'device_id', 'sdk_ver', 'build_id', 'version'];
    const locationProps = ['d36', 'd37', 'd38', 'd39', 'd40'];
    
    // 筛选出自定义数据字段 (d1-d40, v1-v40, sd1-sd20, sv1-sv10, ud1-ud20, uv1-uv10)
    const customDataProps = Object.keys(selectedLog).filter(key => {
      return /^(d|v|sd|sv|ud|uv)\d+$/.test(key) && selectedLog[key] !== null && selectedLog[key] !== undefined && selectedLog[key] !== '';
    });
    
    // 筛选出其他数据字段（不在上述分类中的）
    const otherProps = Object.keys(selectedLog).filter(key => {
      return !basicProps.includes(key) && 
             !contentProps.includes(key) && 
             !deviceProps.includes(key) && 
             !locationProps.includes(key) && 
             !customDataProps.includes(key) &&
             key !== 'extData' && 
             key !== 'stackTrace' &&
             selectedLog[key] !== null && 
             selectedLog[key] !== undefined && 
             selectedLog[key] !== '';
    });
    
    return (
      <div className="log-detail-container">
        <div className="log-detail-card">
          <div className="log-detail-props">
            {/* 基本属性 */}
            <section>
              <h3>基本信息</h3>
              <Row gutter={16}>
                {basicProps.map(key => {
                  if (selectedLog[key] === undefined || selectedLog[key] === null || selectedLog[key] === '') return null;
                  return (
                    <Col span={12} key={key}>
                      <div className="prop-item">
                        <span className="prop-label">{key}</span>
                        <span className="prop-value">{
                          typeof selectedLog[key] === 'object' 
                            ? JSON.stringify(selectedLog[key]) 
                            : selectedLog[key]
                        }</span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </section>
            
            {/* 网络信息 */}
            <section>
              <h3>网络信息</h3>
              <Row gutter={16}>
                {contentProps.map(key => {
                  if (selectedLog[key] === undefined || selectedLog[key] === null || selectedLog[key] === '') return null;
                  return (
                    <Col span={12} key={key}>
                      <div className="prop-item">
                        <span className="prop-label">{key}</span>
                        <span className="prop-value">{
                          key === 'd1' && selectedLog[key]
                            ? <a href={selectedLog[key] as string} target="_blank" rel="noopener noreferrer">{selectedLog[key]}</a>
                            : selectedLog[key]
                        }</span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </section>
            
            {/* 设备信息 */}
            <section>
              <h3>设备信息</h3>
              <Row gutter={16}>
                {deviceProps.map(key => {
                  if (selectedLog[key] === undefined || selectedLog[key] === null || selectedLog[key] === '') return null;
                  return (
                    <Col span={12} key={key}>
                      <div className="prop-item">
                        <span className="prop-label">{key}</span>
                        <span className="prop-value">{selectedLog[key]}</span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </section>
            
            {/* 地域信息 */}
            <section>
              <h3>地域信息</h3>
              <Row gutter={16}>
                {locationProps.map(key => {
                  if (selectedLog[key] === undefined || selectedLog[key] === null || selectedLog[key] === '') return null;
                  return (
                    <Col span={12} key={key}>
                      <div className="prop-item">
                        <span className="prop-label">{key}</span>
                        <span className="prop-value">{selectedLog[key]}</span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </section>
            
            {/* 自定义数据字段 */}
            {customDataProps.length > 0 && (
              <section>
                <h3>自定义数据</h3>
                <div className="custom-data-items">
                  {customDataProps.map(key => (
                    <div className="custom-data-item" key={key}>
                      <div className="custom-data-key">{key}</div>
                      <div className="custom-data-value">{
                        typeof selectedLog[key] === 'object'
                          ? JSON.stringify(selectedLog[key])
                          : selectedLog[key]
                      }</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* 其他属性 */}
            {otherProps.length > 0 && (
              <section>
                <h3>其他信息</h3>
                <Row gutter={16}>
                  {otherProps.map(key => (
                    <Col span={12} key={key}>
                      <div className="prop-item">
                        <span className="prop-label">{key}</span>
                        <span className="prop-value">{
                          typeof selectedLog[key] === 'object'
                            ? JSON.stringify(selectedLog[key])
                            : selectedLog[key]
                        }</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </section>
            )}
            
            {/* 扩展数据 */}
            {selectedLog.extData && (
              <section>
                <h3>扩展数据</h3>
                <div className="extra-content">
                  <pre>{JSON.stringify(selectedLog.extData, null, 2)}</pre>
                </div>
              </section>
            )}
            
            {/* 堆栈跟踪 */}
            {selectedLog.stackTrace && (
              <section>
                <h3>堆栈跟踪</h3>
                <div className="stack-content">
                  <pre>{selectedLog.stackTrace}</pre>
                </div>
              </section>
            )}
          </div>
          
          <div className="log-detail-actions">
            <Button type="weak" onClick={handleCloseDetail}>关闭</Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="log-viewer-container">
      <div className="log-viewer-header">
        <h1>日志查询</h1>
        <div className="location-selector">
          <span>
            <Icon type="location" />
          </span>
          <Select 
            options={[
              { value: 'guangzhou', text: '广州' },
              { value: 'shanghai', text: '上海' },
              { value: 'beijing', text: '北京' }
            ]}
            value="guangzhou"
            type="simulate"
            size="m"
            placeholder="选择地区"
          />
        </div>
      </div>
      
      <div className="top-nav">
        <a 
          className={activeNavTab === 'history' ? 'active' : ''} 
          onClick={() => handleNavTabChange('history')}
        >
          历史日志
        </a>
        <a 
          className={activeNavTab === 'page' ? 'active' : ''} 
          onClick={() => handleNavTabChange('page')}
        >
          页面访问日志
        </a>
        <a 
          className={activeNavTab === 'custom' ? 'active' : ''} 
          onClick={() => handleNavTabChange('custom')}
        >
          自定义事件日志
        </a>
      </div>
      
      <Card>
        <Card.Body>
          <Form>
            <section>
              <Row>
                <Col span={12}>
                  <Form.Item label="">
                    <Select
                      options={projects.length > 0 ? projects : [
                        { value: '腾讯云前端监控项目Web-?20000.2:demo', text: '腾讯云前端监控项目Web-?20000.2:demo' }
                      ]}
                      value={filters.project}
                      onChange={(value) => handleFilterChange('project', value)}
                      size="full"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="">
                    <Select
                      options={logTypes.length > 0 ? logTypes : [
                        { value: '全部日志', text: '全部日志' },
                        { value: '页面访问日志', text: '页面访问日志' },
                        { value: '自定义事件日志', text: '自定义事件日志' }
                      ]}
                      value={filters.log_type}
                      onChange={(value) => handleFilterChange('log_type', value)}
                      size="full"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </section>
            
            <section className="filter-row">
              <div className="filter-label">筛选</div>
              <div className="date-range-picker">
                <DatePicker.RangePicker
                  value={[filters.start_time || '', filters.end_time || '']}
                  onChange={(dates) => {
                    if (Array.isArray(dates) && dates.length === 2) {
                      handleFilterChange('start_time', dates[0]);
                      handleFilterChange('end_time', dates[1]);
                    }
                  }}
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  defaultTimeStart="13:07"
                  defaultTimeEnd="17:07"
                  placeholder={['开始时间', '结束时间']}
                  maxLength={1000}
                  bordered
                />
              </div>
              <Button type="primary" onClick={handleSearch}>筛选</Button>
              <Button type="weak" onClick={handleReset}>重置</Button>
            </section>
            
            <section>
              <Row>
                <Col span={8}>
                  <Form.Item label="">
                    <Input
                      value={filters.uid || ''}
                      onChange={(value) => handleFilterChange('uid', value)}
                      placeholder="输入 UID (用户唯一标识)"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="">
                    <Input
                      value={filters.session_id || ''}
                      onChange={(value) => handleFilterChange('session_id', value)}
                      placeholder="输入 SessionID"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="">
                    <Input
                      value={filters.aid || ''}
                      onChange={(value) => handleFilterChange('aid', value)}
                      placeholder="输入 AID"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </section>
            
            <section>
              <Row>
                <Col span={12}>
                  <Form.Item label="">
                    <Input
                      value={filters.msg_filter || ''}
                      onChange={(value) => handleFilterChange('msg_filter', value)}
                      placeholder="日志信息msg字段搜索"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="">
                    <Input
                      value={filters.content_filter || ''}
                      onChange={(value) => handleFilterChange('content_filter', value)}
                      placeholder="日志信息内容字段搜索"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </section>
            
            <section>
              <Row>
                <Col span={8}>
                  <Form.Item label="">
                    <Button type="primary" onClick={handleSearch}>聚合分析</Button>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <div className="lucene-toggle">
                    <div className="toggle-switch">
                      <div className={`toggle-track ${useLucene ? 'active' : ''}`}>
                        <div className="toggle-indicator"></div>
                      </div>
                      <div className="toggle-label">启用 Lucene 语法</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </section>
          </Form>
          
          <div className="log-content">
            <section>
              <Row>
                <Col span={5}>
                  <div className="log-sidebar">
                    {renderFieldSelector()}
                  </div>
                </Col>
                <Col span={19}>
                  <div className="log-main">
                    <div className="log-table-container">
                      <div className="log-table-header">
                        <div className="log-count">
                          已加载 {logs.length} 条，当前查询结果: {total}条，数据库总条数: {dbTotalCount}
                        </div>
                        <div className="log-options">
                          <Checkbox checked={collapseLogs} onChange={() => setCollapseLogs(!collapseLogs)}>
                            折叠相似日志
                          </Checkbox>
                          <Checkbox checked={isTimeDistribution} onChange={() => setIsTimeDistribution(!isTimeDistribution)}>
                            时间段分布
                          </Checkbox>
                          <Button 
                            type="weak" 
                            onClick={handleExport}
                          >
                            <span>↓ 下载</span>
                          </Button>
                        </div>
                      </div>
                      
                      {/* 分页控制区域 */}
                      <div className="pagination-area">
                        <div className="page-size-selector">
                          <span>每页展示:</span>
                          <select
                            className="page-size-select"
                            value={String(pageSize)}
                            onChange={(e) => {
                              setPageSize(parseInt(e.target.value));
                              setCurrentPage(1); // 重置到第一页
                            }}
                          >
                            <option value="10">10条</option>
                            <option value="20">20条</option>
                            <option value="50">50条</option>
                            <option value="100">100条</option>
                          </select>
                        </div>
                        
                        <div className="pagination-controls">
                          <button 
                            className="tea-btn tea-btn--weak pagination-btn"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            上一页
                          </button>
                          <span className="current-page">第 {currentPage} 页</span>
                          <button 
                            className="tea-btn tea-btn--weak pagination-btn"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={logs.length < pageSize || total <= currentPage * pageSize}
                          >
                            下一页
                          </button>
                        </div>
                      </div>
                      
                      <div className={loading ? 'loading-container' : ''}>
                        {loading && <div className="tea-loading__circle"></div>}
                        
                        {error && (
                          <div className="error-container">
                            <div className="error-message">
                              <Icon type="error" />
                              <span>{error}</span>
                            </div>
                            <Button type="primary" onClick={loadLogs}>重试</Button>
                          </div>
                        )}
                        
                        <Table records={logs} recordKey="id" bordered onRowClick={handleViewLogDetail}>
                          <Table.Column key="severity" header="" width={10} render={(record: LogEntry) => (
                            <div className={`log-severity ${getSeverityClass(record.level || record.category || 'INFO')}`} />
                          )} />
                          
                          {selectedFields.includes('data_time') && (
                            <Table.Column key="data_time" header={
                              <div className="sortable-header">
                                <span>{dbToUIFieldMapping['data_time'] || 'date'}</span>
                                <Icon type="down-triangle" />
                              </div>
                            } width={180} render={(record: LogEntry) => (
                              <span className="log-time">{record.data_time || record.timestamp || record.time || '2025-03-27 17:07:00.288'}</span>
                            )} />
                          )}
                          
                          {/* 动态渲染所有选中的字段 */}
                          {selectedFields.map(field => {
                            // 跳过已经处理的特殊字段
                            if (field === 'data_time') return null;
                            
                            // 设置不同字段的显示宽度
                            let width: number | undefined = undefined;
                            if (field === 'id') width = 200;
                            if (field === 'user_id') width = 120; // uid
                            if (field === 'd1') width = 150; // msg
                            if (field === 'entrance_id') width = 150; // sessionId
                            if (field === 'category') width = 100; // level
                            if (field === 'app_id') width = 100; // aid
                            
                            // 获取UI显示名称
                            const uiFieldName = dbToUIFieldMapping[field] || field;
                            
                            return (
                              <Table.Column 
                                key={field} 
                                header={uiFieldName}
                                width={width}
                                render={(record: LogEntry) => {
                                  const value = record[field];
                                  
                                  // 如果字段值为对象，显示JSON字符串
                                  if (typeof value === 'object' && value !== null) {
                                    return <span>{JSON.stringify(value)}</span>;
                                  }
                                  
                                  // 如果是链接类型的字段
                                  if (field === 'd1' && value) {
                                    return <a href={value as string} target="_blank" rel="noopener noreferrer">{value}</a>;
                                  }
                                  
                                  // 普通字段值
                                  return <span>{value || '-'}</span>;
                                }} 
                              />
                            );
                          })}
                          
                          {/* 如果没有选中任何字段，显示提示信息 */}
                          {selectedFields.length === 0 && (
                            <Table.Column 
                              key="no-fields" 
                              header="请选择要显示的字段"
                              render={() => (
                                <span className="no-fields-message">请在左侧选择要显示的字段</span>
                              )} 
                            />
                          )}
                        </Table>
                      </div>
                    </div>
                    
                    {selectedLog && renderLogDetails()}
                  </div>
                </Col>
              </Row>
            </section>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LogViewer; 