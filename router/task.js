const express = require("express");
const router = express.Router()

const service = require("../service/taskService")
const multer = require("multer");


const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "/data/www/images");
    },

    filename(req, file, cb) {
        cb(null, file.originalname);
    },
});

// 相册列表
router.get("/albumList", service.albumList)


// 获取相册内照片列表
router.post("/list", service.photoList)


// 新建相册
router.post("/addPhotoAlbum", multer({storage: storage}).single("uploadFile"), service.addPhotoAlbum)

// 相册内上传照片
router.post("/addPhoto", multer({storage: storage}).single("uploadFile"), service.addPhoto)


module.exports = router