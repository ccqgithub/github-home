/**
 * derive，给父类派生一个子类
 * @param  {Function} 父类
 * @param  {Function} constructor 子类构造函数
 * @param  {Object} proto     子类对象共有变量, 不能覆盖父类变量
 * @param  {Object} overwriteProto     子类对象共有变量, 会覆盖父类变量
 * @return {Function}      子类构造方法
 * @example
 *   var Class1 = Utils.derive(Object, function(){ console.log(this.name) }, {name: 'class1'});
 *   var Class2 = Utils.derive(Class1, {
 *       constructor: function() {
 *           console.log(this.name)
 *       },
 *       name: 'class2'
 *   })
 */
function derive(parent, constructor, proto, overwriteProto) {
    if (typeof constructor === 'object') {
        overwriteProto = proto;
        proto = constructor;
        constructor = proto.constructor || function() {};
        delete proto.constructor;
    }
    var fn = function() {
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    var tmp = function() {};
    tmp.prototype = parent.prototype;
    var fp = new tmp(),
        cp = constructor.prototype,
        key;
    for (key in cp) {
        if (cp.hasOwnProperty(key)) {
            fp[key] = cp[key];
        }
    }

    // extend properties
    proto = proto || {};
    for (key in proto) {
        if (fp[key]) {
            console.error('can not overwrite property: ' + key, proto);
            throw new Error('can not overwrite property: ' + key);
        }
        if (proto.hasOwnProperty(key)) {
            fp[key] = proto[key];
        }
    }

    // overite properties
    overwriteProto = overwriteProto || {};
    for (key in overwriteProto) {
        if (overwriteProto.hasOwnProperty(key)) {
            fp[key] = overwriteProto[key];
        }
    }

    fp.constructor = constructor.prototype.constructor;
    fn.prototype = fp;

    // let class has dirive function
    fn.derive = function(constructor, proto) {
        return derive(fn, constructor, proto);
    }
    return fn;
};

module.exports = derive;
