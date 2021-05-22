// https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
// https://humanwhocodes.com/snippets/2020/08/validate-github-webhook-signature-nodejs/

const crypto = require('crypto')

const { accessSecretVersion } = require('./secret-gcloud')

/**
 * Check if signature is valid
 *
 * @param   {Request} req Request
 * @returns {boolean} Is signature valid
 */
const verifySignature = async (req) => {
    const secret = await accessSecretVersion()
    const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body))

    const expectedSignature = `sha256=${hmac.digest('hex')}`
    const signature = req.headers['x-hub-signature-256']

    return crypto.timingSafeEqual(signature, expectedSignature)
}

module.exports = {
    verifySignature
}
