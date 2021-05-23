const chalk = require('chalk')
const fs = require('fs')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')
const uuid = require('uuid')
const walkSync = require('walk-sync')

const ignoredFilesAndDirectories = require('./ignore/files-and-dirs')
const { execFile } = require('./promise-exec')
const SensitiveDataSearcher = require('./sensitive-data-searcher')
const { verifySignature, newOctokitApp, newOctokitInstallation } = require('./authenticate')
const { CheckRun } = require('./checks')

/**
 * Main Perun class
 */
class Perun {
    constructor() {
        // https://cloud.google.com/functions/docs/env-var#newer_runtimes
        this.debug = process.env.FUNCTION_TARGET === undefined

        this.cloneDir = path.join(os.tmpdir(), uuid.v4())
        this.foundProblems = []

        this.sensitiveDataSearcher = new SensitiveDataSearcher()

        this.octokitApp = null
        this.octokitInstallation = null

        this.sensitiveDataCheckRun = new CheckRun(
            'sensitive-data',
            'Sensitive Data Check',
            'Found potential hardcoded sensitive data',
            'Sensitive data',
            'Please make sure to store sensitive data in the secure location'
        )
        this.sqlInjectionCheckRun = new CheckRun(
            'sql-injection',
            'SQL Injection Check',
            'Found potential sql injection',
            'todo', // TODO: Change it to the type of problem for sql injection
            'Please make sure to prevent SQL Injection'
        )
    }

    async run(req, res) {
        this.log('yellow', 'Request data: ')
        this.logRaw(req)

        if (!await verifySignature(req)) {
            res.status(403).send('Unauthorized')
            return
        }

        if (!this.verifyAction(req)) {
            return
        }

        try {
            this.octokitApp = await newOctokitApp()
            this.octokitInstallation = await newOctokitInstallation(req, this.octokitApp)
        } catch (e) {
            res.status(500)
            console.error(e.message)
            return
        }

        try {
            await this.sensitiveDataCheckRun.create(req, this.octokitInstallation)
            await this.sqlInjectionCheckRun.create(req, this.octokitInstallation)
        } catch (e) {
            res.status(500)
            console.error(e.message)
            return
        }

        const repositoryUrl = req.body.repository.html_url
        const success = await this.cloneRepository(repositoryUrl, req.body.pull_request.head.ref)

        try {
            if (success) {
                this.sensitiveDataSearcher.build()
                this.process()
                this.sensitiveDataCheckRun.updateStatus(this.foundProblems)
                this.sqlInjectionCheckRun.updateStatus(this.foundProblems)
                await this.sensitiveDataCheckRun.update(req, this.octokitInstallation)
                await this.sqlInjectionCheckRun.update(req, this.octokitInstallation)
            }
        } catch (e) {
            res.status(500)
            console.error(e.message)
        }
        finally {
            this.cleanup()
        }
    }

    /**
     * Check if action performed on the repository is one of edited, opened or reopened
     *
     * @param  {Request} req
     * @return {boolean}
     */
    verifyAction(req) {
        return ['edited', 'opened', 'reopened'].includes(req.body.action)
    }

    /**
     * Clone repository from github
     *
     * @param {string} repository
     * @param {string} branch
     */
    async cloneRepository(repository, branch) {
        this.log('green', `Cloning: ${repository} to ${this.cloneDir}`)

        const command = 'git'
        const args = ['clone', '-b', branch, repository, this.cloneDir]
        await execFile(command, args)

        return true
    }

    /**
     * Process repository
     */
    process() {
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
    analyzeFile(file) {
        const contents = fs.readFileSync(path.join(this.cloneDir, file)).toString()

        this.log('cyan', `Analyzing file ${file}`)

        this.lookForSensitiveData(file, contents)
        this.lookForSqlInjection(file, contents)
    }

    /**
     * Look for sensitive data inside file contents
     *
     * @param {string} file
     * @param {string} contents
     */
    lookForSensitiveData(file, contents) {
        const result = this.sensitiveDataSearcher.search(file, contents)

        if (!result.valid) {
            this.foundProblems = this.foundProblems.concat(result.problems)
        }
    }

    /**
     * Look for SQL injection inside file contents
     *
     * @param {string} file
     * @param {string} contents
     */
    lookForSqlInjection(file, contents) {
        // TODO: Look for sql injection only in specific filetypes
    }

    /**
     * Cleanup after processing
     */
    cleanup() {
        this.log('green', `Cleaning up from ${this.cloneDir}`)

        rimraf.sync(this.cloneDir)
    }

    logRaw(...messages) {
        if (this.debug) {
            console.log(...messages)
        }
    }

    log(color = 'blue', ...messages) {
        if (chalk.supportsColor) {
            this.logRaw(chalk[color](...messages))
        } else {
            this.logRaw(...messages)
        }
    }
}

module.exports = Perun
