// https://docs.github.com/en/rest/reference/checks#create-a-check-run
// https://github.com/octokit/auth-app.js#usage-with-octokit
// https://github.com/octokit/octokit.js#github-app

const https = require('https')

const { Octokit } = require("@octokit/core")
const { createAppAuth } = require("@octokit/auth-app")

const { accessSecretVersion } = require('./secret-gcloud')

const createCheckRun = async (req) => {
    const secret = await accessSecretVersion(process.env.SECRET_PATH)
    const privateKey = await accessSecretVersion(process.env.PRIVATE_KEY_PATH)
    const appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: 111722,
            privateKey: privateKey,
            clientId: 'Iv1.b873a156f8ab41ef',
            clientSecret: secret,
        }
    })

    const installation = await appOctokit.request(`GET /repos/${req.body.repository.owner.login}/${req.body.repository.name}/installation`)
    console.log(`Status code: ${installation.status}`)
    console.log(`Status message: ${installation.data}`)
    console.log(installation.data.id)

    const installationOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: 111722,
            privateKey: privateKey,
            installationId: installation.data.id
        }
    })

    const resp = await installationOctokit.request(`POST /repos/${req.body.repository.owner.login}/${req.body.repository.name}/check-runs`, {
        name: 'test-check',
        head_sha: `${req.body.pull_request.head.sha}`,
        status: 'queued',
    })
    console.log(`Status code: ${resp.status}`)
    console.log(`Status message: ${resp.data}`)
}

module.exports = {
    createCheckRun
}