// https://docs.github.com/en/rest/reference/checks#create-a-check-run

const createOrGetCheckRun = async (req, octokitInstallation, name) => {
    let res = await octokitInstallation.request('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
        owner: req.body.repository.owner.login,
        repo: req.body.repository.name,
        ref: req.body.pull_request.head.ref,
        check_name: name,
    })

    if (res.status !== 200) {
        throw new Error(`${JSON.stringify(res)}`)
    }

    // Check already exists
    if (res.data.total_count > 0) {
        return res.data.check_runs[0].id
    }
    
    res =  await octokitInstallation.request('POST /repos/{owner}/{repo}/check-runs', {
        owner: req.body.repository.owner.login,
        repo: req.body.repository.name,
        name: name,
        head_sha: `${req.body.pull_request.head.sha}`,
        status: 'in_progress',
    })

    if (res.status !== 201) {
        throw new Error(`${JSON.stringify(res)}`)
    }
    return res.data.id
}

const updateCheckRun = async (req, octokitInstallation, checkId, name) => {
    const res = await octokitInstallation.request('PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}', {
        owner: req.body.repository.owner.login,
        repo: req.body.repository.name,
        check_run_id: checkId,
        name: name,
        head_sha: `${req.body.pull_request.head.sha}`,
        status: 'completed',
        conclusion: 'failure' // TODO: change me
        // TODO: output with annotations
    })
    
    if (res.status !== 200) {
        throw new Error(`${JSON.stringify(res)}`)
    }
}

module.exports = {
    updateCheckRun,
    createOrGetCheckRun
}
