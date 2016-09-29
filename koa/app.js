"use strict";

/**
 * 项目主文件
 */

var program = require('commander');
var fs = require('fs');
var path = require('path');

// 参数
program
  .option('-p, --port [port]', '[koa server:] Specify the port(5002 by default)', parseInt)
  .option('--env [env]', '[koa server:] Specify the env(dev by default)')
  .parse(process.argv);

// 配置
var configFile = path.join(__dirname, './config', (program.env || 'local') + '.js');
var config = require(configFile);

// env
process.env.DEBUG = config.debug;

var koa = require('koa');
var logger = require('koa-logger');
var morgan = require('koa-morgan');
var session = require('koa-session');
var staticServe = require('koa-static');
var views = require('koa-views');
var bodyParser = require('koa-body');
var conditional = require('koa-conditional-get');
var compress = require('koa-compress')
var etag = require('koa-etag');
var debug = require('debug')('app:boot');
var i18n = require('./helper/lang/main');
var HubAPI = require('./helper/api/hub');
var MockHelper = require('./helper/mock');

// new app
var app = koa();

app.name = 'nH-admin-server';
app.proxy = true; //如果为 true，则解析 "Host" 的 header 域，并支持 X-Forwarded-Host
app.subdomainOffset = 2; //默认为2，表示 .subdomains 所忽略的字符偏移量。

// err events
// app.on('error', function(err){
//     console.log(err);
// });

// compress
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));
// use it upstream from etag so
// that they are present
app.use(conditional());
// add etags
app.use(etag());

// 静态文件
app.use(staticServe(path.join(__dirname, '../public')));
app.use(staticServe(path.join(__dirname, './static')));

// 开启访问日志
// app.use(logger());
app.use(morgan.middleware('combined', {
  skip: function (req, res) {
    return res.statusCode == 200;
  }
}));

// 开启session
app.keys = ["You're right, taht's me !"];
app.use(session(app));

// 总入口
app.use(function * (next) {
  var
    status,
    message;

  this.compress = true;
  this.state.config = config;
  this.state.remote = {};
  this.state.locals = {};
  this.state.session = {};

  // is ajax xhr
  this.state.remote.isAjax = this.request.headers['x-requested-with'] && this
    .request
    .headers['x-requested-with']
    .toLowerCase() == 'xmlhttprequest';

  // login user
  this.state.session.user = this.session.user;

  // locale
  this.state.remote.locale = this.cookies.get('locale') || 'zh-cn';

  // locals
  this.state.locals.locale = this.state.remote.locale;
  this.state.locals.user = this.state.session.user;

  // i18n
  this.i18n = this.__ = function(msgid, msgctxt, params) {
    return i18n(msgid, msgctxt, this.state.remote.locale, params);
  }

  // hub API
  this.hubAPI = new HubAPI({
    server: this.state.config.hubAPIServer,
    locale: this.state.remote.locale,
    token: this.session.token
  });

  // mock helper
  this.mockHelper = new MockHelper({
    locale: this.state.remote.locale
  });

  try {
    yield * next;

    if (this.state.remote.isAjax) {
      this.body = {
        status: 200,
        result: this.state.result,
        message: this.state.message || 'ok'
      };
    }

  } catch (e) {
    e.message && console.log(e.message);
    console.log(e.stack || e);

    if (typeof e == 'object' && typeof e.message != 'undefined') {
      // 会话过期
      if (e.status == 410) {
        this.session.user = null;
        this.session.token = null;
      }

      status = e.status || 500;
      message = e.message;
    } else {
      status = 500;
      message = e;
    }

    if (!this.state.remote.isAjax) {
      // 会话过期
      if (e.status == 410) {
        return this.redirect('/login');
      }

      yield this.render('exception', {message: message});
    } else {
      this.body = {
        status: status || 500,
        expose: this.state.expose,
        message: message
      };
    }
  }
});

// body
app.use(bodyParser({
  multipart: true
}));

// views
app.use(views(path.join(__dirname, '../public/view'), {
  extension: 'html',
  map: {
    html: 'ejs'
  }
}));

// 加载路由
app.use(require('./router/api').routes());
app.use(require('./router/api-hub').routes());
app.use(require('./router/api-product').routes());
app.use(require('./router/api-program').routes());
app.use(require('./router/api-resource').routes());
app.use(require('./router/api-sale-type').routes());
app.use(require('./router/api-org').routes());
app.use(require('./router/api-staff').routes());
app.use(require('./router/api-user').routes());
app.use(require('./router/api-buy').routes());
app.use(require('./router/api-order').routes());
app.use(require('./router/api-upload').routes());
app.use(require('./router/main').routes());

// not found
app.use(function * (next) {
  this.throw('Not Found!', 404);
});

// 开启监听服务
var server = app.listen(program.port || 5003);
