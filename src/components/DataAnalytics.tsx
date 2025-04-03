import React, { useState, useEffect } from 'react';
import teaComponent from '../mock-tea-component-fixed';
import * as api from '../services/api';

const { 
  Card, 
  Text, 
  Button, 
  Loading, 
  Table, 
  Section, 
  Spacer, 
  DatePicker, 
  Tabs
} = teaComponent;

// 事件分析组件
const EventAnalytics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);

  useEffect(() => {
    fetchEventData();
  }, [timeRange]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEventAnalytics({
        startTime: timeRange[0].toISOString(),
        endTime: timeRange[1].toISOString()
      });
      setEventData(data);
    } catch (err) {
      setError('获取事件数据失败');
      console.error('获取事件数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Card>
          <Loading />
        </Card>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Card>
          <Text theme="danger">{error}</Text>
          <Button type="primary" onClick={fetchEventData}>重试</Button>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        <Spacer>
          <DatePicker.RangePicker
            value={timeRange}
            onChange={(range) => range && setTimeRange(range as [Date, Date])}
            format="YYYY-MM-DD"
          />
        </Spacer>
      </Card>

      <Card title="事件分析结果">
        <Text>事件分析功能正在开发中</Text>
      </Card>
    </Section>
  );
};

// 用户分布组件
const UserDistribution: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);

  useEffect(() => {
    fetchUserData();
  }, [timeRange]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserDistribution({
        startTime: timeRange[0].toISOString(),
        endTime: timeRange[1].toISOString()
      });
      setUserData(data);
    } catch (err) {
      setError('获取用户分布数据失败');
      console.error('获取用户分布数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Card>
          <Loading />
        </Card>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Card>
          <Text theme="danger">{error}</Text>
          <Button type="primary" onClick={fetchUserData}>重试</Button>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        <Spacer>
          <DatePicker.RangePicker
            value={timeRange}
            onChange={(range) => range && setTimeRange(range as [Date, Date])}
            format="YYYY-MM-DD"
          />
        </Spacer>
      </Card>

      <Card title="用户分布结果">
        <Text>用户分布功能正在开发中</Text>
      </Card>
    </Section>
  );
};

// 网络性能组件
const NetworkPerformance: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);

  useEffect(() => {
    fetchNetworkData();
  }, [timeRange]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNetworkPerformance({
        startTime: timeRange[0].toISOString(),
        endTime: timeRange[1].toISOString()
      });
      setNetworkData(data);
    } catch (err) {
      setError('获取网络性能数据失败');
      console.error('获取网络性能数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Card>
          <Loading />
        </Card>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Card>
          <Text theme="danger">{error}</Text>
          <Button type="primary" onClick={fetchNetworkData}>重试</Button>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        <Spacer>
          <DatePicker.RangePicker
            value={timeRange}
            onChange={(range) => range && setTimeRange(range as [Date, Date])}
            format="YYYY-MM-DD"
          />
        </Spacer>
      </Card>

      {networkData?.network_types && (
        <Card title="网络类型分布">
          <Table
            columns={[
              { key: 'type', header: '网络类型' },
              { key: 'count', header: '请求数' }
            ]}
            records={networkData.network_types}
          />
        </Card>
      )}

      {networkData?.response_time && (
        <Card title="响应时间分析 (ms)">
          <Table
            columns={[
              { key: 'name', header: '阶段' },
              { key: 'value', header: '平均耗时 (ms)' }
            ]}
            records={[
              { name: '总耗时', value: networkData.response_time.total || 0 },
              { name: 'DNS解析', value: networkData.response_time.dns || 0 },
              { name: 'TCP连接', value: networkData.response_time.tcp || 0 },
              { name: '请求', value: networkData.response_time.request || 0 },
              { name: '响应', value: networkData.response_time.response || 0 }
            ]}
          />
        </Card>
      )}

      {networkData?.regions && (
        <Card title="地区性能分布">
          <Table
            columns={[
              { key: 'region', header: '地区' },
              { key: 'avg_time', header: '平均响应时间 (ms)' },
              { key: 'count', header: '请求数' }
            ]}
            records={networkData.regions}
          />
        </Card>
      )}
    </Section>
  );
};

// iOS设备统计组件
const IOSDeviceStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);

  useEffect(() => {
    fetchDeviceData();
  }, [timeRange]);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIOSDeviceStats({
        startTime: timeRange[0].toISOString(),
        endTime: timeRange[1].toISOString()
      });
      setDeviceData(data);
    } catch (err) {
      setError('获取iOS设备统计数据失败');
      console.error('获取iOS设备统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Card>
          <Loading />
        </Card>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Card>
          <Text theme="danger">{error}</Text>
          <Button type="primary" onClick={fetchDeviceData}>重试</Button>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card>
        <Spacer>
          <DatePicker.RangePicker
            value={timeRange}
            onChange={(range) => range && setTimeRange(range as [Date, Date])}
            format="YYYY-MM-DD"
          />
        </Spacer>
      </Card>

      {deviceData?.devices && (
        <Card title="设备型号分布">
          <Table
            columns={[
              { key: 'model', header: '设备型号' },
              { key: 'count', header: '数量' }
            ]}
            records={deviceData.devices}
          />
        </Card>
      )}

      {deviceData?.os_versions && (
        <Card title="iOS版本分布">
          <Table
            columns={[
              { key: 'version', header: 'iOS版本' },
              { key: 'count', header: '数量' }
            ]}
            records={deviceData.os_versions}
          />
        </Card>
      )}

      {deviceData?.app_versions && (
        <Card title="应用版本分布">
          <Table
            columns={[
              { key: 'version', header: '应用版本' },
              { key: 'count', header: '数量' }
            ]}
            records={deviceData.app_versions}
          />
        </Card>
      )}

      {deviceData?.categories && (
        <Card title="日志类别分布">
          <Table
            columns={[
              { key: 'category', header: '日志类别' },
              { key: 'count', header: '数量' }
            ]}
            records={deviceData.categories}
          />
        </Card>
      )}
    </Section>
  );
};

// 主分析组件
const DataAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('network');

  // 定义标签页数组
  const tabList = [
    { id: 'events', label: '事件分析' },
    { id: 'users', label: '用户分布' },
    { id: 'network', label: '网络性能' },
    { id: 'ios', label: 'iOS设备' }
  ];

  // 渲染当前活动标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventAnalytics />;
      case 'users':
        return <UserDistribution />;
      case 'network':
        return <NetworkPerformance />;
      case 'ios':
        return <IOSDeviceStats />;
      default:
        return <NetworkPerformance />;
    }
  };

  return (
    <div>
      <Card>
        <Tabs 
          tabs={tabList.map(tab => ({ id: tab.id, label: tab.label }))} 
          activeId={activeTab}
          onActive={id => setActiveTab(id)}
        />
      </Card>
      {renderTabContent()}
    </div>
  );
};

export default DataAnalytics; 