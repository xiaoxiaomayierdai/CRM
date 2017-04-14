/*
 *真实项目中最常用的一种编程模式:
 *   单例模式
 *     实现了分组分类的作用,避免全局变量的污染
 *
 *命令模式
 *   提供一个唯一的入口init，在这个入口方法中规划所有功能的先后执行顺序以及依赖关系等
 */
var indexRender = (function () {
    var content = document.getElementById('content');
    //->bindHTML:数据绑定
    function bindHTML(data){
        var str = '';
        for (var i = 0, len = data.length; i < len; i++) {
            var cur = data[i];
            str += '<li>';
            str += '<span>' + cur.id + '</span>';
            str += '<span>' + cur.name + '</span>';
            str += '<span>';
            str += '<a href="detail.html?id=' + cur.id + '">修改</a>';//->增加或者修改都是进入同一个页面,想要在这个页面中区分是增加还是修改,我们在URL地址上做处理:修改的话,跳转到详情页面,我们通过问号传参的方式把需要修改的客户的编号传递过去即可
            str += '<a href="javascript:;" data-id="' + cur.id + '">删除</a>';
            str += '</span>';
            str += '</li>';
        }
        content.innerHTML = str
    }

    //->bindDelete:删除操作
    function bindDelete() {
        /*
         * 1、采用事件委托给所有的删除按钮绑定点击事件
         * 2、点击删除的时候首先提示一下确定要删除吗? ALERT/CONFIRM/PROMPT
         *   ->我们需要获取到当前删除的这个客户的ID:我们在数据帮绑定的时候先把客户的ID存储到自定义属性上，点击的时候直接从自定义属性上获取值即可
         * 3、点击的是确定，说明确实要删除，我们向服务器发送请求，告诉服务器删除谁，获取删除完成的结果
         * 4、删除失败直接的提示，删除成功在页面上移除一下这条记录即可
         */
        content.onclick = function (e) {
            e = e || window.event;
            var tar = e.target || e.srcElement,
                tarTag = tar.tagName.toUpperCase();
            if (tarTag == 'A' && tar.innerHTML == '删除') {
                var customId = tar.getAttribute('data-id'),
                    flag = confirm('亲，要删除编号为 [ ' + customId + ' ] 的信息吗?');
                if (flag){
                    ajax({
                        url: '/removeInfo',
                        data: 'id=' + customId,
                        success: function (result) {
                            if (result && result.code == 0) {
                                alert('亲，删除成功了哦!');
                                content.removeChild(tar.parentNode.parentNode);
                            } else {
                                alert('亲，人品欠费删除失败!');
                            }
                        }
                    });
                }
            }
        }
    }

    return {
        init: function () {
            //->从服务器端获取所有的客户信息
            ajax('/getAllList', {
                method: 'GET',
                cache: false,
                dataType: 'JSON',
                success: function (result){
                    if (result && result.code == 0) {
                        var data = result.data;
                        //->数据绑定
                        bindHTML(data);
                        //->删除操作
                        bindDelete();
                    }
                }
            });
        }
    }
})();
indexRender.init();