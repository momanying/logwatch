import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App';

// 重写history.pushState以避免路由重复渲染
const originalPushState = window.history.pushState;
window.history.pushState = function (...args) {
  // 执行原始pushState
  const result = originalPushState.apply(this, args);
  // 触发popstate事件以通知React Router
  window.dispatchEvent(new Event('popstate'));
  return result;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 