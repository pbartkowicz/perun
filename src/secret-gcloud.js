// https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#secretmanager-access-secret-version-nodejs

// const name = 'projects/my-project/secrets/my-secret/versions/5';
const name = 'projects/hopeful-sunset-311310/secrets/test-secret/versions/latest';

// Imports the Secret Manager library
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// Instantiates a client
const client = new SecretManagerServiceClient();

async function accessSecretVersion() {
  const [version] = await client.accessSecretVersion({
    name: name,
  });

  // Extract the payload as a string.
  const payload = version.payload.data.toString();

  // WARNING: Do not print the secret in a production environment - this
  // snippet is showing how to access the secret material.
  console.info(`Payload: ${payload}`);
  return payload;
}

module.exports = accessSecretVersion;

//accessSecretVersion();