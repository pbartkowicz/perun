#

### [src/authenticate.js](src/authenticate.js)
File contains three utility functions used to authenticate to GitHub from the Google Cloud.

- **verifySignature** - Check if signature of the request is valid
- **newOctokitApp** - creates new Octokit application
- **newOctokitInstallation** - creates new Octokit installation application

### [src/checks.js](src/checks.js)
File contains utility class that represents GitHub check.

### [src/index-gcloud.js](src/index-gcloud.js)
Entrypoint for the Google Cloud function.

### [src/index.js](src/index.js)
Application entrypoint.

### [src/perun.js](src/perun.js)
Main application class. 

### [src/promise-exec.js](src/promise-exec.js)
Utility file. Exports `child_process.execFile` function that is promisified.
It is in the separate file to enable mocking in the test.

### [src/sensitive-data-searcher.js](src/sensitive-data-searcher.js)
Class responsible for searching potential sensitive data in the single file.

### [src/sensitive-keyword.js](src/sensitive-keyword.js)
List of keywords for which the search for sensitive data will be performed.
