# Infrastructure setup

## GitHub Application

### [Create an application](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app)

1. Add url for `Homepage URL` - for example it can be a link to the repository of application implementation.

2. Do not select `Request user authentication (OAuth) during installation` option.

3. Add temporary url for `Webhook URL`. It will be later populated with Cloud Function's url.

4. Add `Webhook secret` parameter.

5. In `Permissions` section select Read & write permissions for `Checks` and `Pull requests`.

6. In `Subscribe to events` select `Check suite`, `Check run` and `Pull request` options.

7. Choose if the application should be available to other GitHub users. We recommend selecting `Only on this account` option for the testing purposes.

### [Install an application on the other repository](https://docs.github.com/en/developers/apps/managing-github-apps/installing-github-apps#installing-your-private-github-app-on-your-repository)

## Google Cloud

### [Create a project](https://cloud.google.com/resource-manager/docs/creating-managing-projects)

### Create resources

1. [Create a bucket](https://cloud.google.com/storage/docs/creating-buckets) for storing Terraform's remote state.

2. [Create a secret](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#create) for storing application's private key.

Use private key which was generated during the creation of the GitHub application.

3. [Create a secret](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#create) for storing application's authentication information in the following format.

```json
{
    "appId": 333,
    "clientId": "client-id-value",
    "secret": "application-secret"
}
```

- appId - `App ID` parameter which can be found on the application's General subpage in About section.
- clientId - `Client ID` parameter which can be found on the application's General subpage in About section.
- secret - value of `Webhook secret` parameter.

> **CAUTION!** These resources shouldn't be created via Terraform due to security reasons.

### Change parameters in Terraform manifests

#### Backend manifest

```bash
terraform {
  backend "gcs" {
    bucket = "<bucket-name>"
    prefix = "terraform/state"
  }
}
```

#### Main manifest

```bash
provider "google" {
  project = "<project-id>"
  region  = "europe-central2"
  zone    = "europe-central2-a"
}
```

```bash
resource "google_storage_bucket" "bucket" {
  name     = "<different-bucket-name>"
  location = "EUROPE-CENTRAL2"
}
```

Change environment variables in `function` resource.

```bash
environment_variables = {
  "SECRETS_PATH"     = "<path-to-secrets>",
  "PRIVATE_KEY_PATH" = "<path-to-private-key>",
}
```

```bash
resource "google_project_iam_member" "project" {
  project = "<project-id>"
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}
```

## Update GitHub Application

Change `Webhook URL` parameter to the Cloud Function's `Trigger URL`.