const express = require("express");
const compile = require("../../ethereum/compile");
const deploy = require("../../ethereum/deploy");


const router = express.Router();
router.post("/compile", async function (req, res, next) {
  const result = compile();
  res.send(result);
});

router.post("/deploy", async function (req, res, next) {
  const result = await deploy();

  res.send(JSON.parse(result));
});

module.exports = router;
