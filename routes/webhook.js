const { setData } = require("../utils/cache");

const Router = require("express").Router();

Router.post("/", async (req, res) => {
  console.log(req.body);
  await setData("hello", "world");
  return res.send(true).status(200);
});

module.exports = Router;
