const express = require("express");
const router = express.Router();
const { createUser, login, verifyAuthToken, getAuthNonce, createPartialUser } = require("../controllers/auth");
const { isAuthenticated } = require("../middlewares/auth");

router.get("/nonce/:publicAddress", getAuthNonce);

router.post("/", createPartialUser);

router.post("/create", createUser, login);

router.post("/login", login);

router.get("/verifyAuth", isAuthenticated, (req, res) => {
    res.status(200).json({
        message: "User verified successfully"
    })
})


module.exports = router;
