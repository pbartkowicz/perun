# Perun

## Development

TODO

## Deployment

### Requirements

- [Terraform](https://www.terraform.io/) 0.15.0
- [Python](https://www.python.org/) 3.5 <= version <= 3.8
- [GCloud](https://cloud.google.com/sdk/docs/install)

Enable authorization to the Google Cloud from your local machine

```sh
gcloud auth application-default login
```

Initialize terraform

```sh
terraform -chdir=./terraform init
```

**Warning:** Do not override terraform's state in the Cloud (remote state), override local state instead.

Deploy

```sh
zip -r build/index.zip src/ package.json yarn.lock
terraform -chdir=./terraform apply
```