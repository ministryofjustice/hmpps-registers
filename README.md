# hmpps-registers

[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-registers/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-registers)
[![Known Vulnerabilities](https://snyk.io/test/github/ministryofjustice/hmpps-registers/badge.svg)](https://snyk.io/test/github/ministryofjustice/hmpps-registers)

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* redis - session store and token caching

### Runing the app for development

To start the main services excluding the example typescript template app: 

`docker-compose up`

Install dependencies using `npm install`, ensuring you are using >= `Node v18.x`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

Run:

```shell
npm run test-coverage
```

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`


### Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
If these are not desired in the cloned project, remove references to `check_outdated` job from `.circleci/config.yml`

### Types

Run the following:
```bash
npx openapi-typescript https://prison-register-dev.hmpps.service.justice.gov.uk/v3/api-docs --output server/@types/prisonRegisterImport/index.d.ts
```
