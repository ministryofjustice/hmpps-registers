# hmpps-registers

[![Known Vulnerabilities](https://snyk.io/test/github/ministryofjustice/hmpps-registers/badge.svg)](https://snyk.io/test/github/ministryofjustice/hmpps-registers)

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies.

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires:
* hmpps-auth - for authentication
* redis - session store and token caching

### Running the app for development

To start the main services excluding the example typescript template app:

`docker compose up --scale=app=0`

Create an environment file by copying `.env.example` -> `.env`
Environment variables set in here will be available when running `start:dev`

Install dependencies using `npm install`, ensuring you are using `node v24.15.0` (or later)

And then, to build the assets and start the app with nodemon:
Note: Using `nvm` (or [fnm](https://github.com/Schniz/fnm)), run `nvm install --latest-npm` within the repository folder
to use the correct version of node, and the latest version of npm. This matches the `engines` config in `package.json`
and the CircleCI build config.

And then, to build the assets and start the app with esbuild:

`npm run start:dev`

### Run linter

`npm run lint`
* `npm run lint` runs `eslint`.
* `npm run typecheck` runs the TypeScript compiler `tsc`.

### Run unit tests

`npm run test`

Run:

```shell
npm run test-coverage
```

### Running integration tests



For local running, start a test db, redis, and wiremock instance by:

`docker compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with auto-restart on changes)

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the cypress UI:

`npm run int-test-ui`

## Court geographical area

The court details page supports updating or clearing the optional geographical area.
Start typing a name and select an autocomplete suggestion, or clear the field to remove it.
Geographical areas use the same `/reference-data/areas` API lookup as court areas.

## Court local authority

The court details page supports updating or clearing the optional local authority.
Start typing a name and select an autocomplete suggestion, or clear the field to remove it.
Suggestions and code validation use the `/reference-data/local-authorities` API lookup.

## Court payroll region

The court details page supports updating or clearing the optional payroll region.
Start typing a name and select an autocomplete suggestion, or clear the field to remove it.
Suggestions and code validation use the `/reference-data/payroll-regions` API lookup.

## Add a court

Select **Add a new court** next to the filter button on the court register list.
Enter the court details, court type, accessible access, CJIT code, area, region,
geographical area, local authority and payroll region, then check the answers.
Use the Change links to amend answers before selecting **Confirm and add court**.

New courts are active. Description, CJIT code and geographical reference fields
are optional; court ID, name, court type and an accessible access answer are required.
Court IDs must be unique across all agency types. The `/legacy/agency/{agencyId}/is-used`
API checks availability when entering details and before creation: 204 means available,
while 200 returns the existing agency whose name is shown in the validation error.
Each journey is stored separately in the session so that drafts in different tabs
do not overwrite each other. Cancel discards the draft; no court is created until
the check-answers page is submitted. On success the court details page provides the
existing links to add addresses, phone numbers and email addresses.

## Delete a court

Select **Delete court** on the court details page, then **Delete** on the confirmation
page to permanently remove the court and its addresses, email addresses and phone
numbers. Cancel returns to the court details without deleting anything.

Both buttons and the confirmation and submission endpoints are gated by
`agencyRegistersDeleteEnabled` (`AGENCY_REGISTER_DELETE_ENABLED`). This defaults
to enabled locally and is disabled in production configuration.

### Delete a court address

Select **Delete** next to an address's **Update** link, then **Delete address** on
the confirmation page to remove only that address. Cancel returns to court details
without deleting it. The link and both endpoints use the same
`agencyRegistersDeleteEnabled` flag.

## Reusing agency maintenance patterns

Keep agency-specific controllers, creation steps, routes and DTO mappers explicit.
Reuse `AgencyMutationResponse`, `UpdateAgencyAddress`, the pure validators in
`server/validation/agencyFields.ts` and shared agency views where the behaviour matches.
Court create and update require a name of at most 40 characters and allow an optional
description of at most 3000 characters; other agencies should specify their own limits.

Reference fields share `referenceAutocomplete.js` with small field-specific initializers.
Typing invalidates the hidden selected code; only selecting a suggestion sets it.
Both code and description blank clears an optional reference. Unselected text is an
error, not a request to clear it. Validation uses the API's canonical description.
Reuse `integration_tests/mockApis/referenceData.ts` in browser specs because reference
suggestions are cached for the server process; keep expected mutation payloads explicit.

## Change log

A changelog for the service is available [here](./CHANGELOG.md)
### Dependency Checks

The template project has implemented some scheduled checks to ensure that key dependencies are kept up to date.

### Types

Run the following:
```bash
npx openapi-typescript https://prison-register-dev.hmpps.service.justice.gov.uk/v3/api-docs --output server/@types/prisonRegisterImport/index.d.ts
```
