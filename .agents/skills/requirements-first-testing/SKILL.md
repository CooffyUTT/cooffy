---
name: requirements-first-testing
description: Use when designing or implementing automated tests for Cooffy requirements, business rules, acceptance criteria, or critical user flows. Derive tests from the specification before inspecting implementation behavior.
---

# Cooffy Requirements-First Testing

## When to Use

Use this skill when an agent must turn a Cooffy RF, RN, acceptance criterion, or specified flow into automated tests, or when existing tests must be reviewed for requirements coverage.

This is a Cooffy-specific workflow. Do not treat current behavior, existing endpoints, or current test gaps as the specification.

## Source of Truth and Initial Inspection

Read the specification first, then inspect code only to locate the observable contract and test seams:

1. Read `AGENTS.md`, then the relevant `backend/AGENTS.md` or `frontend/AGENTS.md`.
2. Read `docs/mvp_1.md` to determine whether the requirement is in the MVP and whether it was deliberately reduced.
3. Read `docs/requerimientos.md` for the RF, RN, and RNF tables.
4. Read the matching file under `docs/requeriments/` for actor, description, flow, dependencies, and restrictions. Also read linked RFs when they affect setup or assertions.
5. Inspect the database documentation under `docs/database/` when data relationships or constraints matter.
6. Search for tests, fixtures, helpers, API routes, serializers, models, services, and UI components. Reuse established helpers, but never copy assertions merely because the implementation currently behaves that way.

Before writing code, produce a small traceability table:

| RF | RN | Acceptance criterion or flow | Scenario | Test level | Expected observable result |
|---|---|---|---|---|---|

If the documents disagree or omit a behavior, record the ambiguity and do not invent an expected result. An implementation detail can inform test setup, not the expected outcome.

## Scenario Design

For every relevant RF/RN, consider only scenarios justified by the specification:

- happy path and each specified alternate flow
- invalid input and empty/minimum/maximum boundaries
- authentication, role, branch scope, and unauthorized access
- every specified state and valid/invalid transition
- business-rule conflicts, duplicate actions, and idempotency where stated
- unavailable, disabled, suspended, or otherwise blocked states
- persistence, response contract, timestamps, and side effects explicitly required

Prioritize rules that protect money, orders, access control, branch isolation, product availability, and irreversible state changes. Do not chase an arbitrary coverage percentage. One test may cover several criteria only when its failure still clearly identifies the violated rule; otherwise split it.

Use descriptive names such as `test_rejected_order_cannot_be_accepted`, not numeric or implementation-based names. Keep each test independent, deterministic, and focused on observable behavior. Avoid real time, random values, network calls, downloaded images, execution order, shared mutable data, and assertions about private methods, query ordering, or incidental model fields unless the specification makes them part of the contract. Use fixed dates and controlled clocks when a date is required.

## Select the Test Level

Choose the lowest level that verifies the requirement without losing the contract:

- **Unit:** isolated business rules, model/serializer validation, pure helpers, and state-transition logic. Use Django `TestCase` where database state is required.
- **Integration/API:** Django/DRF endpoints, authentication and permissions, serializers, PostgreSQL persistence, branch scoping, and cross-component side effects. Prefer `APITestCase`/`APIClient` or the existing Django test style when available.
- **E2E:** only critical complete journeys whose cross-layer behavior cannot be protected at lower levels, such as the MVP purchase journey or a critical role flow. Do not add an E2E framework just for this task.

The frontend is Next.js 16/React 19/TypeScript and uses Vitest with `jsdom` and React Testing Library. The runner is configured in `frontend/vitest.config.mts` with shared setup in `frontend/src/test/setup.ts`. Use the configured `pnpm front:test` and `pnpm front:test:watch` scripts. Keep frontend tests focused on business logic, hooks, and observable behavior; place them beside the behavior they protect using `.test.ts` or `.test.tsx`. Do not add tests for styling or every component. Do not add Jest, Cypress, or Playwright without explicit approval. When a screen uses mock data instead of an API contract, test its isolated logic only and do not claim backend integration coverage.

The backend uses Django 6 + DRF + PostgreSQL, with dependencies managed by `uv`. There is no configured pytest, coverage, or backend lint/formatter setup. Use Django's built-in runner and existing `TestCase` files. PostgreSQL is required; do not switch tests to SQLite because the project uses PostgreSQL-specific fields such as `ArrayField`.

## Implement in This Repository

- Backend tests live with each app in `backend/apps/<app>/tests.py`; follow that location and existing naming before creating a new test module.
- Run backend commands from the repository root through `pnpm back:*`, for example `pnpm back:manage test apps.orders --noinput` or `pnpm back:test`. Prefer `pnpm back:test` for the complete non-interactive suite.
- Check database readiness first. Start PostgreSQL with `docker compose up -d` only when the task permits environment changes; do not create a backend `.env` or expose secrets.
- Use Django's test database isolation and create all data required by each test. Use factories/helpers only if the repository already has them; do not introduce a factory library without approval.
- For DRF tests, assert status, response contract, authorization, persisted state, and required side effects. Prefer URL resolution or the project's registered API paths over hard-coded implementation internals.
- Frontend validation uses separate commands: `pnpm front:test`, `pnpm front:lint`, and `pnpm front:typecheck`; `pnpm front:lint` runs only ESLint and `pnpm front:typecheck` runs only TypeScript. `pnpm --dir frontend build` is available for production-level verification. These checks do not replace requirements-derived behavior tests.
- `pnpm bru:auth` exercises the versioned Bruno collection, but Bruno is an API client smoke check, not a replacement for deterministic Django tests. Use it only when the relevant collection and environment are available.

