// https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#secretmanager-access-secret-version-nodejs

// const name = 'projects/my-project/secrets/my-secret/versions/5';
const name = process.env.SECRET_PATH;

// Imports the Secret Manager library
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// Instantiates a client
const client = new SecretManagerServiceClient();

async function accessSecretVersion() {
  const [version] = await client.accessSecretVersion({
    name: name,
  });

  // Extract the payload as a string.
  return version.payload.data.toString();
}

module.exports = accessSecretVersion;