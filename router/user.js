const express = require("express");
const router = express.Router()

const service = require("../service/userService")


// 注册
router.post("/registered", service.registered)


// 登录
router.post("/login", service.login)


module.exports = router