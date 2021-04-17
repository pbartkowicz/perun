const path = require('path')
const rimraf = require('rimraf')
const util = require('util')
const uuid = require('uuid')
const walkSync = require('walk-sync')

const exec = util.promisify(require('child_process').exec)

/**
 * Main Perun class
 */
class Perun {
    debug = false

    cloneDir = ''

    constructor () {
        // https://cloud.google.com/functions/docs/env-var#newer_runtimes
        this.debug = process.env.FUNCTION_TARGET === undefined

        this.cloneDir = path.resolve(__dirname , `../tmp/${uuid.v4()}`)
    }
    
    async run (req) {
        this.log('Request data: ', req)

        const repositoryUrl = 'https://github.com/pbartkowicz/perun' // TODO: From request
        const success = await this.cloneRepository(repositoryUrl)

        if (success) {
            this.process()
        }

        this.cleanup()
    }

    /**
     * Clone repository from github
     * @param {string} repository
     */
    async cloneRepository (repository) {
        this.log(`Cloning: ${repository} to ${this.cloneDir}`)

        await exec(`git clone ${repository} ${this.cloneDir}`)

        return true
    }

    /**
     * Process repository
     */
    process () {
        const paths = walkSync(this.cloneDir, {
            ignore: [
                '.git',
                '.yarn'
            ]
        })

        for (const p of paths) {
            this.analyzeFile(p)
        }
    }

    analyzeFile (file) {
        // TODO: Logic
    }

    /**
     * Cleanup after processing
     */
    cleanup () {
        this.log(`Cleaning up from ${this.cloneDir}`)

        rimraf.sync(this.cloneDir)
    }

    log (...messages) {
        if (this.debug) {
            console.log(...messages)
        }
    }
}

module.exports = Perun
