var childProcess = require('child_process');
var program = require('commander');
var path = require('path');
var fs = require('fs');

var projectPath = process.cwd();
var conf = require('../package.json');

program
  .version(conf.version)
  .option('-p, --port [port]', '[fis server:] Specify the port(8080 by default)', parseInt)
  .option('-env, --env [env]', '[fis server:] Specify the test type(dev or uat, dev by default)')
  .parse(process.argv);

// fis
var envType = program.env || 'dev';
var serverRoot = path.join(projectPath, './server');
var toServerJs = path.join(projectPath, './server/server.js');
var port = program.port || 8181;

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

// 清理server并启动server
function execServerStart() {
  var fisCommand, child;

  fisCommand = 'fis3 server clean';
  child = childProcess.execSync(fisCommand, {
    stdio: 'inherit'
  });

  copyConf();

  fisCommand = 'fis3 server start --type node --www ' + serverRoot + ' --port ' + port;
  child = childProcess.execSync(fisCommand, {
    stdio: 'inherit'
  });


  release();
}

// 复制server.conf
function copyConf() {
  var fromServerJs = path.join(projectPath, './deploy/local-' + envType + '-server.js');
  var fisCommand = 'cp ' + fromServerJs + ' ' + toServerJs;
  var child;

  mkdirsSync(path.dirname(toServerJs));
  child = childProcess.execSync(fisCommand, {
    stdio: 'inherit'
  });
}

// release
function release() {
  var child = childProcess.spawn('fis3', [
    'release', '-w'
  ], {stdio: 'inherit'});
}

execServerStart();
