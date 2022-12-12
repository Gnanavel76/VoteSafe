const { recoverPersonalSignature } = require('@metamask/eth-sig-util');
const { bufferToHex } = require('ethereumjs-util');
const { generateToken } = require("../util");
const User = require("../models/User")
const Cryptr = require('cryptr');
const { web3 } = require('../web3');

exports.createPartialUser = async (req, res, next) => {
    try {
        const { publicAddress } = req.body
        const user = await User.findOne({ publicAddress })
        if (user) {
            throw new Error("Account already exist. Directly login to your account")
        }
        const cryptr = new Cryptr(process.env.SECRET_KEY);
        const nonce = Math.floor(Math.random() * 1000000)
        const token = cryptr.encrypt(JSON.stringify({ nonce, createdAt: new Date().getTime() }));
        res.status(200).send({ publicAddress, nonce, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message })
    }
}

exports.getAuthNonce = async (req, res, next) => {
    try {
        const { publicAddress } = req.params
        const user = await User.findOne({ publicAddress })
        if (user === null) {
            throw new Error("User doesn't exist")
        }
        res.status(200).send({ publicAddress, nonce: user.nonce });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message })
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const { name, publicAddress, token, signature } = req.body

        if (!token) {
            throw new Error("Invalid Token")
        }
        const user = await User.findOne({ publicAddress })
        if (user) {
            throw new Error("Account already exist. Directly login to your account")
        }
        const cryptr = new Cryptr(process.env.SECRET_KEY);
        const decryptedToken = JSON.parse(cryptr.decrypt(token));
        const msg = `I am signing my one-time nonce: ${decryptedToken.nonce}`;
        const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
        const address = recoverPersonalSignature({
            data: msgBufferHex,
            signature: signature,
        });

        if (address !== publicAddress) {
            throw new Error("Signature verification failed")
        }
        const newUser = await User.create({ name, publicAddress })
        req.user = newUser
        next()
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message })
    }
}

exports.login = async (req, res, next) => {
    try {
        let { user } = req
        let authToken
        if (user) {
            authToken = generateToken({ _id: user._id, name: user.name, publicAddress: user.publicAddress })
        } else {
            const { publicAddress, signature } = req.body
            user = await User.findOne({ publicAddress })
            if (!user) {
                throw new Error("Account doesn't exist")
            }
            const msg = `I am signing my one-time nonce: ${user.nonce}`;
            const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
            const address = recoverPersonalSignature({
                data: msgBufferHex,
                signature: signature,
            });
            if (address !== publicAddress) {
                throw new Error("Signature verification failed")
            }
            user.nonce = Math.floor(Math.random() * 10000);
            await user.save();
            authToken = generateToken({ _id: user._id, name: user.name, publicAddress: user.publicAddress })
        }
        res.status(200).json({ _id: user._id, name: user.name, publicAddress: user.publicAddress, authToken });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message })
    }
}

exports.verifyAuthToken = async (req, res, next) => {
    try {
        const { authToken } = req.body
        var decoded = jwt.verify(authToken, process.env.SECRET_KEY);
        res.status(200).json(decoded)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}