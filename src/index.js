const Perun = require('./perun')

/**
 * Utility function that runs perun.
 * That can be used for testing.
 *
 * @param req
 */
module.exports = (req) => {
    (new Perun()).run(req)
}
