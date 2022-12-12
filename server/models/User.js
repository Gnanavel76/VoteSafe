const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    publicAddress: {
        type: String,
        required: true,
        trim: true
    },
    nonce: {
        type: Number,
        required: true,
        default: () => Math.floor(Math.random() * 1000000)
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User