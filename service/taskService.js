const pool = require("../db");
const dayjs = require("dayjs");
const multer = require("multer");
const {nanoid} = require("nanoid");


/**
 * 相册列表
 */
function albumList(req, res) {
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

}


/**
 * 新建相册
 */
function addPhotoAlbum(req, res) {
    if (req.file.filename) {
        const albumid = nanoid();
        const SQL_ADD_PHOTO_ALBUM = `INSERT INTO photoAlbum (photoalbumid,url) VALUES ('${albumid}','${req.file.filename}')`;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            //   在相册表里新增一条数据
            connection.query(SQL_ADD_PHOTO_ALBUM, (error, result) => {
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

/**
 * 获取相册内的照片列表
 */
function photoList(req, res) {
    const {photoalbumid} = req.body;
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
}

/**
 * 相册内上传照片
 */
function addPhoto(req, res) {
    if (req.file.filename) {
        const {photoalbumid} = req.body;
        
        //更新当前相册照片张数
        const SQL_UPDATE_PHOTO_COUNT = `UPDATE photoAlbum SET count=count+1 WHERE photoalbumid = '${photoalbumid}'`

        const SQL_ADD_PHOTO = `INSERT INTO photos (time,url,photoalbumid) VALUES ('${dayjs().format(
            "YYYY/MM/DD"
        )}','${req.file.filename}','${photoalbumid}')`;

        pool.getConnection((err, connection) => {
            if (err) throw err;

            connection.query(SQL_ADD_PHOTO, (error) => {

                if (error) throw error;

                connection.query(SQL_UPDATE_PHOTO_COUNT, (error) => {
                    if (error) throw error;
                    connection.release();

                    res.json({
                        code: "200",
                        message: "ok",
                    });
                })

            });
        });
    }
}

module.exports = {
    albumList, addPhotoAlbum, photoList, addPhoto
}