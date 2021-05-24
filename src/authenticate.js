// https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
// https://humanwhocodes.com/snippets/2020/08/validate-github-webhook-signature-nodejs/
// https://github.com/octokit/auth-app.js#usage-with-octokit
// https://github.com/octokit/octokit.js#github-app

const crypto = require('crypto')

const { Octokit } = require('@octokit/core')
const { createAppAuth } = require('@octokit/auth-app')

/**
 * Check if signature is valid
 *
 * @param   {Request} req Request
 * @param   {Auth}    auth Auth
 * @returns {boolean} Is signature valid
 */
const verifySignature = async (req, auth) => {
    const hmac = crypto.createHmac('sha256', auth.secret).update(JSON.stringify(req.body))

    const expectedSignature = `sha256=${hmac.digest('hex')}`
    const signature = req.headers['x-hub-signature-256']

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

/**
 * Create new Octokit application
 *
 * @param   {Auth}   auth Auth
 * @param   {string} privateKey
 * @returns {Octokit}
 */
const newOctokitApp = async (auth, privateKey) => {
    return new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: auth.appId,
            privateKey: privateKey,
            clientId: auth.clientId,
            clientSecret: auth.secret
        }
    })
}

/**
 * Create new Octokit installation application
 * @param {Request} req
 * @param {Octokit} octokitApp
 * @returns {Octokit}
 */
const newOctokitInstallation = async (req, octokitApp, auth, privateKey) => {
    const res = await octokitApp.request('GET /repos/{owner}/{repo}/installation', {
        owner: req.body.repository.owner.login,
        repo: req.body.repository.name
    })

    if (res.status !== 200) {
        throw new Error(JSON.stringify(res))
    }

    return new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: auth.appId,
            privateKey: privateKey,
            installationId: res.data.id
        }
    })
}

module.exports = {
    verifySignature,
    newOctokitApp,
    newOctokitInstallation
}
