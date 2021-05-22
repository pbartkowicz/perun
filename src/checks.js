// https://docs.github.com/en/rest/reference/checks#create-a-check-run

const createCheckRun = async (req, octokitInstallation, name) => {
    const res =  await octokitInstallation.request(`POST /repos/${req.body.repository.owner.login}/${req.body.repository.name}/check-runs`, {
        name: name,
        head_sha: `${req.body.pull_request.head.sha}`,
        status: 'in_progress',
    })
    if (res.statusCode !== 201) {
        throw new Error(`${JSON.stringify(res)}`)
    }
    return res
}

const updateCheckRun = async (req, octokitInstallation, checkId, name) => {
    const res = await octokitInstallation.request(`PATCH /repos/${req.body.repository.owner.login}/${req.body.repository.name}/check-runs/${checkId}`, {
        name: name,
        head_sha: `${req.body.pull_request.head.sha}`,
        status: 'completed',
        conclusion: 'success' // TODO: change me
        // TODO: output with annotations
    })
    if (res.statusCode !== 200) {
        throw new Error(`${JSON.stringify(res)}`)
    }
}

module.exports = {
    createCheckRun,
    updateCheckRun
}
