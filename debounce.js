/**
* 函数调用间隔控制
* fn: 执行的函数
* delay: 函数执行的最小间隔，单位毫秒
* prepose：靠前执行。为true时，函数调用即执行，并且在之后的delay中的调用无效（应用场景：防止按钮多次重复点击）。为false时，函数调用之后，并不立即执行，只有某次调用之后的delay内没有再被调用，才执行（应用场景：autocomplete，只有输入完成之后再执行查询）。
*/
function debounce(fn, delay, prepose) {
    var timer, last_exec = 0;
    return function() {
        var that = this,
            args = arguments,
            diff, curr,
            exec = function() {
                last_exec = +new Date();
                fn.apply(that, args);
            };
        timer && clearTimeout(timer);
        if (prepose) {
            diff = delay - (+new Date() - last_exec);
            diff <= 0 && exec();
        } else {
            timer = setTimeout(exec, delay);
        }
    }
};

module.exports = debounce;
