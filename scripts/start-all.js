const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = os.platform() === 'win32';
const projectRoot = path.resolve(__dirname, '..');

console.log('正在启动所有服务...');

// 检查Docker是否运行
function checkDocker() {
  return new Promise((resolve, reject) => {
    exec('docker info', (error) => {
      if (error) {
        console.error('[错误] Docker服务未运行，请先启动Docker');
        reject(error);
      } else {
        console.log('Docker服务正常运行');
        resolve();
      }
    });
  });
}

// 启动ClickHouse容器
function startClickHouse() {
  console.log('检查ClickHouse容器...');
  return new Promise((resolve, reject) => {
    // 读取容器名称
    const containerName = process.env.CLICKHOUSE_CONTAINER_NAME || 'clickhouse-server';
    console.log(`使用ClickHouse容器: ${containerName}`);
    
    // 检查指定容器是否在运行
    exec(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`, (error, stdout) => {
      if (error) {
        console.error('Docker 命令执行失败:', error);
        reject(error);
        return;
      }
      
      const output = stdout.trim();
      if (!output) {
        console.log(`容器 ${containerName} 未运行，尝试启动...`);
        
        // 尝试启动已存在但未运行的容器
        exec(`docker container ls -a --filter "name=${containerName}" --format "{{.Names}}"`, (err, containerStdout) => {
          if (containerStdout.trim()) {
            // 容器存在但没运行，启动它
            spawn('docker', ['start', containerName], { stdio: 'inherit', shell: true })
              .on('close', (code) => {
                if (code === 0) {
                  console.log(`容器 ${containerName} 已启动`);
                  setTimeout(resolve, 5000); // 等待数据库启动
                } else {
                  console.error(`启动容器 ${containerName} 失败`);
                  reject(new Error(`启动容器失败，退出码: ${code}`));
                }
              });
          } else {
            // 容器不存在，如果默认的容器配置与docker-compose.yml文件匹配
            if (containerName === 'clickhouse-server') {
              console.log('使用docker-compose创建新容器...');
              const dockerDown = spawn('docker-compose', ['down'], { cwd: projectRoot, shell: true });
              
              dockerDown.on('close', () => {
                const dockerUp = spawn('docker-compose', ['up', '-d'], { 
                  cwd: projectRoot, 
                  stdio: 'inherit',
                  shell: true 
                });
                
                dockerUp.on('close', (code) => {
                  if (code === 0) {
                    console.log('Docker容器启动完成');
                    setTimeout(resolve, 10000); // 等待10秒让ClickHouse完全启动
                  } else {
                    console.error(`启动容器失败，退出码: ${code}`);
                    reject(new Error(`启动容器失败，退出码: ${code}`));
                  }
                });
              });
            } else {
              console.error(`指定的容器 ${containerName} 不存在，请使用Docker Desktop检查`);
              reject(new Error(`容器 ${containerName} 不存在`));
            }
          }
        });
      } else {
        console.log(`容器 ${containerName} 已在运行`);
        resolve();
      }
    });
  });
}

// 导入测试数据
function importTestData() {
  console.log('导入初始化数据...');
  return new Promise((resolve) => {
    const sqlFile = path.join(projectRoot, 'init_db.sql');
    
    // 检查SQL文件是否存在
    if (!fs.existsSync(sqlFile)) {
      console.log('初始化SQL文件不存在，跳过数据导入');
      resolve();
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    const containerName = process.env.CLICKHOUSE_CONTAINER_NAME || 'clickhouse-server';
    
    console.log(`使用容器 ${containerName} 导入数据...`);
    const importCmd = spawn('docker', 
      ['exec', '-i', containerName, 'clickhouse-client', '--multiquery'], 
      { cwd: projectRoot, shell: true });
    
    importCmd.stdin.write(sqlContent);
    importCmd.stdin.end();
    
    importCmd.on('close', (code) => {
      console.log(`数据导入完成，退出码: ${code}`);
      resolve();
    });
  });
}

// 启动后端服务
function startBackend() {
  console.log('启动后端服务...');
  const serverPath = path.join(projectRoot, 'server');
  
  const goCmd = isWindows ? 
    spawn('cmd', ['/c', 'go run main.go'], { cwd: serverPath, detached: true, stdio: 'inherit', shell: true }) :
    spawn('go', ['run', 'main.go'], { cwd: serverPath, detached: true, stdio: 'inherit' });
  
  goCmd.unref();
  
  return new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒后端启动
}

// 启动前端服务
function startFrontend() {
  console.log('启动前端服务...');
  const srcPath = path.join(projectRoot, 'src');
  
  const npmCmd = isWindows ?
    spawn('cmd', ['/c', 'npm start'], { cwd: srcPath, detached: true, stdio: 'inherit', shell: true }) :
    spawn('npm', ['start'], { cwd: srcPath, detached: true, stdio: 'inherit' });
  
  npmCmd.unref();
  
  return Promise.resolve();
}

// 按顺序执行所有步骤
async function startAll() {
  try {
    await checkDocker();
    await startClickHouse();
    await importTestData();
    await startBackend();
    await startFrontend();
    
    console.log('\n所有服务已启动！');
    console.log('前端：http://localhost:3000');
    console.log('后端：http://localhost:8888');
    console.log('ClickHouse HTTP：http://localhost:8123');
    console.log('ClickHouse Native：localhost:9000');
    console.log('\n按Ctrl+C停止此脚本，然后运行 npm run stop:all 停止所有服务');
    
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

startAll(); 