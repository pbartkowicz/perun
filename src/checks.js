// https://docs.github.com/en/rest/reference/checks#create-a-check-run

/**
 * CheckRun represents github's check run object.
 */
class CheckRun {
    constructor(name, title, summary) {
        this.id = null
        this.name = name
        this.status = 'in_progress'
        this.conclusion = 'success'
        this.output = {
            title: title,
            summary: summary,
            annotations: []
        }
    }

    /**
     * Create check run or update it's local state if a check run exists
     * 
     * @param {Request} req 
     * @param {Octokit} octokitInstallation
     */
    async createOrGet(req, octokitInstallation) {
        let res = await octokitInstallation.request('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
            owner: req.body.repository.owner.login,
            repo: req.body.repository.name,
            ref: req.body.pull_request.head.ref,
            check_name: this.name,
        })

        if (res.status !== 200) {
            throw new Error(`${JSON.stringify(res)}`)
        }

        // Check already exists
        if (res.data.total_count > 0) {
            this.id = res.data.check_runs[0].id
            return
        }

        res = await octokitInstallation.request('POST /repos/{owner}/{repo}/check-runs', {
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
     * Update check run by passing it's results.
     * 
     * @param {Request} req 
     * @param {Octokit} octokitInstallation
     */
    async update(req, octokitInstallation) {
        console.log(this.output)
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

    // updateStatus() {

    // }
}

module.exports = {
    CheckRun
}
