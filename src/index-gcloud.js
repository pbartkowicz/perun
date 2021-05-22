const runPerun = require('./index')

/**
 * Entrypoint for Google Cloud function
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.run = async (req, res) => {
    res.send(await runPerun(req, res));
}
