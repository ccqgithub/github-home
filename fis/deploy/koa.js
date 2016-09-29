var childProcess = require('child_process');
var program = require('commander');
var path = require('path');
var fs = require('fs');

var projectPath = path.join(__dirname, '../');
var conf = require('../package.json');

program
  .version(conf.version)
  .option('-p, --port [port]', '[fis server:] Specify the port(5002 by default)', parseInt)
  .parse(process.argv);

// fis
var port = program.port || 5002;

// 创建目录
function mkdirsSync(dirname, mode) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname), mode)) {
      fs.mkdirSync(dirname, mode);
      return true;
    }
  }
}

function stopServer() {
  var fisCommand = 'pm2 delete nH-admin';
  var child;

  try {
    child = childProcess.execSync(fisCommand, {
      stdio: 'inherit'
    });
  } catch (e) {
    console.log(e.message);
  }
}

// 启动pm2
function startServer() {
  var serverJs = path.join(projectPath, 'server/app.js');
  var logFile = path.join(projectPath, 'server/log/pm2.log');
  var fisCommand = 'pm2 start '+ serverJs +' --name nH-admin -f --log='+ logFile + ' -- ' + '--env prod --port '+ port;
  var child;

  mkdirsSync(path.dirname(logFile));
  child = childProcess.execSync(fisCommand, {
    stdio: 'inherit'
  });
}

// release
function release() {
  var fisCommand, child;

  console.log('release prod begin');
  fisCommand = 'fis3 release prod -c';
  child = childProcess.execSync(fisCommand, {
    stdio: 'inherit'
  });
  console.log('release prod end');
}


release();
stopServer();
startServer();
