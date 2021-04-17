const runPerun = require('./index')

/**
 * Entrypoint for Google Cloud function
 *
 * @param res Response
 * @param req Request
 */
exports.run = (res, req) => {
    res.send(runPerun(req))
}
