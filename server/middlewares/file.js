const formidable = require('formidable');
exports.handleFormData = (req, res, next) => {
    const form = formidable({ keepExtensions: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).json({
                status: false,
                error: "Unable to process request. Try again"
            })
        }
        req.body = { ...fields, ...files }
        next()
    });
}