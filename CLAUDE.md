# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm start` — run the production build
- `npm test` — run the full test suite (unit + integration)
- `npm run test:unit` — unit tests only (fast, pure functions)
- `npm run test:integration` — integration tests (spin up in-memory Mongo; ~2s startup)
- `npm run test:watch` — vitest watch mode
- `RUN_LIVE=1 npx vitest run tests/integration/oscarLive.test.ts` — hit the real Oscar site (skipped by default)

Type-check app only: `npx tsc --noEmit --project tsconfig.app.json` (TypeScript 4.6 is too old to parse vitest's d.ts, so the main `tsconfig.json` excludes `tests/`).

Required env: `MONGODB_URI` (in `.env.local`). `lib/mongodb.ts` throws on import without it, so `npm run dev` will fail without the var. Tests do NOT need `MONGODB_URI` — the integration suite stands up its own in-memory Mongo via `mongodb-memory-server`.

## Architecture

Next.js 13 App Router + MongoDB + Tailwind + shadcn/ui. Path alias `@/*` resolves to the repo root.

### Data pipeline (the heart of the app)

The product is a UI on top of cached scrapes of Georgia Tech's public transfer-equivalency tool at `oscar.gatech.edu`. Four layers, each with a single responsibility:

1. **Transport** — `lib/gatech/oscar/client.ts` exposes `postForm(url, params)` and the `OscarEndpoints` URL table. That's the *only* file in the repo that does HTTP to Oscar.
2. **Pure parsers** — `lib/gatech/oscar/parse{States,Schools,Subjects,Equivalencies}.ts`. Each takes an HTML string and returns a typed result. No network, no mongo — testable with checked-in HTML fixtures in `tests/fixtures/`.
3. **High-level API** — `lib/gatech/oscar/index.ts` (`fetchStates`, `fetchSchoolsInState`, `fetchSubjectsInSchool`, `fetchEquivalencies`) composes transport + parser. This is what everything outside the scraper module imports.
4. **Mongo writers / crawl domain** — `lib/crawl/` holds the batching and cursor logic; `lib/utils/mongo-helper/` holds the individual school-import helpers. All db/collection names come from `lib/mongo/collections.ts` — no magic strings.

The equivalency parser handles *continuation rows*: Oscar renders multi-mapping transfer classes as a primary row followed by rows with an empty first column, each adding another GT equivalent. Verified live: Berry College's `BIO 111` expands to `BIOS 1107` + `BIOS 1107L`.

**Daily refresh cron** (`vercel.json` → `app/api/mongo/dailyRefreshData/route.ts`) runs at 21:45 UTC. The route is ~15 lines; the real work is in `lib/crawl/`:

- `lib/crawl/cursor.ts` — `isRateLimited(client)` (22-hour gate), `getCrawlCursor(client)` / `advanceCrawlCursor(client, n)`, `stampCrawlStart(client)`.
- `lib/crawl/scrapeSchool.ts` — `scrapeSchoolEquivalencies(school)` wraps the Oscar calls in `retryWithBackoff` (`lib/utils/retry.ts`) — exponential, full jitter, 5min cap. Throws if all attempts fail.
- `lib/crawl/failureQueue.ts` — `recordFailure` / `clearFailure` / `getFailedSchools` against the `crawlFailures` collection. Failed schools are retried at the *start* of the next batch.
- `lib/crawl/refreshBatch.ts` — `refreshNextBatch(client, cursor, states)`:
  1. Pulls up to `FAILURE_RETRY_CAP = 100` previously-failed schools from the queue (oldest first).
  2. Adds `CRAWL_BATCH_SIZE = 100` more from the cursor (deduped against the failure list).
  3. Scrapes each in parallel with retry. Successful scrapes get `lastScrapedAt: Date` stamped on the upsert and clear from the failure queue.
  4. **Empty results are not written** — they're recorded as `empty_result` failures (parser regression protection). A school must legitimately scrape ≥1 equivalent to be persisted; otherwise the existing doc is preserved.
  5. Network/parse errors are recorded as `scrape_error` failures.
  6. Cursor advances by `CRAWL_BATCH_SIZE` regardless (failure-queue starvation isn't possible since failures don't block cursor progress).

The crawl runs off Vercel — long backoffs are fine; no 60s function-timeout to worry about. Full-crawl cadence: `ceil(numSchools / 100)` days, plus drain time on the failure queue.

### Frontend flow

- `app/(marketing)/page.tsx` — landing.
- `app/(marketing)/list/page.tsx` — the planner. Wraps `<ConfigForm>` (school + major comboboxes) and `<ClassPickerForm>` (the matching table) in `SchoolMajorContextProvider`. The two forms communicate via the context in `components/config-form.tsx`, not props. Context now carries `school` + `major` objects with flat `schoolValue`/`schoolLabel`/etc. accessors kept for compatibility.
- `lib/utils/db-consumer/{getSchools,getEquivalencies}.ts` use the shared `lib/utils/fetchJson.ts` helper (with `ONE_MONTH_SECONDS` revalidation).

### Class picker (formerly one 572-line file, now decomposed)

- `components/class-picker-form.tsx` (~75 lines) — orchestrator. Reads context, runs `useSchoolEquivalencies`, delegates rendering.
- `hooks/useSchoolEquivalencies.ts` — the fetch + state (+ cancellation on unmount).
- `components/class-picker/SubjectRows.tsx` — dispatches by requirement shape: `LAB1`/`LAB2` → `MultiOptionRow`; `{ OR: [...] }` → `MultiOptionRow`; `{ AND: [...] }` → `AndRequirementRows` (one `ClassRow` per course with separator).
- `components/class-picker/ClassRow.tsx` — a single table row with a picker dialog.
- `components/class-picker/ElectivePicker.tsx` — replaces the old self-recursive `ElectiveAndCoreRow`. Owns a `Selection[]` list; renders confirmed rows + one "+ Choose Equivalent Elective" row. Add/remove is explicit.
- `components/class-picker/EquivalencyCard.tsx`, `EquivalencyGrid.tsx`, `SelectedRowDetails.tsx` — presentational.

### Matching logic (pure, tested)

All matching lives in `lib/matching/`:

- `normalize.ts` — `normalizeCourseCode(value)` strips whitespace (including the non-breaking space Oscar emits) and lowercases. Every comparison goes through this.
- `matchRequirement.ts` — `matchesCourse`, `filterByCourse`, `filterByAnyCourse`, `resolveRequirement`. The `MATH 1552` wildcard (`MATH 1X52` / `MATH 15X2` also match) lives here, nowhere else.
- `groupByCoreArea.ts` — groups equivalents into GT core-curriculum areas from `assets/gatech/core.ts`. Always returns a key per area (even empty arrays) so the UI can iterate.
- `groupByDepartment.ts` — groups by department prefix for elective bucketing. Skips `0.0`-credit placeholders. Department prefix comes from a regex split on whitespace (no reliance on the exact Oscar separator).
- `labRequirements.ts` — `LAB1`/`LAB2` subject-key handling and the CS two-course-sequence disclaimer.

### Major / core requirements

- `assets/gatech/majors.ts` — `majors` map built by `MajorBuilder`. Every major auto-includes `ENGL 1101`/`1102` and `MATH 1551`.
- `assets/gatech/core.ts` — `cores` map of GT's core-curriculum buckets.

### Tests

- `tests/unit/` — pure functions: `normalize`, `matchRequirement`, `groupByCoreArea`, `groupByDepartment`, all four Oscar parsers (with HTML fixtures from `tests/fixtures/`).
- `tests/integration/` — in-memory Mongo via `tests/integration/mongoHelpers.ts`. Covers the cursor module and all three API route handlers (routes are imported directly and called; `@/lib/mongodb` is `vi.mock`ed to return the test client).
- `tests/integration/oscarLive.test.ts` — gated on `RUN_LIVE=1`; hits oscar.gatech.edu directly for end-to-end validation.
- `tests/fixtures/` — checked-in HTML captured from live Oscar responses. Regenerate by re-running the curl commands documented at the top of each fixture file.

### UI conventions

- shadcn/ui components live in `components/ui/`. `components.json` is the shadcn config (style: default, baseColor: slate, RSC on).
- `cn()` from `@/lib/utils` is the tailwind-merge + clsx helper.
- Dark mode via `next-themes` (`<ThemeProvider attribute="class" defaultTheme="system">` in `app/layout.tsx`).
- `HotelsAllowBanner` is a cross-promo banner and takes a `utmCampaign` prop — keep the campaign name unique per surface so the UTM data stays useful.

## Code style — Clean Code principles

When you edit a file, apply the boy-scout rule: leave it cleaner than you found it. Don't rewrite unrelated code in the same PR.

**Principles to uphold**

- **SRP per file.** Route handlers parse + respond. UI components render. Parsers parse. Transport transports. Matching is pure. If a file does two of these, split it.
- **Small functions.** If a function exceeds ~30 lines or has >2 levels of nesting, split it. If a component file exceeds ~200 lines, extract sub-components or hooks.
- **Intention-revealing names.** Rename on sight when the name lies. A function that does two things gets two names.
- **Pure functions for logic.** Matching, grouping, normalization, and parsing are pure and free of React/axios/mongo. Keep them that way.
- **DRY in spirit, not dogma.** Collapse near-duplicates, but don't invent abstractions for one caller.
- **No magic strings** for db/collection names — import from `lib/mongo/collections.ts`. For Oscar endpoints, import from `lib/gatech/oscar/client.ts`.
- **Every new pure function gets a unit test.** Every new API route or cursor-touching function gets an integration test against in-memory Mongo. If you change a scraper, add an HTML fixture.

**Known smells — fix when you touch adjacent code**

- `assets/gatech/majors.ts` uses the `MajorBuilder` pattern but all majors are enumerated inline at ~150 lines. Fine for now; if it grows, consider per-major files under `assets/gatech/majors/`.
- `components/combobox.tsx` has a `useEffect` that re-reads options whenever the array length changes — benign but a subtle lint landmine. Leave unless touching this component.

**What NOT to do in the name of Clean Code**

- No DI containers, no class-based services, no interface/implementation splits with a single implementation. SOLID here means small functions and honest names, not Java-style indirection.
- No speculative abstractions. Three similar lines beat a premature `BaseXyzHandler`.
- Don't boil the ocean. A bug fix in a component is not a license to rewrite a module.
