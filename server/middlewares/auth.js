const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1]
            const { payload: { _id } } = jwt.verify(token, process.env.SECRET_KEY)
            const user = await User.findById(_id)
            if (!user) {
                throw new Error("Account doesn't exist")
            }
            req.user = user
            next()
        } else {
            throw new Error("Auth token is required")
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}