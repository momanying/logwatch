import React, { useEffect, useState } from 'react';
import { Loading } from '@tencent/tea-component';
import '../styles/LogViewer.css';
import axios from 'axios';

// 导入修复后的组件
import teaComponent from '../mock-tea-component-fixed';

const { 
  Table, Card, Form, Button, Text, 
  Tabs, Justify
} = teaComponent;

const KV7LogViewer: React.FC = () => {
  // 状态
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 初始化数据
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('正在从指定URL加载KV7日志数据');
        
        // 直接使用完整URL，不带任何额外参数
        const response = await axios.get('http://localhost:8888/api/query?table=kv_7&limit=50');
        
        console.log('成功获取KV7日志数据:', response);
        
        // 检查返回的数据是否为数组
        if (Array.isArray(response.data)) {
          setLogs(response.data);
          setError(null);
        } else {
          console.error('API返回的数据不是数组:', response.data);
          setError('API返回的数据格式错误');
          setLogs([]);
        }
      } catch (err) {
        console.error('查询KV7表数据时发生异常:', err);
        setError('网络错误：无法连接到服务器');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadLogs();
  }, []);
  
  // 处理查看日志详情
  const handleViewLogDetail = (log: any) => {
    setSelectedLog(log);
    setShowDetailPanel(true);
  };
  
  // 关闭详情面板
  const handleCloseDetail = () => {
    setShowDetailPanel(false);
    setSelectedLog(null);
  };
  
  // 手动刷新数据
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // 渲染详情面板
  const renderDetailPanel = () => {
    if (!selectedLog) return null;
    
    return (
      <div className="log-detail-panel">
        <div className="detail-header">
          <h3>日志详情</h3>
          <Button type="link" onClick={handleCloseDetail}>关闭</Button>
        </div>
        <div className="detail-content">
          {Object.entries(selectedLog).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-key">{key}:</span>
              <span className="detail-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value || '-')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染加载动画
  const renderLoading = () => {
    if (!loading) return null;
    return (
      <div className="loading-overlay">
        <Loading />
      </div>
    );
  };

  // 渲染错误信息
  const renderError = () => {
    if (!error) return null;
    return (
      <div className="error-message">
        <Text theme="danger">{error}</Text>
        <div style={{ marginTop: '10px' }}>
          <Button type="weak" onClick={handleRefresh}>
            重试
          </Button>
        </div>
      </div>
    );
  };

  // 渲染表格
  const renderTable = () => {
    if (loading && logs.length === 0) {
      return <Text>正在加载数据...</Text>;
    }
    
    if (logs.length === 0) {
      return <Text>暂无数据</Text>;
    }

    // 从数据中提取重要字段
    const sampleLog = logs[0] || {};
    const allFields = Object.keys(sampleLog);
    
    // 优先显示的重要字段
    const importantFields = [
      'action', 'platform', 'category', 'app_id', 'user_id', 
      'os', 'os_ver', 'device_id', 'model', 'version', 
      'data_time', 'label', 'msg'
    ].filter(field => allFields.includes(field));
    
    // 添加其他字段
    const columns = importantFields.map(key => ({
      key,
      header: key,
      width: key === 'data_time' ? 180 : 
             key === 'user_id' ? 120 : 
             key === 'app_id' ? 150 : 120,
      render: (x: any) => {
        const value = x[key];
        if (value === null || value === undefined) return '-';
        if (typeof value === 'object') return JSON.stringify(value);
        
        // 处理时间格式
        if ((key === 'data_time' || key.includes('time')) && 
            (typeof value === 'string' || typeof value === 'number')) {
          try {
            const date = new Date(value);
            return date.toLocaleString();
          } catch (e) {
            return String(value);
          }
        }
        
        return String(value);
      }
    }));

    return (
      <Table 
        columns={columns}
        records={logs}
        recordKey="id"
        onRow={(record) => ({
          onClick: () => handleViewLogDetail(record)
        })}
      />
    );
  };

  return (
    <div className="log-viewer-container">
      <Card>
        <Card.Body title="KV7表数据查询" subtitle="点击行查看详细信息">
          {renderError()}
          <div className="log-table-container" style={{ position: 'relative', minHeight: '300px' }}>
            {renderLoading()}
            {renderTable()}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={handleRefresh}>刷新</Button>
          </div>
        </Card.Body>
      </Card>
      {showDetailPanel && renderDetailPanel()}
    </div>
  );
};

export default KV7LogViewer; 