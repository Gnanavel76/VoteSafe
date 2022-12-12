const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2
const { spawn } = require("child_process");
const path = require('path');
exports.generateToken = (payload) => {
    return jwt.sign({ payload }, process.env.SECRET_KEY, { expiresIn: '10h' })
}
exports.isFileValid = (file, filetypes, filesize) => {
    const extension = mime.extension(file.mimetype)
    const actualFileSize = file.size
    if (!filetypes.includes(extension)) {
        return ({ status: false, error: `Only ${filetypes.toString()} allowed` })
    } else if (actualFileSize > filesize) {
        return ({ status: false, error: `File size exceeds ${formatBytes(filesize)}` })
    } else {
        return ({ status: true })
    }
}
exports.uploadFileToCloudinary = async (file, options, reWrite = false, existingFileName = "") => {
    try {
        const status = await cloudinary.uploader.upload(file, options)
        return { status: true, url: status.url }
    } catch (error) {
        console.log(error);
        return { status: false, url: "" }
    }
}
exports.isFaceMatching = async (capturedVoterImage, knownVoterImage) => {
    return new Promise((resolve, reject) => {
        const python = spawn('python', [path.join(__dirname, "./detectFace.py"), capturedVoterImage, knownVoterImage])
        python.stdout.on("data", (data) => {
            resolve(data.toString())
        })
        python.stderr.on("data", (err) => {
            reject(err.toString())
        })
    })
}
