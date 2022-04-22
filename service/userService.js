const pool = require("../db/index")


function registered(req, res) {
    let {username, password} = req.body;
    try {
        const SQL_USER_ALREADY_EXISTS = `SELECT name FROM users WHERE name='${username}' LIMIT 1`;
        const SQL_ADDUSER = `INSERT INTO users (name,password) VALUES ('${username}','${password}')`;

        pool.getConnection((err, connection) => {
            if (err) throw err

            connection.query(SQL_USER_ALREADY_EXISTS, (error, result) => {

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
        })
    } catch (e) {
        console.log("something is error", e);
    }

}

function login(req, res) {
    let {username, password} = req.body;
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
}

module.exports = {
    registered, login
}