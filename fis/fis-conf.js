var path = require('path');
var defineTest = require('./src/define/test');
var defineProd = require('./src/define/prod');
var domain = '';

// 需要构建的文件
fis.set('project.fileType.text', 'po');
fis.set('project.files', ['src/**', 'src_app/**',]);
fis.set('project.ignore', fis.get('project.ignore').concat(['demo/**', 'DS_store']));

// 模块化支持插件
// https://github.com/fex-team/fis3-hook-commonjs (forwardDeclaration: true)
fis.hook('commonjs', {
  extList: [
    '.js', '.coffee', '.es6', '.jsx',
  ],
  umd2commonjs: true,
  ignoreDependencies: [
    'src/scripts/engine/**',
    'src/scripts/vendor/**',
    'src_app/_src/vendor/**'
  ]
});

// 模块文件，会进行require包装
fis.match('/{node_modules,src}/**.{js,jsx}', {
  isMod: true,
  useSameNameRequire: true,
});

// 不是AMD、UMD或者CMD规范的
fis.match('src/scripts/{engine,plugin,shim}/**', {isMod: false});

// 所有文件
fis.match('src/(**)', {release: 'assets/$1'});

// html
fis.match('src/page/(**)', {release: 'page/$1'});

// app h5
fis.match('src_app/(**)', {
  release: 'app/assets/$1',
  isMod: false,
});
fis.match('src_app/app/(**)', {release: 'app/$1'});

// node_modules
fis.match('node_modules/(**)', {release: 'assets/npm/$1'});

// 所有js, jsx
fis.match('src/**.{js,jsx}', {
  rExt: 'js',
  useSameNameRequire: true,
  parser: [
    fis.plugin('babel-6.x', {
      presets: ['es2015-loose', 'react', 'stage-3']
    }),
    fis.plugin('translate-es3ify')
  ]
});

// 处理语言文件*.po
fis.match('src/**.po', {
  rExt: '.js',
  isMod: true,
  isJsLike: true,
  parser: fis.plugin('po', {
    //
  }),
});

// page js not mod
fis.match('src/scripts/page/**.{js,jsx}', {isMod: false});
fis.match('src/demo/js/**.js', {isMod: false});

// 不是es6和react模块的文件
fis.match('src/scripts/{engine,vendor,plugin,shim}/**', {parser: null});
fis.match('src/demo/js/webim/easemob*.*', {parser: null});

// 用 less 解析
fis.match('*.less', {
  rExt: 'css',
  parser: [fis.plugin('less-2.x')],
  postprocessor: fis.plugin('autoprefixer'),
});

// 添加css和image加载支持
fis.match('*.{js,jsx,ts,tsx,es}', {
  preprocessor: [
    fis.plugin('js-require-css'),
    fis.plugin('js-require-file', {
      useEmbedWhenSizeLessThan: 10 * 1024 // 小于10k用base64
    }),
  ]
});

// 打包阶段
fis.match('::package', {
  // 用 loader 来自动引入资源。
  postpackager: fis.plugin('loader'),
});

// 禁用components
fis.unhook('components');
fis.hook('node_modules');

// demos
fis.match('src/demo/(**)', {release: 'demo/$1'});

// 所有打包文件
fis.match('/pkg/(**)', {
  release: '/assets/pkg/$1'
});

// 配置文件不产出
fis.match('src/define/**', {
  release: false
});

// 配置的常量替换
fis.match('src/**.{jsx,html}', {
  preprocessor: fis.plugin('define', defineTest, 'prepend')
});

// 部署：=====
// local: 本地环境
fis
  .media('local')
  .match('src/**.{jsx,html}', {
    preprocessor: fis.plugin('define', defineTest, 'prepend')
  })
  .match('**.{js,jsx,css,less,svg,ttf,eot,woff,po}', {useHash: false})
  .match('src/demo/(**)', {release: 'demo/$1'})
  .match('::package', {
    postpackager: fis.plugin('loader', {
      allInOne: false
    }),
  })
  .match('**', {
    deploy: fis.plugin('local-deliver', {
      to: path.join(__dirname, './local/')
    })
  });

// test: 测试环境
fis
  .media('test')
  .match('src/**.{jsx,html}', {
    preprocessor: fis.plugin('define', defineTest, 'prepend')
  })
  .match('**.{js,jsx,css,less,svg,ttf,eot,woff,po}', {useHash: true})
  .match('src/demo/(**)', {release: false})
  // .match('*.js', {
  //   optimizer: fis.plugin('uglify-js')
  // })
  // .match('*.{css,less,styl}', {
  //   optimizer: fis.plugin('clean-css')
  // })
  .match('::package', {
    postpackager: fis.plugin('loader', {
      allInOne: true
    }),
  })
  .match('**', {
    deploy: fis.plugin('local-deliver', {
      to: path.join(__dirname, './test/')
    })
  });

// prod: 正式环境
fis
  .media('prod')
  .match('src/**.{jsx,html}', {
    preprocessor: fis.plugin('define', defineProd, 'prepend')
  })
  .match('**.{js,jsx,css,less,svg,ttf,eot,woff,po}', {useHash: true})
  .match('src/demo/(**)', {release: false})
  .match('*.js', {
    optimizer: fis.plugin('uglify-js')
  })
  .match('*.{css,less,styl}', {
    optimizer: fis.plugin('clean-css')
  })
  .match('::package', {
    postpackager: fis.plugin('loader', {
      allInOne: true
    }),
  })
  .match('**', {
    deploy: fis.plugin('local-deliver', {
      to: path.join(__dirname, './prod/')
    })
  });
