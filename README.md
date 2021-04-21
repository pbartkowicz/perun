# Perun

## Development

TODO

## Deployment

### Requirements

- [Terraform](https://www.terraform.io/) 0.15.0
- [Python](https://www.python.org/) 3.5 <= version <= 3.8
- [GCloud](https://cloud.google.com/sdk/docs/install)

Enable authorization to the Google Cloud Platform from your local machine and initialize Terraform. This action should be performed only once.

```sh
make init
```

**Warning:** Do not override Terraform state in the Google Cloud Platform (remote state), override local state instead.

Deploy infrastructure to the Google Cloud Platform. This command creates or updates the infrastructure.

```sh
make deploy
```

Destroy Cloud Function's function.

```sh
make clean-function
```

Show actions which will be performed on the infrastructure.

```sh
make plan
```

Create a package with the function's source code.

```sh
make build
```

Remove `build` directory.

```sh
make clean
```