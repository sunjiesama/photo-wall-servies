const express = require("express");

const userRouter = require("./user");
const taskRouter = require("./task");

const router = express.Router();

router.all("*", function (req, res, next) {
  if (!req.get("Origin")) return next();
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "content-Type");
  if ("OPTIONS" === req.method) return res.send(200);
  next();
});
router.use("/user", userRouter);
router.use("/photo", taskRouter);

module.exports = router;
