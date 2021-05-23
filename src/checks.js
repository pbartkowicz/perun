// https://docs.github.com/en/rest/reference/checks#create-a-check-run

class CheckRun {
    constructor(name) {
        this.id = null
        this.name = name
        this.status = 'in_progress'
        this.conclusion = 'success'
    }

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

    async update(req, octokitInstallation) {
        const res = await octokitInstallation.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
            owner: req.body.repository.owner.login,
            repo: req.body.repository.name,
            check_run_id: this.id,
            name: this.name,
            head_sha: `${req.body.pull_request.head.sha}`,
            status: this.status,
            conclusion: this.conclusion
            // TODO: output with annotations
        })

        if (res.status !== 200) {
            throw new Error(`${JSON.stringify(res)}`)
        }
    }
}

module.exports = {
    CheckRun
}
