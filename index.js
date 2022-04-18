"use strict";

const mysql = require("mysql");
const express = require("express");

const dayjs = require("dayjs");

const multer = require("multer");

const { nanoid } = require("nanoid");

const app = express();

/**
 * 创建连接池
 */
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "124.223.184.103",
  user: "root",
  password: "Qwer@1234",
  database: "MY_TEST",
});

/* 引入cors */
const cors = require("cors");
app.use(cors());
/* 引入body-parser */
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all("*", function (req, res, next) {
  if (!req.get("Origin")) return next();
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "content-Type");
  if ("OPTIONS" === req.method) return res.send(200);
  next();
});

/**
 * 登录
 */
app.post("/user/login", (req, res) => {
  const { username, password } = req.body;
  const SQL_USER_INFO = `SELECT * FROM users WHERE name='${username}' AND password='${password}' LIMIT 1`;
  try {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(SQL_USER_INFO, (error, result) => {
        connection.release();

        if (error) throw error;

        res.json({
          code: "200",
          message: "ok",
          context: result[0],
        });
      });
    });
  } catch (e) {
    console.log("something is error", e);
  }
});

/**
 * 注册
 */
app.post("/user/registered", (req, res) => {
  const { username, password } = req.body;
  const SQL_USER_ALREADY_EXISTS = `SELECT name FROM users WHERE name='${username}' LIMIT 1`;
  const SQL_ADDUSER = `INSERT INTO users (name,password) VALUES ('${username}','${password}')`;
  try {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(SQL_USER_ALREADY_EXISTS, (error, result) => {
        connection.release();
        if (error) throw error;
        if (result.length > 0) {
          res.json({
            cone: "0",
            message: "The user already exists",
          });
        } else {
          connection.query(SQL_ADDUSER, (err) => {
            connection.release();
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
    });
  } catch (e) {
    console.log("something is error", e);
  }
});

/**
 * 相册列表
 */
app.get("/photo/albumList", (req, res) => {
  const SQL_QUERY_PHOTO_AlbumList = "SELECT * FROM photoAlbum";
  try {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(SQL_QUERY_PHOTO_AlbumList, (error, result) => {
        connection.release();
        if (error) throw error;
        res.json({
          code: "200",
          message: "ok",
          context: result,
        });
      });
    });
  } catch (e) {
    console.log("something is error", e);
  }
});

/**
 * 获取相册内照片列表
 */
app.post("/photo/list", (req, res) => {
  const { photoalbumid } = req.body;
  const SQL_QUERY_PHOTO_LIST = `SELECT * FROM photos WHERE photoalbumid ='${photoalbumid}'`;

  try {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(SQL_QUERY_PHOTO_LIST, (error, result) => {
        connection.release();
        if (error) throw error;
        const time = [
          ...new Set(result.map((i) => dayjs(i.time).format("YYYY/MM/DD"))),
        ].map((i) => {
          return { time: i, list: [] };
        });

        for (let i = 0; i < result.length; i++) {
          const index = time.findIndex(
            (ele) => ele.time === dayjs(result[i].time).format("YYYY/MM/DD")
          );
          if (index !== -1) {
            time[index].list.push(result[i]);
          }
        }
        res.json({
          code: "200",
          message: "ok",
          context: time,
        });
      });
    });
  } catch (e) {
    console.log("something is error", e);
  }
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "/data/www/images");
  },

  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});
/**
 * 新建相册
 */
app.post(
  "/photo/addPhotoAlbum",
  multer({ storage: storage }).single("uploadFile"),
  (req, res) => {
    //如果上传成功
    if (req.file.filename) {
      const albumid = nanoid();
      const SQL_ADD_PHOTO_ALBUM = `INSERT INTO photoAlbum (photoalbumid,url) VALUES ('${albumid}','${req.file.filename}')`;

      pool.getConnection((err, connection) => {
        if (err) throw err;

        //   在相册表里新增一条数据
        connection.query(SQL_ADD_PHOTO_ALBUM, (error, result) => {
          connection.release();
          if (error) throw error;

          if (result.affectedRows >= 1) {
            //   并且在照片表里也新增一条，作为该相册的默认图
            const SQL_UPLOAD_PHOTO = `INSERT INTO photos (time,url,photoalbumid) VALUES ('${dayjs().format(
              "YYYY/MM/DD"
            )}','${req.file.filename}','${albumid}')`;
            connection.query(SQL_UPLOAD_PHOTO, (error) => {
              connection.release();
              if (!error) {
                res.json({
                  code: "200",
                  message: "ok",
                });
              }
            });
          }
        });
      });
    }
  }
);

/**
 * 相册内上传照片
 */
app.post(
  "/photo/addPhoto",
  multer({ storage: storage }).single("uploadFile"),
  (req, res) => {
    if (req.file.filename) {
      const { photoalbumid } = req.body;
      const SQL_ADD_PHOTO = `INSERT INTO photos (time,url,photoalbumid) VALUES ('${dayjs().format(
        "YYYY/MM/DD"
      )}','${req.file.filename}','${photoalbumid}')`;

      pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.query(SQL_ADD_PHOTO, (error) => {
          connection.release();
          if (error) throw error;
          res.json({
            code: "200",
            message: "ok",
          });
        });
      });
    }
  }
);

/* 监听端口 */
app.listen(3000, () => {
  console.log("listen:3000");
});
