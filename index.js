"use strict";

const express = require("express");
const routers = require("./router/index");

// 创建express 服务器实例
const app = express();

// 导入cors中间件，注册为全局中间件，解决跨域
const cors = require("cors");
app.use(cors());

// 对post请求的请求体进行解析的express中间件，不加会导致req.body为undefined
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/", routers);

/* 监听端口 */
app.listen(3000, () => {
    console.log("listen:3000");
});