Do not modify production code merely to make tests convenient. If the specification requires behavior absent from the implementation, first add the specification-derived test when the contract is testable. A failing test is useful evidence; do not weaken it to match current behavior.

## Handling Partial Implementation

Do not maintain a hard-coded list of implemented or incomplete RFs in this skill. Determine the status from the repository and specification during each task:

- **Supported:** the observable contract can be exercised with the configured stack and the test should pass;
- **Partial:** some specified scenarios are testable, while others require missing behavior or dependencies;
- **Unimplemented:** the requirement is clear but no testable production seam exists yet;
- **Ambiguous:** the specification does not define a unique expected result;
- **Out of scope:** the MVP or task explicitly defers the behavior.

Record this classification in the task's traceability matrix or final report, not in this skill. Do not infer coverage from the existence of a test file. When implementation is incomplete, keep passing regression tests separate from tests that intentionally expose a defect, and never weaken a requirements-derived assertion to match the current code.

## Execute, Diagnose, and Report

After adding tests, run the narrow relevant test target, then the complete applicable suite. Record the exact command and result. For each failure, classify it as:

- implementation defect: the test matches an explicit RF/RN/criterion and production behavior violates it;
- test defect: setup, level, assertion, or interpretation is wrong;
- ambiguous requirement: documents do not define the expected behavior;
- configuration/environment defect: dependencies, PostgreSQL, migrations, environment variables, or external services prevent execution.

Never mark a test as wrong solely because it fails. Do not hide failures with broad mocks, skipped tests, weaker assertions, or unrelated production changes. If a necessary tool is missing, say so and stop at the highest honest verification level.

Finish with a requirements coverage report:

```text
RF-XX — <name>
Covered:
✓ RN-YY — <behavior> — <test name>
✗ RN-ZZ — <behavior> — failing test and classification
? <criterion> — ambiguous or not automatable with configured tooling

Result: <passed>/<total> tests passed
Commands: <exact commands>
Open issues: <implementation, ambiguity, or configuration issue>
```

## RF-07 Worked Example

Use `docs/mvp_1.md` to establish scope before deriving tests. When an RN in `docs/requerimientos.md` is deliberately deferred or reduced by the MVP, mark it as out of scope rather than creating a failing test. For example, RN-10 and RN-11 describe production-capacity limits, but the MVP explicitly excludes quantity-based inventory control.

The detailed RF files do not provide a separate formal acceptance-criteria section. Treat the RF description, flow, restrictions, linked requirements, and MVP scope as the available specification, and mark any expected observable result that remains undefined as ambiguous.

RF-06 has a documented ambiguity: its flow says clients see an exhausted product with a warning, while RN-08 and the MVP describe disabled products as unavailable for new orders and not available in the menu. Do not silently choose between hiding the product, showing it as unavailable, or blocking only order creation; record the interpretation and test the behavior only when the expected contract is resolved.

For `docs/requeriments/RF-07 Gestión de pedidos.md`, first reconcile the global RN table in `docs/requerimientos.md` with the RF document. The global table links RF-07 to RN-13 through RN-17, RN-22, and RN-23; the RF-07 page labels its audit and authorization restrictions as RN-23 and RN-24, although the global table uses RN-22 and RN-23. Report this mismatch before deciding traceability labels.

The specification-derived matrix should include at least:

| Requirement | Scenario | Level | Expected result |
|---|---|---|---|
| RN-13 | each allowed next order state | unit/API | only the defined linear transition succeeds |
| RN-13 | skip, reverse, or unrelated state transition | unit/API | transition is rejected and state is unchanged |
| RN-14 | rejected order is accepted again | unit/API | operation is rejected and remains rejected |
| RN-15 | delivered/completed order changes state | unit/API | operation is rejected and terminal state remains unchanged |
| RN-16 | staff suspends and resumes intake for one branch | API | branch intake flag changes and is scoped to that branch |
| RN-17 | client creates an order while intake is suspended, then after resume | API/integration | creation is rejected while suspended and allowed after resume, subject to other RF-10 rules |
| RN-22/23/24 | authorized staff versus another branch | API | authorized scope succeeds; unauthorized branch data/action is denied or hidden as specified |
| RN-22 (global table) / RN-23 (RF-07 page) | order modification records last-modified date/time | API/integration | timestamp is updated and persisted |

Use the exact state vocabulary and rejection response only after checking the RF-07 acceptance criteria and linked order documentation. If the inspected implementation cannot enforce a specified invariant, classify that scenario according to the workflow above and preserve the specification-derived expected result rather than asserting the current behavior. Do not add production fixes as part of test design unless the task explicitly includes implementation work.

For example, a traceable test name may be `test_rejected_order_cannot_be_accepted`, with a short comment or docstring such as `RF-07 / RN-14`. Keep traceability lightweight and compatible with the existing Django test style; do not add custom markers or a reporting system.

## Avoid These Errors

- deriving expected behavior from models, views, mock data, or existing tests;
- treating an empty `tests.py` as evidence that no tests are needed;
- testing every React component with E2E or claiming coverage for behavior with no configured test;
- introducing pytest, coverage, factories, browser runners, or CI configuration without verifying and approving the dependency change;
- using SQLite despite the PostgreSQL requirement;
- coupling tests through seed data, database order, real time, network, media downloads, or shared state;
- asserting implementation details instead of API/UI behavior and persisted business outcomes;
- inventing status codes, state names, role permissions, limits, or acceptance criteria absent from the docs;
- weakening or deleting a failing requirements-derived test without classifying the failure;
- reporting only test counts instead of which RF/RN criteria are protected and which remain ambiguous or uncovered.
