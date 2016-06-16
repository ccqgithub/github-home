"use strict"

var $ = require('$')

/**
 * ajax请求封装
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function(options) {
    var request, deferred
    var options = $.extend(options, {
        // 请求路径
        url: '/ajax_url',

        // 请求类型 post, get
        type: 'post',

        // 返回数据格式 html, json, jsonp, script, text, xml
        dataType: 'json',

        // 发送的数据
        data: {}
    })

    // 防止页面刷新触发
    var _pageUnload = false;
    var _unbind = (function() {
        var fn = function() {
            _pageUnload = true;
        }
        window.addEventListener('beforeunload', fn);
        return function() {
            window.removeEventListener('beforeunload', fn);
        }
    })();

    // 开始请求
    deferred = $.Deferred()
    request = $.ajax(settings)
    request.then(function(data, textStatus, jqXHR) {

        _unbind()
        deferred.resolve(data)

    }, function(jqXHR, textStatus, errorThrown) {
        var errorInfo = {},
            data = {}

        _unbind()
        if (_pageUnload) return

        // 服务器抛出的异常信息是json数据
        try {
            errorInfo = $.parseJSON(jqXHR.responseText)
            if (errorInfo.status) {
                deferred.resolve(errorInfo)
                return
            }
        } catch (e) {
            errorInfo = {
                responseText: jqXHR.responseText,
                textStatus: textStatus,
                errorThrown: errorThrown
            }

            data = {
                status: '-1',
                statusText: textStatus,
                statusCode: jqXHR.status,
                message: '网络 or 服务器错误！',
                errorInfo: errorInfo
            }

            deferred.resolve(data)
        }
    })

    return deferred.promise()
}
