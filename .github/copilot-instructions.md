# Copilot instructions for hmpps-registers

Node/TypeScript Express app (GOV.UK Frontend + Nunjucks) that renders the HMPPS registers
(prison, court, other agency) by calling the Prison Register API.

## Project layout

- `server/routes/<register>/` — router, controller, view class, mapper and data per register
- `server/services/prisonRegisterService.ts` — all Prison Register API calls
- `server/views/pages/<register>/` — Nunjucks templates
- `server/utils/nunjucksSetup.ts` — Nunjucks filters, including the list filter/checkbox helpers
- `server/@types/prisonRegisterImport/index.d.ts` — generated from the API's OpenAPI spec, do not edit by hand
- `integration_tests/` — Cypress specs, page objects and WireMock stubs

## Conventions

- Mirror the existing register when adding a new one: router → controller → view class → mapper → `.njk` page.
- Add API calls to `prisonRegisterService` only; controllers must not call `RestClient` directly.
- Expose API types via `server/@types/prisonRegister/index.d.ts` rather than importing the generated file.
- Add unit tests alongside the code (`*.test.ts`) and mock data under `server/routes/testutils/`.

## Validating changes

- `npm run lint`
- `npm run typecheck`
- `npm run test` (or target a single suite with `npx jest <path>`)

## Running integration tests

**Always rebuild and restart `start-feature` before running the integration tests.**
The feature server runs the compiled output in `dist/`, so a running server will keep serving
stale code and tests will fail or pass misleadingly against the previous build.

1. Ensure the test dependencies are up: `docker compose -f docker-compose-test.yml up -d`
2. Stop any existing feature server on port 3007.
3. Rebuild: `npm run build`
4. Start it again: `npm run start-feature` and wait for `http://localhost:3007/ping` to return 200.
5. Run the tests: `npm run int-test` (or `npx cypress run --spec <spec>` for a single spec).

Use `npm run start-feature:dev` if you want auto-restart on changes while iterating.

At the end of a change if you start a fresh instance of the server using start-feature task, you don't need to wait for the process to finish since it never will.
