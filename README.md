# Perun

## Development

### Platform requirements
- [NodeJS](https://nodejs.org/en/) >= 12
- [Yarn](https://classic.yarnpkg.com/lang/en/) >= 1.22

> **CAUTION!** Perun does not support Yarn 2 at the moment. Please use classic Yarn 1

### Installing dependencies

#### Frozen installation
To install dependencies, run `yarn --frozen-lockfile` command in the project root directory.

#### With updates
To install dependencies and update them, run `yarn` command in the project root directory, which will cause
`yarn.lock` to be updated with the newest version of packages.
> **CAUTION!** Make sure that you update versions in the package.json as well.

#### Managing dependencies
To add/remove/update dependencies please follow official `yarn` documentation:
- [yarn install](https://classic.yarnpkg.com/en/docs/cli/install)
- [yarn remove](https://classic.yarnpkg.com/en/docs/cli/remove)
- [yarn upgrade](https://classic.yarnpkg.com/en/docs/cli/upgrade)

### Linting
Linting is an inherent part of a development process. There are rules that need to be followed to ensure code quality.

#### Linting app code
To run linter over application files (`src` directory), run
```sh
yarn lint:app
```

#### Linting tests code
To run linter over tests files (`tests` directory), run
```sh
yarn lint:test
```

### Testing
Perun utilizes [Jest](https://jestjs.io/) as the test runner of choice. To run tests, simply run
```sh
yarn test
```

If you want' to collect code coverage, simply run
```sh
yarn test:coverage
```

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
