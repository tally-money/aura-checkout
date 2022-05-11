const Router = require("express").Router();

Router.post("/", async (req, res) => {
  console.log(req.body);
  return res.send(true).status(200);
});

module.exports = Router;
