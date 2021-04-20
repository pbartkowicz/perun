const runPerun = require('./index')

/**
 * Entrypoint for Google Cloud function
 *
 * @param req Request
 * @param res Response
 */
exports.run = async (req, res) => {
    res.send(await runPerun(req))
}
