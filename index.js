"use strict";

const express = require("express");
const Mock = require("mockjs");
const app = express();
const MySQL = require("mysql");
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
/**
 * 注册
 */
app.post("/user/registered", (req, res) => {
  try {
    const {username, password} = req.body;
    const SQL_USER_ALREADY_EXISTS = `SELECT name FROM users WHERE name='${username}' LIMIT 1`;
    DB.query(SQL_USER_ALREADY_EXISTS, (err, result) => {
      console.log(result)
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
        console.log("error", err);
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

/* 监听端口 */
app.listen(3000, () => {
  console.log("listen:3000");
});
