# My QA Project

End-to-end automation project for the AstroFlow RFQ form, built with Playwright + TypeScript, following the Page Object Model.

## Project structure

```
.
├── .github/workflows/playwright.yml  # CI: runs tests on push/PR + manual dispatch
├── .husky/pre-commit                 # Blocks commits that fail lint-staged
├── docs/screenshots/                 # Reference screenshots
├── tests/
│   ├── pages/                        # Page Objects (BasePage, HomePage, RfqPage)
│   ├── data/                         # Test data (valid combinations + invalid cases)
│   └── ui/                           # Test specs
├── playwright.config.ts
├── eslint.config.js
└── tsconfig.json
```

## Installation

```bash
npm install
npx playwright install
```

## Environment variables

Copy `.env.example` to `.env` (or simply remove the `.example` suffix) and adjust the values as needed:

```bash
cp .env.example .env
```

- `BASE_URL` — the base URL of the environment under test. Defaults to production (`https://astroflow.wingflows.com/`) if not set.

`.env.example` is committed as a template and documents which variables exist; `.env` holds your real local values and is git-ignored, so it's never committed.

## Running tests

```bash
npm test               # full suite, all browsers (chromium, firefox, webkit)
npm run test:smoke     # @smoke only — critical happy path
npm run test:sanity    # @sanity — happy path + valid combinations
npm run test:regression # @regression — full suite, including invalid cases
```

Run against a single browser with `--project`, e.g. `npx playwright test --project=chromium`.

View the HTML report from the last run:

```bash
npx playwright show-report
```

## Code quality

```bash
npm run lint     # ESLint (type-aware rules, incl. no-floating-promises)
npm run format   # Prettier
```

A Husky pre-commit hook runs `lint-staged` automatically, linting and formatting staged `.ts`/`.json`/`.md` files and blocking the commit if ESLint reports an error.

## CI/CD

GitHub Actions (`.github/workflows/playwright.yml`) runs the suite on every push/PR to `main`/`develop`, and can also be triggered manually via `workflow_dispatch` with a choice of test group (`smoke`/`sanity`/`regression`). Dependencies and Playwright browsers are cached between runs, and the HTML report is uploaded as a build artifact.

## Known findings and limitations

While building the test suite, we identified several validation gaps in the real application. These are documented here for visibility, not covered by dedicated invalid-case tests since the app currently accepts this input:

- **Email**: relies on weak native HTML5 validation (`text@text` pattern only) — does not validate a real domain or TLD (e.g. `2@2` is accepted).
- **Phone**: no format validation at all — only checks that the field is not empty (`required`). Letters and any non-empty text are accepted.
- **Estimated Monthly Volume**: no validation whatsoever — accepts free text (including letters) instead of requiring a numeric quantity.
- **First Name / Last Name**: accept numbers and special characters, with no restriction to letters only.
- **All text fields**: none have a `maxlength` — arbitrarily long strings (tested with 3000 characters) are accepted without truncation or error.

## Testing decisions

- **Network error mocking (`page.route()`)**: Not included in the suite. The RFQ form submission is entirely client-side — it doesn't make any network request (no `fetch`/`xhr`), so there's no backend endpoint to intercept and simulate a failure for. Mocking an unrelated request (e.g., a static asset) just to demonstrate the technique wouldn't map to any real user-facing failure mode of this app, so we chose not to add a fabricated test for it.
- **Form success/error handling**: the app communicates success via a native `window.alert()` (not a DOM element) and relies entirely on native HTML5 validation for errors (no custom error messages in the DOM). `RfqPage` accounts for both — see `submitAndGetConfirmationMessage()` and `isFieldInvalid()`.
