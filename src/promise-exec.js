const util = require('util')
const execFile = util.promisify(require('child_process').execFile)

module.exports = {
    execFile
}
