const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const projectRoot = path.resolve(__dirname, '..');

console.log('正在停止所有服务...');

// 停止前端和后端进程
function stopServices() {
  console.log('停止前端和后端服务...');
  
  return new Promise((resolve) => {
    if (isWindows) {
      // Windows系统使用taskkill
      exec('taskkill /F /FI "WINDOWTITLE eq *server*" /T', () => {});
      exec('taskkill /F /FI "WINDOWTITLE eq *npm start*" /T', () => {});
      exec('taskkill /F /FI "WINDOWTITLE eq *src*" /T', () => {});
      exec('taskkill /F /FI "WINDOWTITLE eq *go run*" /T', () => {});
    } else {
      // Linux/Mac系统使用pkill
      exec('pkill -f "npm start"', () => {});
      exec('pkill -f "go run main.go"', () => {});
    }
    
    setTimeout(resolve, 3000); // 等待进程完全终止
  });
}

// 停止Docker容器
function stopDocker() {
  // 检查是否使用的是自定义容器名称
  const containerName = process.env.CLICKHOUSE_CONTAINER_NAME;
  if (containerName && containerName !== 'clickhouse-server') {
    console.log(`使用的是外部容器 ${containerName}，跳过停止操作`);
    return Promise.resolve();
  }
  
  console.log('停止ClickHouse容器...');
  
  return new Promise((resolve) => {
    const dockerDown = spawn('docker-compose', ['down'], { cwd: projectRoot, shell: true });
    
    dockerDown.stdout.on('data', (data) => {
      console.log(`Docker输出: ${data}`);
    });
    
    dockerDown.stderr.on('data', (data) => {
      console.error(`Docker错误: ${data}`);
    });
    
    dockerDown.on('close', (code) => {
      console.log(`Docker容器停止完成，退出码: ${code}`);
      resolve();
    });
  });
}

// 按顺序执行停止步骤
async function stopAll() {
  try {
    await stopServices();
    await stopDocker();
    
    console.log('\n所有服务已停止！');
    
  } catch (error) {
    console.error('停止服务失败:', error);
    process.exit(1);
  }
}

stopAll(); 