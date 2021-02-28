
function $ajax(options){
    // 定义默认参数
    // 默认配置
    let target = {
        url: "", // 请求地址
        type: "get", // 默认get请求
        cache: true, // 默认走缓存
        async: true, // 默认异步
        data:'',  // 可以是json对象或是查询字符串
        dataType: "text", // 期望服务器返回的数据类型
        beforeSend: null, // 发送之前的回调函数 
        success: null,  // 成功的回调函数
        error: null, // 失败或超时的回调函数 xhr.onerror
        complete: null
    }

    // 用户传入的参数合并到target
    let settings = Object.assign(target,options)

    // 把对象参数变成查询字符串的形式
    // {a:1,b:2} => a=1&b=2   
    function obj2querystring(obj){
        // Object.keys(obj) // =》 [a,b]
        let queryString = '';
        let arr = []
        Object.keys(obj).forEach(k=>{
            // arr.push(`${k}=${obj[k]}`); // arr => [a=1,b=2]
            // 因为 ？ 和 & 会对url地址产生歧义，需要对值编码处理，防止分割出多个参数
            queryString += `${k}=${encodeURIComponent(obj[k])}&`
        })
        queryString = queryString.substring(0,queryString.length - 1);
        return queryString;
        // return arr.join('&')
    }




    // 获取兼容性的对象ajax
    function getXhr(){
        return window.XMLHttpRequest ? 
                new  XMLHttpRequest() 
                : new ActiveXObject('Microsoft.XMLHTTP');
    }
    let {url,type,data,cache,async,success,error,complete,beforeSend,dataType} = settings;
    // 第一步，获取ajax对象
    let xhr = getXhr();
    xhr.timeout = 3000; // 定义超时的事件
    // 第二步：监听ajax的状态
    xhr.onreadystatechange = function(){
       


        if(this.readyState !== 4){
            // 说明正在请求中
            beforeSend && beforeSend();
        }
        // statue 200 -300 或者 304(协商缓存-会发送请求) 强缓存（200-不会发送请求）
        if(this.readyState === 4 && ( this.status >= 200 || this.status < 300 || this.status === 304 )){
            // 成功执行用户传入的success回调
            // if(success){
            //     success(this.responseText);
            // }
            // 等价于下面写法
            
            // 根据用户传入dataType设置数据格式
            switch(dataType){
                case "text":
                    success && success(this.responseText);
                    break;
                case "json":
                    success && success(JSON.parse( this.responseText ));
                    break;
            }

           
            // console.log('here',this.responseText)
        }

       
    }

    //监听ajax是否出错 xhr.onerror
    xhr.onerror = function(){
       // 触发用户自己传入的错误回调函数
       error && error();

    }
    // 超时会触发
    xhr.ontimeout = function(){
        error && error();
    }
    // 请求超过或失败触发
    xhr.onloadend = function(){
        complete && complete();
    }
    // 第三步：建立http连接
    // 如果是get，需要把参数data追加到url的？后面 ，形参查询字符串
    if(type === 'get'){
        url = url + '?' + obj2querystring(data);
        // url /api
        // /api?a=1&b=2
    }
    // 不走缓存
    if(!cache){
        // 判断是否有问号？
        let millSecond = Date.now();
        if(url.indexOf('?') == -1){
            // 没有？
            url += `?_=` + millSecond;
        }else{
            // 有？
            url += `&_=`+ millSecond;
        }
        
    }
    xhr.open(type,url,async);
    // 第四步
    if(settings.type == 'post'){
        // post请求需要设置请求头，模拟表单传递数据
        xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    }
    // 第五步：
    if(typeof data === 'object'){
    	data = obj2querystring(data)
    }
    xhr.send(type === 'get' ? null: data);

}

// 调用形式
// $ajax({
//     type: 'post',
//     url: "http://127.0.0.1:4000/api",
//     success:function(res){
//         console.log(res)
//     }
// })