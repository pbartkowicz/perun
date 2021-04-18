const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const util = require('util')
const uuid = require('uuid')
const walkSync = require('walk-sync')

const exec = util.promisify(require('child_process').exec)

const sensitiveKeywords = require('./sensitive-keywords')

/**
 * Main Perun class
 */
class Perun {
    debug = false

    cloneDir = ''
    foundProblems = []

    constructor () {
        // https://cloud.google.com/functions/docs/env-var#newer_runtimes
        this.debug = process.env.FUNCTION_TARGET === undefined

        this.cloneDir = path.resolve(__dirname , `../tmp/${uuid.v4()}`)
    }
    
    async run (req) {
        this.log('yellow', 'Request data: ')
        this.logRaw(req)

        const repositoryUrl = 'https://github.com/pbartkowicz/perun' // TODO: From request
        const success = await this.cloneRepository(repositoryUrl)

        try {
            if (success) {
                this.process()
            }
        } finally {
            this.cleanup()
        }
    }

    /**
     * Clone repository from github
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
            ignore: [
                '.git',
                '.yarn'
            ]
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

    analyzeFile (file) {
        const extension = path.extname(file)
        const contents = fs.readFileSync(file)

        this.log('cyan', `Analyzing file ${file}.\t\tExtension: ${extension}`)

        this.lookForSensitiveData(extension, contents)
        this.lookForSqlInjection(extension, contents)
    }

    /**
     * Look for sensitive data inside file contents
     *
     * @param {string} extension
     * @param {Buffer} contents
     */
    lookForSensitiveData (extension, contents) {
        for (const keyword of sensitiveKeywords) {
            if (contents.includes(keyword)) {
                this.foundProblems.push({
                    keyword: keyword,
                    lineNumber: 1     // TODO
                })
            }
        }
    }

    /**
     * Look for SQL injection inside file contents
     *
     * @param {string} extension
     * @param {Buffer} contents
     */
    lookForSqlInjection (extension, contents) {
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
