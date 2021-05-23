// https://docs.github.com/en/rest/reference/checks#create-a-check-run

/**
 * CheckRun represents github's check run object.
 */
class CheckRun {
    constructor(name, title, summary, problemsType, msg) {
        this.id = null
        this.name = name
        this.status = 'in_progress'
        this.conclusion = 'success'
        this.output = {
            title: title,
            summary: summary,
            annotations: []
        }
        this.problemsType = problemsType
        this.msg = msg
    }

    /**
     * Create check run
     * 
     * @param {Request} req 
     * @param {Octokit} octokitInstallation
     */
    async create(req, octokitInstallation) {
        const res = await octokitInstallation.request('POST /repos/{owner}/{repo}/check-runs', {
            owner: req.body.repository.owner.login,
            repo: req.body.repository.name,
            name: this.name,
            head_sha: `${req.body.pull_request.head.sha}`,
            status: this.status,
        })

        if (res.status !== 201) {
            throw new Error(`${JSON.stringify(res)}`)
        }
        this.id = res.data.id
    }

    /**
     * Update check run by passing it's results
     * 
     * @param {Request} req 
     * @param {Octokit} octokitInstallation
     */
    async update(req, octokitInstallation) {
        let body = {
            owner: req.body.repository.owner.login,
            repo: req.body.repository.name,
            check_run_id: this.id,
            name: this.name,
            head_sha: `${req.body.pull_request.head.sha}`,
            status: this.status,
            conclusion: this.conclusion
        }

        if (this.output.annotations.length !== 0) {
            body.output = this.output
        }

        const res = await octokitInstallation.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', body)

        if (res.status !== 200) {
            throw new Error(`${JSON.stringify(res)}`)
        }
    }

    /**
     * Updates local status of check run based on results of scan
     * 
     * @param {[]object} foundProblems 
     */
    updateStatus(foundProblems) {
        this.status = 'completed'
        const problems = foundProblems.filter(p => {
            return p.type === this.problemsType
        })
        if (problems.length === 0) {
            this.conclusion = 'success'
            return
        }
        this.conclusion = 'failure'
        problems.forEach(p => {
            this.output.annotations.push({
                path: p.file,
                start_line: p.line.number,
                end_line: p.line.number,
                annotation_level: 'warning',
                message: this.msg
            })
        })
    }
}

module.exports = {
    CheckRun
}
