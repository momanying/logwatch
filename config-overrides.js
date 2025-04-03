const path = require('path');

module.exports = function override(config) {
  // 添加别名配置
  config.resolve.alias = {
    ...config.resolve.alias,
    '@tencent/tea-component': path.resolve(__dirname, 'src/mock-tea-component.js'),
  };
  
  return config;
}; 