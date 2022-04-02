const express = require('express');
const Mock = require('mockjs')
const app = express();

const MySQL = require('mysql');

//创建连接池
const DB = MySQL.createConnection({
    host: '124.223.184.103',
    user: 'root',
    password: 'Qwer@1234',
    database: 'DBtest'
});

DB.connect((err) => {
    if (err) throw  err
    console.log("数据库连接成功")
});


/* 引入cors */
const cors = require('cors');
app.use(cors());
/* 引入body-parser */
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.all('*', function (req, res, next) {
    if (!req.get('Origin')) return next();
    // use "*" here to accept any origin
    res.set('Access-Control-Allow-Origin', "*");
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'content-Type');
    // res.set('Access-Control-Allow-Max-Age', 3600);
    if ('OPTIONS' === req.method) return res.send(200);
    next();
});

app.get('/user/userList', (req, res) => {
    try {
        let sql = 'SELECT * FROM user'
        DB.query(sql, (err, result) => {
            if (err) {
                console.log("error", err)
                res.json({
                    code: err.code,
                    message: err.sqlMessage,
                })
            } else {
                res.json(Mock.mock({
                    code: 200,
                    message: "ok",
                    "context": result
                }));
            }
        })
    } catch (e) {
        console.log("something is error", e)
    }


})
/* 监听端口 */
app.listen(3000, () => {
    console.log('listen:3000');
})
