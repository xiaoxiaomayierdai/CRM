/*
 * 1、给提交按钮绑定点击事件，在点击的时候实现增加的操作
 *   a、获取文本框中的内容
 *   b、发送AJAX请求给服务器，把获取的内容通过请求主体传递给服务器
 *   c、接收服务返回的结果，成功跳转回到首页，失败的话提示增加失败
 *
 * 2、获取URL地址栏中的地址，解析问号传递参数的值
 *   ->看是否传递了ID,传递了就是修改操作,没传递就是增加操作
 *   ->如果是修改操作我们还需要获取到修改的客户ID
 */
~function (pro) {
    //->URL问号传递参数值解析方法(*****)
    function queryParams() {
        var reg = /([^?&=#]+)=([^?&=#]+)/g,
            obj = {};
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    }

    pro.queryParams = queryParams;
}(String.prototype);

//->detailRender
var detailRender = (function () {
    var submit = document.getElementById("submit"),
        userName = document.getElementById("userName");

    var customId = null;
    function bindEvent() {
        var name = userName.value;
        if (name.length === 0) {
            alert('亲，请输入用户名哦!');
            return;
        }

        //->修改
        if (typeof customId !== 'undefined') {
            ajax("/updateInfo", {
                method: "POST",
                data: {
                    id: customId,
                    name: name
                },
                success: function (result) {
                    if (result && result["code"] == 0) {
                        alert("修改成功");
                        window.location.href = "index.html";
                    } else {
                        alert("修改失败");
                    }
                }
            });
            return;
        }

        //->增加
        ajax({
            url: "/addInfo",
            method: "POST",
            data: "name=" + name,
            success: function (result) {
                if (result && result.code == 0) {
                    alert("亲，恭喜你增加成功了!");
                    window.location.href = "index.html";
                } else {
                    alert("亲，很遗憾增加失败了!");
                }
            }
        });
    }

    return {
        init: function () {
            //->解析URL
            var urlObj = window.location.href.queryParams();
            customId = urlObj['id'];

            //->如果当前的操作为修改的话,我们需要根据ID向服务器发送请求,把原有的客户信息获取到,然后展示在页面中
            if (typeof customId !== 'undefined') {
                ajax('/getInfo', {
                    data: {id: customId},
                    success: function (result) {
                        if (result && result.code == 0) {
                            var data = result.data;
                            userName.value = data.name;
                        }
                    }
                });
            }

            submit.onclick = bindEvent;
        }
    }
})();
detailRender.init();