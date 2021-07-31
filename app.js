//필요 모듈
const express = require('express');
const mysql = require('mysql');
const format = require('date-format');
const moment = require('moment');
const session=require('express-session');
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
const { Cookie } = require('express-session');

const conn = mysql.createConnection(config);
conn.connect();


app.use(session({
    secret:'keyboard cat',
    resave:false, //사용자 접속할 때마다 세션 아이디 새로 발급 안함
    saveUninitialized: true, //사용자가 접속해서 세션을 사용할 때까지 sid 발급 말 것
    cookie:{secure: true}
}))
//join 쿼리 객체로 생성
const join = {
    list: 'select * from register order by id desc',
    insert : 'insert into register(name, user_id, password, email, tel, reg_date) values(?, ?, ?, ?, ?, ?)',
    read: 'select * from register where user_id=?'
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
    res.render('index', {'welcome':''});
})

//회원가입
app.get('/join', (req, res)=>{
    res.render('join');
})

app.post('/join', (req, res)=>{
    const _name = req.body.name;
    const _id = req.body.id;
    const _password = req.body.password;
    const _email = req.body.email;
    const _tel = req.body.tel;
    const _joinDate = date;
    conn.query(join.insert, [_name, _id, _password, _email, _tel, _joinDate], (err)=>{
        if(err) console.log(err);
        else{
            console.log('Inserted!');
            res.redirect('/login');
        }
    })
})

//로그인
app.get('/login', (req, res)=>{
    res.render('login', {'message':''});
})

app.post('/login', (req, res)=>{
    const _id = req.body.id;
    const _password = req.body.password;
    conn.query(join.read, [_id], (err, user)=>{
        if(err) console.log(err);
        if(user[0].password === _password){
            req.session.uid = req.body.id;
            //TODO: 리스트 뿌려주기
            res.render('index', {'welcome':`${req.session.uid}님 환영합니다.`});
        }
        else{
            res.render('login', {'message':'아이디나 비밀번호가 올바르지 않습니다.'})
        }
    })
})

//로그아웃
app.get('/logout', (req, res)=>{
    delete req.session.uid;
    res.render('index', {welcome:''});
})

//글쓰기
app.get('/new', (req, res)=>{
    if(req.session.uid){
        res.render('new', {name:req.session.uid});
    }else{
        res.send('<script type="text/javascript">alert("로그인 후 이용하실 수 있습니다."); window.location="/login";</script>')
    }
})

app.listen(3000,()=>{
    console.log('running server at localhost......')
})