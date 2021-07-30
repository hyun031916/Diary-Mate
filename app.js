//필요 모듈
const express = require('express');
const mysql = require('mysql');
const format = require('date-format');
const moment = require('moment');
const multer = require('multer');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
var Prompt = require('prompt-password');
var prompt = new Prompt({
  type:'password',
  message:'Enter your password please',
  name:'password'
})

const app = express();

const config = require('./db/dbconn');

const conn = mysql.createConnection(config);
conn.connect();

const register = {
    list: 'select * from register order by id desc',
    insert : 'insert into register(user_id, password, email, tel, reg_date) values(?, ?, ?, ?, ?)',
    read: 'select * from register where id=?'
}

var _storage = multer.diskStorage({
    destination: function(req, file, cb){
        if(file.mimetype=='image/jpeg' || file.mimetype=='image/png'){
            console.log('그림 파일');
            cb(null, 'uploads/img');
        }else{
            console.log('텍스트 파일')
            cb(null, 'uploads/texts');
        }
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now()+'-'+(Math.round()*1E9)
        cb(null, file.originalname)
    }
})
var upload = multer({storage: _storage}) // 위에 있는 _storage를 호출한다.

app.use(express.static(__dirname+'/public'));

app.set('views', './views');
app.set('view engine', 'ejs');

app.locals.pretty = true;

app.use(express.urlencoded({extended: true}));// post로 전송된 데이터를 가져오기 위함

const date = moment().format('YYYY-MM-DD HH:mm:ss');


//첫화면
app.get('/', (req, res)=>{
    res.render('index');
})


app.listen(3000,()=>{
    console.log('running server at localhost......')
})