import React, { useState } from 'react';
import LogViewer from './LogViewer';
import '../styles/App.css';

const App: React.FC = () => {
  // 可以添加其他状态或逻辑
  
  return (
    <div className="app-container">
      <LogViewer />
    </div>
  );
};

export default App; 