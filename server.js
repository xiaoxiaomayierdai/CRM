var http = require('http'),
    url = require('url'),
    fs = require('fs');
var server1 = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;
    //->资源文件请求处理
    var reg = /\.([0-9a-zA-Z]+)/i;
    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase(),
            suffixMIME = 'text/html';
        suffix === 'CSS' ? suffixMIME = 'text/css' : (suffix === 'JS' ? suffixMIME = 'text/javascript' : 'text/html');
        var conFile = 'i am sorry',
            status = 404;
        try {
            conFile = fs.readFileSync('.' + pathname, 'utf-8');
            status = 200;
        } catch (e) {

        }
        res.writeHead(status, {'content-type': suffixMIME + ';charset=utf-8;'});
        res.end(conFile);
        return;
    }

    //->API
    var customData = fs.readFileSync('./json/custom.json', 'utf-8');
    customData = customData.length === 0 ? '[]' : customData;
    customData = JSON.parse(customData);
    var result = {code: 1, msg: 'error', data: null};

    //->1)获取所有的客户信息
    if (pathname === '/getAllList') {
        if (customData.length > 0) {
            result = {
                code: 0,
                msg: 'success',
                data: customData
            };
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;
    }

    //->2)增加客户信息:在NODE中获取客户端请求主体中的内容,我们使用request.on('data')和request.on('end')两个事件处理
    if (pathname === '/addInfo') {
        var requestStr = '';
        req.on('data', function (chunk) {
            requestStr += chunk;
        });
        req.on('end', function () {
            requestStr = format(requestStr);
            requestStr['id'] = customData.length === 0 ? 1 : parseFloat(customData[customData.length - 1]['id']) + 1;
            customData.push(requestStr);
            fs.writeFileSync('./json/custom.json', JSON.stringify(customData), 'utf-8');
            result = {
                code: 0,
                msg: 'success'
            };
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            res.end(JSON.stringify(result));
        });
        return;
    }

    //->3)修改客户信息
    if (pathname === '/updateInfo') {
        requestStr = '';
        req.on('data', function (chunk) {
            requestStr += chunk;
        });
        var flag = false;
        req.on('end', function () {
            requestStr = format(requestStr);
            customData.forEach(function (item, index) {
                if (requestStr['id'] == item['id']) {
                    customData[index] = requestStr;
                    flag = true;
                    return false;
                }
            });
            fs.writeFileSync('./json/custom.json', JSON.stringify(customData), 'utf-8');
            result = {
                code: 0,
                msg: 'success'
            };
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            res.end(JSON.stringify(result));
        });
        return;
    }

    //->4)获取指定的客户信息
    if (pathname === '/getInfo') {
        var customId = query['id'];
        customData.forEach(function (item, index) {
            if (item['id'] == customId) {
                result = {
                    code: 0,
                    msg: 'success',
                    data: customData[index]
                };
                return false;
            }
        });
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;
    }

    //->5)删除客户信息
    if (pathname === '/removeInfo') {
        customId = query['id'];
        customData.forEach(function (item, index) {
            if (item['id'] == customId) {
                customData.splice(index, 1);
                fs.writeFileSync('./json/custom.json', JSON.stringify(customData), 'utf-8');
                result = {
                    code: 0,
                    msg: 'success'
                };
                return false;
            }
        });
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
    }
});
server1.listen(80, function () {
    console.log('hello world 80!');
});

function format(str) {
    var reg = /([^&]+)=([^&]+)/g,
        obj = {};
    str.replace(reg, function () {
        obj[arguments[1]] = arguments[2];
    });
    return obj;
}