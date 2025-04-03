const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
console.log('检查项目依赖...');

// 检查Docker是否安装
function checkDocker() {
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' });
    console.log('✅ Docker已安装:', dockerVersion.trim());
    return true;
  } catch (error) {
    console.error('❌ Docker未安装或无法运行');
    console.log('请安装Docker: https://docs.docker.com/get-docker/');
    return false;
  }
}

// 检查Docker Compose是否安装
function checkDockerCompose() {
  try {
    const dockerComposeVersion = execSync('docker-compose --version', { encoding: 'utf8' });
    console.log('✅ Docker Compose已安装:', dockerComposeVersion.trim());
    return true;
  } catch (error) {
    console.error('❌ Docker Compose未安装或无法运行');
    console.log('请安装Docker Compose: https://docs.docker.com/compose/install/');
    return false;
  }
}

// 检查Go是否安装
function checkGo() {
  try {
    const goVersion = execSync('go version', { encoding: 'utf8' });
    console.log('✅ Go已安装:', goVersion.trim());
    return true;
  } catch (error) {
    console.error('❌ Go未安装或无法运行');
    console.log('请安装Go: https://golang.org/doc/install');
    return false;
  }
}

// 检查Node.js是否安装
function checkNode() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' });
    console.log('✅ Node.js已安装:', nodeVersion.trim());
    return true;
  } catch (error) {
    console.error('❌ Node.js未安装或无法运行');
    console.log('请安装Node.js: https://nodejs.org/');
    return false;
  }
}

// 检查Go依赖
function checkGoDependencies() {
  const serverDir = path.join(projectRoot, 'server');
  
  if (!fs.existsSync(path.join(serverDir, 'go.mod'))) {
    console.error('❌ server/go.mod 文件不存在');
    return false;
  }
  
  try {
    console.log('正在检查Go依赖...');
    execSync('go mod download', { cwd: serverDir, stdio: 'inherit' });
    console.log('✅ Go依赖已安装');
    return true;
  } catch (error) {
    console.error('❌ 安装Go依赖失败');
    return false;
  }
}

// 检查前端依赖
function checkNodeDependencies() {
  const nodeModulesDir = path.join(projectRoot, 'node_modules');
  
  if (!fs.existsSync(nodeModulesDir)) {
    console.log('node_modules不存在，正在安装前端依赖...');
    try {
      execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
      console.log('✅ 前端依赖已安装');
      return true;
    } catch (error) {
      console.error('❌ 安装前端依赖失败');
      return false;
    }
  } else {
    console.log('✅ 前端依赖已存在');
    return true;
  }
}

// 检查所有依赖
function checkAllDependencies() {
  const docker = checkDocker();
  const dockerCompose = checkDockerCompose();
  const go = checkGo();
  const node = checkNode();
  
  if (!docker || !dockerCompose || !go || !node) {
    console.error('\n❌ 关键依赖缺失，请先安装所需依赖');
    return false;
  }
  
  console.log('\n所有关键依赖已安装，检查项目依赖...');
  
  const goDeps = checkGoDependencies();
  const nodeDeps = checkNodeDependencies();
  
  if (!goDeps || !nodeDeps) {
    console.error('\n❌ 项目依赖检查失败，请解决以上问题');
    return false;
  }
  
  console.log('\n✅ 所有依赖检查通过！可以启动项目了');
  console.log('使用以下命令启动项目:');
  console.log('- Windows: start.cmd');
  console.log('- Linux/Mac: ./start.sh');
  console.log('- 跨平台NPM: npm run start:all');
  
  return true;
}

// 执行依赖检查
const result = checkAllDependencies();
process.exit(result ? 0 : 1); 