var path = require('path');

// domain
var domain = '';

// fis 组件目录
fis.set('component.dir', 'vendor');
fis.set('project.files', '**');
fis.set('project.ignore', fis.get('project.ignore').concat([
    //
]));

// global
fis.match('**', {
    release: 'static/$&',
    domain: domain
});

fis.match('app/(**).{ejs,html}', {
    release: 'be/view/$1.html',
    useMap: true,
    isView: true
});

// mod js
fis.match('**.{js,es6}', {
    isMod: true
});

// 引擎 not mod
fis.match('engine/**', {
    isMod: false
});

// 组件
fis.match('{**/component,component,module,app}/**', {
    isWidget: true,
    useCache: false,
    useSameNameRequire: true
});

// 文件指纹
fis.match('*.{js,css}', {
    useHash: true
});

// scss files
fis.match('*.scss', {
    rExt: '.css',
    parser: fis.plugin('node-sass', {
        load_paths: [
            __dirname
        ]
    }),
    // packTo: 'pkg/style.css'
});

// ejs templates as html
fis.match('*.ejs', {
    isHtmlLike: true,
    rExt: '.html'
});

// transform es6 to es5 by babel
fis.set('project.fileType.text', 'es6');
fis.match('*.es6', {
    isJsLike: true,
    rExt: '.js',
    isMod: true,
    parser: fis.plugin('es6-babel', {})
});

// 部署
fis.match('**', {
    deploy: fis.plugin('local-deliver', {
        to: path.join(__dirname, '../')
    })
});

// prod
fis
    .media('prod')
    .match('*.js', {
        optimizer: fis.plugin('uglify-js')
    })
    .match('*.{css,less,styl}', {
        optimizer: fis.plugin('clean-css')
    });

// 打包阶段插件
fis.match('::packager', {
    spriter: fis.plugin('csssprites'),
    //postpackager: packagerRequire
    // https://github.com/fex-team/fis3-postpackager-loader
    postpackager: fis.plugin('loader', {
        scriptPlaceHolder: '<!--SCRIPT_PLACEHOLDER-->',
        stylePlaceHolder: '<!--STYLE_PLACEHOLDER-->',
        resourcePlaceHolder: '<!--RESOURCEMAP_PLACEHOLDER-->',
        resourceType: 'amd',
        processor: {
            '.html': 'html'
        },
        resoucemap: '/pkg/${filepath}_map.js',
        allInOne: false,
        obtainScript: true,
        obtainStyle: true,
        useInlineMap: false,
        include: [
            "module/**"
        ]
    })
});

// 模块化支持插件
// https://github.com/fex-team/fis3-hook-amd (forwardDeclaration: false)
// https://github.com/fex-team/fis3-hook-commonjs (forwardDeclaration: true)
fis.hook('amd', {
    globalAsyncAsSync: true,
    baseUrl: './',
    paths: {},
    packages: [],
    shim: {},
    forwardDeclaration: true,
    skipBuiltinModules: false,
    extList: ['.js', '.coffee', '.es6', '.jsx'],
    tab: 2
});
