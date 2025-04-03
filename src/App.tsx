import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LogViewer from './components/LogViewer';
import SimpleSQL from './components/SimpleSQL';
import DataAnalytics from './components/DataAnalytics';
import DateRangeExample from './components/DateRangeExample';
import LogQueryPage from './components/LogQueryPage';
import KV7LogViewer from './components/KV7LogViewer';
import './App.css';

// 后备组件
const TempComponent = () => <div>临时组件</div>;

// 主应用组件
const App: React.FC = () => {
  // 组件存在性检查
  const SafeLogViewer = LogViewer || TempComponent;
  const SafeSimpleSQL = SimpleSQL || TempComponent;
  const SafeDataAnalytics = DataAnalytics || TempComponent;
  const SafeDateRangeExample = DateRangeExample || TempComponent;
  const SafeLogQueryPage = LogQueryPage || TempComponent;
  const SafeKV7LogViewer = KV7LogViewer || TempComponent;

  return (
    <Routes>
      <Route path="/log-query" element={<SafeLogQueryPage />} />
      <Route path="/" element={<SafeLogQueryPage />} />
      <Route path="/page-logs" element={<SafeLogQueryPage />} />
      <Route path="/custom-logs" element={<SafeLogQueryPage />} />
      <Route path="/sql" element={<SafeSimpleSQL />} />
      <Route path="/data-analytics" element={<SafeDataAnalytics />} />
      <Route path="/date-range" element={<SafeDateRangeExample />} />
      <Route path="/kv7-logs" element={<SafeKV7LogViewer />} />
    </Routes>
  );
};

export default App; 