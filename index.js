"use strict";

const express = require("express");
const Mock = require("mockjs");
const app = express();
const MySQL = require("mysql");
const dayjs = require("dayjs");
const {nanoid} = require("nanoid");
const multer = require("multer");
//创建连接池
const DB = MySQL.createConnection({
    host: "124.223.184.103",
    user: "root",
    password: "Qwer@1234",
    database: "MY_TEST",
});
DB.connect((err) => {
    if (err) throw err;
    console.log("数据库连接成功");
});
/* 引入cors */
const cors = require("cors");
app.use(cors());
/* 引入body-parser */
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.all("*", function (req, res, next) {
    if (!req.get("Origin")) return next();
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "content-Type");
    if ("OPTIONS" === req.method) return res.send(200);
    next();
});

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "/data/www/images");
    },

    filename(req, file, cb) {
        cb(null, file.originalname);
    },
});

app.post(
    "/photo/addPhotoAlbum",
    multer({storage: storage}).single("uploadFile"),
    (req, res) => {
        if (req.file.filename) {
            const albumid = nanoid();
            const SQL_ADD_PHOTO_ALBUM = `INSERT INTO photoAlbum (photoalbumid,url) VALUES ('${albumid}','${req.file.filename}')`;

            DB.query(SQL_ADD_PHOTO_ALBUM, (err, result) => {
                const SQL_UPLOAD_PHOTO = `INSERT INTO photos (time,url,photoalbumid) VALUES ('${dayjs().format(
          "YYYY/MM/DD"
        )}','${req.file.filename}','${albumid}')`;
                if (result.affectedRows >= 1) {
                    DB.query(SQL_UPLOAD_PHOTO, (err) => {
                        if (!err) {
                            res.json({
                                code: "200",
                                message: "ok",
                            });
                        }
                    });
                } else {
                    res.json({
                        code: "0",
                        message: "error",
                    });
                }
            });
        }
    }
);

/**
 * 注册
 */
app.post("/user/registered", (req, res) => {
    try {
        const {username, password} = req.body;
        const SQL_USER_ALREADY_EXISTS = `SELECT name FROM users WHERE name='${username}' LIMIT 1`;
        DB.query(SQL_USER_ALREADY_EXISTS, (err, result) => {
            if (result.length > 0) {
                res.json({
                    cone: "0",
                    message: "The user already exists",
                });
            } else {
                const SQL_ADDUSER = `INSERT INTO users (name,password) VALUES ('${username}','${password}')`;

                DB.query(SQL_ADDUSER, (err) => {
                    if (err) {
                        res.json({
                            code: err.code,
                            message: err.sqlMessage,
                        });
                    } else {
                        res.json({
                            code: "200",
                            message: "ok",
                        });
                    }
                });
            }
        });
    } catch (e) {
        console.log("something is error", e);
    }
});

/**
 * 登录
 */
app.post("/user/login", (req, res) => {
    try {
        const {username, password} = req.body;
        const SQL_USER_INFO = `SELECT * FROM users WHERE name='${username}' AND password='${password}' LIMIT 1`;
        DB.query(SQL_USER_INFO, (err, result) => {
            if (err) {
                res.json({
                    code: err.code,
                    message: err.sqlMessage,
                });
            } else {
                if (result.length > 0) {
                    res.json({
                        code: "200",
                        message: "ok",
                        context: result[0],
                    });
                } else {
                    res.json({
                        code: 1,
                        message: "Credential error",
                    });
                }
            }
        });
    } catch (e) {
        console.log("something is error", e);
    }
});

app.get("/user/userList", (req, res) => {
    try {
        const SQL_QUERY_USERS = "SELECT * FROM users";
        DB.query(SQL_QUERY_USERS, (err, result) => {
            if (err) {

                res.json({
                    code: err.code,
                    message: err.sqlMessage,
                });
            } else {
                res.json(
                    Mock.mock({
                        code: "200",
                        message: "ok",
                        context: result,
                    })
                );
            }
        });
    } catch (e) {
        console.log("something is error", e);
    }
});

app.post("/photo/list", (req, res) => {
    try {
        const {photoalbumid} = req.body;
        const SQL_QUERY_PHOTO_LIST = `SELECT * FROM photos WHERE photoalbumid ='${photoalbumid}'`;
        DB.query(SQL_QUERY_PHOTO_LIST, (err, result) => {
            if (err) {
                res.json({
                    code: err.code,
                    message: err.sqlMessage,
                });
            } else {
                const time = [
                    ...new Set(result.map((i) => dayjs(i.time).format("YYYY/MM/DD"))),
                ].map((i) => {
                    return {time: i, list: []};
                });

                for (let i = 0; i < result.length; i++) {
                    const index = time.findIndex(
                        (ele) => ele.time === dayjs(result[i].time).format("YYYY/MM/DD")
                    );
                    if (index !== -1) {
                        time[index].list.push(result[i]);
                    }
                }
                res.json(
                    Mock.mock({
                        code: "200",
                        message: "ok",
                        context: time,
                    })
                );
            }
        });
    } catch (e) {
        console.log("something is error", e);
    }
});

app.get("/photo/albumList", (err, res) => {
    try {
        const SQL_QUERY_PHOTO_AlbumList = "SELECT * FROM photoAlbum";
        DB.query(SQL_QUERY_PHOTO_AlbumList, (err, result) => {
            if (err) {
            } else {

                res.json({
                    code: "200",
                    message: "ok",
                    context: result,
                });
            }
        });
    } catch (e) {
        console.log("something is error", e);
    }
});
/* 监听端口 */
app.listen(3000, () => {
    console.log("listen:3000");
});

const arr = [
    {time: "2022", value: "123"},
    {time: "2022", value: "456"},
    {time: "2022", value: "789"},

    {time: "2023", value: "123"},
    {time: "2023", value: "456"},
];

const arr1 = [
    {
        time: "2022",
        list: [{value: "123"}, {value: "456"}, {value: "789"}],
    },
    {
        time: "2023",
        list: [{value: "123"}, {value: "456"}],
    },
];
