/*
 * AJAX V1.0
 */
~function () {
    //->checkType:检测数据类型
    function checkType(value, type){
        var realType = Object.prototype.toString.call(value),
            checkReg = new RegExp('^\\[object ' + type + '\\]$', 'i');
        return checkReg.test(realType);
    }
    //->char:检测URL中是否存在问号
    function char(url) {
        return url.indexOf('?') > -1 ? '&' : '?';
    }
    function ajax(url, options) {
        //->只传递了一个参数,第一个URL是一个对象
        if (checkType(url, 'object')) {
            options = url;
            url = null;
        }
        options = options || {};
        //->默认值的替换
        var _default = {
            url: checkType(url, 'string') ? url : null,
            method: 'get',
            dataType: 'json',
            data: null,
            async: true,
            cache: true,
            success: null
        };
        for (var key in  options) {
            if (options.hasOwnProperty(key)) {
                if (key === 'type') {
                    _default['method'] = options['type'];
                    continue;
                }
                _default[key] = options[key];
            }
        }
        //->发送AJAX请求
        var xhr = new XMLHttpRequest;
        var regGET = /^(GET|DELETE|HEAD)$/i,
            regPOST = /^(POST|PUT)$/i;
        //->DATA
        if (checkType(_default.data, 'object')) {
            var dataStr = '';
            for (var attr in _default.data) {
                if (_default.data.hasOwnProperty(attr)) {
                    dataStr += attr + '=' + _default.data[attr] + '&';
                }
            }
            dataStr = dataStr.substring(0, dataStr.length - 1);
            _default.data = dataStr;
        }
        if (regGET.test(_default.method)) {
            _default.url += char(_default.url) + _default.data;
            _default.data = null;
        }
        //->CACHE
        if (regGET.test(_default.method) && _default.cache === false) {
             _default.url += char(_default.url) + '_=' + Math.random();
        }

        xhr.open(_default.method, _default.url, _default.async);
        xhr.onreadystatechange = function () {
            if (xhr.status !== 200) return;
            if (xhr.readyState === 4) {
                var result = xhr.responseText;//->string content
                //->DATA TYPE
                switch (_default.dataType.toUpperCase()) {
                    case 'JSON':
                        result = 'JSON' in window ? JSON.parse(result) : eval('(' + result + ')');
                        break;
                    case 'XML':
                        result = xhr.responseXML;
                        break;
                }
                //->SUCCESS
                typeof _default.success === 'function' ? _default.success.call(xhr, result) : null;
            }
        };
        xhr.send(_default.data);
    }
    window.ajax = ajax;
}();