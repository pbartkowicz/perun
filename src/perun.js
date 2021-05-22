const chalk = require('chalk')
const fs = require('fs')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')
const util = require('util')
const uuid = require('uuid')
const walkSync = require('walk-sync')

const exec = util.promisify(require('child_process').exec)

const ignoredFilesAndDirectories = require('./ignore/files-and-dirs')
const SensitiveDataSearcher = require('./sensitive-data-searcher')
const verifySignature = require('./authenticate')

/**
 * Main Perun class
 */
class Perun {
    constructor () {
        // https://cloud.google.com/functions/docs/env-var#newer_runtimes
        this.debug = process.env.FUNCTION_TARGET === undefined

        this.cloneDir = path.join(os.tmpdir(), uuid.v4())
        this.foundProblems = []

        this.searcher = new SensitiveDataSearcher()
    }

    async run (req, res) {
        this.log('yellow', 'Request data: ')
        this.logRaw(req)

        if (!await verifySignature(req)) {
            res.status(403).send('Unauthorized')
            return
        }

        if (!this.verifyAction(req)) {
            return
        }

        const repositoryUrl = req.body.repository.html_url
        const success = await this.cloneRepository(repositoryUrl)

        try {
            if (success) {
                this.searcher.build()
                this.process()
            }
        } finally {
            this.cleanup()
        }
    }

    /**
     * Check if action performed on the repository is one of edited, opened or reopened
     *
     * @param  {Request} req
     * @return {boolean}
     */
    verifyAction (req) {
        return ['edited', 'opened', 'reopened'].includes(req.body.action)
    }

    /**
     * Clone repository from github
     *
     * @param {string} repository
     */
    async cloneRepository (repository) {
        this.log('green', `Cloning: ${repository} to ${this.cloneDir}`)

        await exec(`git clone ${repository} ${this.cloneDir}`)

        return true
    }

    /**
     * Process repository
     */
    process () {
        const paths = walkSync(this.cloneDir, {
            directories: false,
            ignore: ignoredFilesAndDirectories
        })

        for (const p of paths) {
            this.analyzeFile(p)
        }

        if (this.foundProblems.length > 0) {
            this.log('red', 'Found problems: ')
            this.logRaw(this.foundProblems)
        } else {
            this.log('green', 'No problems found')
        }
    }

    /**
     * Analyze file
     *
     * @param {string} file
     */
    analyzeFile (file) {
        const extension = path.extname(file)
        const contents = fs.readFileSync(path.join(this.cloneDir, file)).toString()

        this.log('cyan', `Analyzing file ${file}`)

        this.lookForSensitiveData(file, extension, contents)
        this.lookForSqlInjection(file, extension, contents)
    }

    /**
     * Look for sensitive data inside file contents
     *
     * @param {string} file
     * @param {string} extension
     * @param {string} contents
     */
    lookForSensitiveData (file, extension, contents) {
        const result = this.searcher.search(file, contents)

        if (!result.valid) {
            this.foundProblems = this.foundProblems.concat(result.problems)
        }
    }

    /**
     * Look for SQL injection inside file contents
     *
     * @param {string} file
     * @param {string} extension
     * @param {string} contents
     */
    lookForSqlInjection (file, extension, contents) {
        // TODO: Look for sql injection only in specific filetypes
    }

    /**
     * Cleanup after processing
     */
    cleanup () {
        this.log('green', `Cleaning up from ${this.cloneDir}`)

        rimraf.sync(this.cloneDir)
    }

    logRaw (...messages) {
        if (this.debug) {
            console.log(...messages)
        }
    }

    log (color = 'blue', ...messages) {
        if (chalk.supportsColor) {
            this.logRaw(chalk[color](...messages))
        } else {
            this.logRaw(...messages)
        }
    }
}

module.exports = Perun
