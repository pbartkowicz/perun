// https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#secretmanager-access-secret-version-nodejs

// Imports the Secret Manager library
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

// Instantiates a client
const client = new SecretManagerServiceClient()

/**
 * Retrieve secret value
 *
 * @returns {string}
 */
const accessSecretVersion = async (name) => {
    const [version] = await client.accessSecretVersion({
        name: name
    })

    // Extract the payload as a string
    return version.payload.data.toString()
}

module.exports = {
    accessSecretVersion
}
