/*
* 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
* @param fn {function} 需要调用的函数
* @param delay {number} 间隔时间，单位毫秒
*/
function throttle(fn, delay) {
    var timer,
        last_exec = 0;
    return function() {
        var that = this,
            args = arguments,
            diff,
            exec = function() {
                last_exec = +new Date();
                fn.apply(that, args);
            };
        timer && clearTimeout(timer);
        diff = delay - (+new Date() - last_exec);
        if (diff <= 0) {
            exec()
        } else {
            timer = setTimeout(exec, diff);
        }
    }
};

module.exports = throttle;
