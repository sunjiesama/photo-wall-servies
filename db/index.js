const mysql = require("mysql");


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

module.exports = pool