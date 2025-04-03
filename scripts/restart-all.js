const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
console.log('正在重启所有服务...');

// 运行停止脚本
const stopScript = spawn('node', ['scripts/stop-all.js'], { cwd: projectRoot, stdio: 'inherit', shell: true });

// 停止完成后运行启动脚本
stopScript.on('close', (code) => {
  console.log(`停止服务完成，退出码: ${code}`);
  console.log('等待3秒后重新启动所有服务...');
  
  setTimeout(() => {
    const startScript = spawn('node', ['scripts/start-all.js'], { cwd: projectRoot, stdio: 'inherit', shell: true });
    
    startScript.on('close', (startCode) => {
      if (startCode !== 0) {
        console.error(`启动服务失败，退出码: ${startCode}`);
        process.exit(startCode);
      }
    });
  }, 3000);
}); 