const Perun = require('./perun')

/**
 * Utility function that runs perun.
 * That can be used for testing.
 *
 * @param {Request} req
 * @param {Response} res
 */
module.exports = (req, res) => {
    return (new Perun()).run(req, res);
}
