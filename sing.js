const express = require('express');
const path = require('path');
var mysql = require('mysql');
const app = express();
const fs = require('fs');
//文件上传
const multer = require('multer');

//连接数据库
var connection = mysql.createConnection({
    host    :"localhost", //主机
    port    :'3306',	//端口
    user    :"root",	//用户名
    password:"root",	//密码
    database:"form"		//数据库
});

var upload = multer({ dest: 'uploads/' })
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) 
app.use('/uploads',express.static(path.join(__dirname,'uploads')))

//连接mysql检查
connection.connect(function(err){
    if(err){
        throw err;
    }
    console.log('connect mysql success');
});

//
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
})
//
app.use(express.static(path.join(__dirname,"/")))

app.post('/checkUser',(req,res)=>{
    // 1.接收post参数
    let {signInName,signInPassword} = req.body;
    // 2.去校验数据
    let signInNameReg = /\w{5,}$/g;
    if(!signInNameReg.test(signInName)){
    }
    
     // 3.去mysql数据库校验
     /*                                                 表单的表头 
                            数据库里的表单        {___________________________________}
                                    ^             ^                           ^             */
     let signInsql = `select * from denlu where name='${signInName}' and password = '${signInPassword}' `
     connection.query(signInsql,(err,rows,filed)=>{
         if(err){ 
            res.json({errcode:10003,message:'服务器繁忙'});
            return; 
        }
         if(rows.length > 0){
            let userInfo = {
                /* input框的name名>*/signInPassword: rows[0].password,/*数据库里的表单头*/
                /* input框的name名>*/signInName: rows[0].name/*数据库里的表单头*/
            };
            res.json({errcode:0,userInfo});
         }else{
            res.json({errcode:10002,message:"用户名或密码错误"})
         }
     })
   
})

app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'register.html'));
})

app.get('/singin',(req,res)=>{
    res.sendFile(path.join(__dirname,'singin.html'));
})

app.get('/index',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
})

app.get('/api7',(req,res)=>{
    res.send('async')
})

// 定义上传的目录
var upload = multer({ dest: 'uploads/' })

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// 托管静态资源
app.use('/uploads',express.static(path.join(__dirname,'uploads')))

app.get('/formajax',(req,res)=>{
    res.sendFile(path.join(__dirname,'form-ajax.html'))
})

app.get('/ajax',(req,res)=>{
    res.sendFile(path.join(__dirname,'ajax.html'))
})

app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'register.html'))
})





//实现文件上传
app.post('/upload',upload.single('avatar'),(req,res)=>{
    console.log(req.body); //接收文本 text
    console.log(req.file); //接收文件上传成功后的信息
    if(req.file){
        // 进行文件的重命名即可 fs.rename
        let {originalname,destination,filename} = req.file;
        let dotIndex = originalname.lastIndexOf('.');
        let ext = originalname.substring(dotIndex);
        let oldPath = `${destination}${filename}`;
        let newPath = `${destination}${filename}${ext}`;
        fs.rename(oldPath,newPath,err=>{
            if(err){ throw err; }
            res.json({message:'上传文件成功','path':newPath})
        })
    }else{
        res.json({message:'没有上传文件'})
    }
    
    
})


// 专门实现图片上传
app.post('/upload2',upload.single('avatar'),(req,res)=>{
    if(req.file){
        // 进行文件的重命名即可 fs.rename
        let {originalname,destination,filename} = req.file;
        let dotIndex = originalname.lastIndexOf('.');
        let ext = originalname.substring(dotIndex);
        let oldPath = `${destination}${filename}`;
        let newPath = `${destination}${filename}${ext}`;
        fs.rename(oldPath,newPath,err=>{
            if(err){ throw err; }
            res.json({message:'上传文件成功','path':newPath})
        })
    }else{
        res.json({message:'没有上传文件',path:''})
    }
    
})



// post /addUser
app.post('/addUser',(req,res)=>{
    // 1.接收参数
    let {username,password,avatar} = req.body;
    // 2.插入数据库中
    let sql = "insert into denlu(name,password,avatar) values(?,?,?)";
    let bind = [username,password,avatar]
    connection.query(sql,bind,(err,result)=>{
        if(err){
            res.json({errcode:10005,message:'服务器繁忙'})
        }else{
            if(result.affectedRows){
                res.json({errcode:0,message:'注册成功'})
            }else{
                res.json({errcode:10006,message:'注册失败，请稍后再试'})
            }
        }
    })
   
})


app.get('/login',(req,res)=>{
    res.send('欢迎登陆')
})


app.listen(4000,()=>{
    console.log('服务已经启动 port 4000')
})
