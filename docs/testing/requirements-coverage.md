# Requirements Testing Matrix

This matrix contains requirement scenarios that need a contract decision or a
production seam before an automated test can be finalized. It is deliberately
requirement-focused: do not update it for every test file or test case. Update
it only when the specification, MVP scope, or an unresolved contract changes.

The source of truth is `docs/requerimientos.md`, `docs/mvp_1.md`, and the
detailed RF documents under `docs/requeriments/`.

## How To Use

1. Read the referenced RF/RN and linked requirements.
2. Resolve the contract questions in the matrix before inventing assertions.
3. Add the resulting test at the lowest suitable level.
4. Keep implementation failures traceable to the RF/RN in the test report.
5. Remove or revise a row only when the specification changes or its decision
   has been incorporated into the requirements documentation.

An unresolved row is not permission to assert the current implementation. It
is a handoff item for requirements clarification or the implementation phase.

When an RF document and the global RN table use different identifiers for the
same rule, preserve both references in the test report until the requirements
are reconciled. Do not silently renumber the rule.

## Pending Contract Decisions

| ID | Sources | Scenario to protect | Contract or decision needed | Test level and seam |
|---|---|---|---|---|
| RF-04-01 | RF-04, RN-23 | Authorized manager/supervisor sees only metrics for permitted branches | Define branch scope for each role and the response when a branch is unauthorized | API integration; dashboard endpoint/service |
| RF-04-02 | RF-04 | Daily sales, order count, top product, and average operation time are calculated consistently | Define which payment/order states count, the time zone, and the timestamps used for operation time | Unit plus API; KPI query/service |
| RF-04-03 | RF-04 | Weekly, monthly, four-month, and six-month filters return correct boundaries | Define inclusive dates, calendar versus rolling periods, and empty-period results | Unit plus API; period filter/query |
| RF-04-04 | RF-04 | Dashboard updates after changing the selected period | Define whether refresh, polling, or another mechanism is required and what freshness means | Frontend behavior plus API contract |
| RF-06-01 | RF-06, RN-08, MVP | An unavailable product is represented consistently in the customer menu and order flow | Resolve whether it is hidden, shown with an unavailable notice, or only blocked at order creation | API plus frontend behavior |
| RF-07-01 | RF-07, RN-13 | Orders move through the valid linear state sequence | Define the canonical state values, allowed transitions, and rejection response. The documents use both three-column and four-state descriptions | Unit plus API; transition policy |
| RF-07-02 | RF-07, RN-16, RN-17 | Staff suspends and resumes order intake for one branch | Define the persisted branch setting, authorized roles, endpoint/action, and response while intake is suspended | API integration; branch/order creation |
| RF-07-03 | RF-07 | Kitchen order columns update without manual refresh | Define the transport and freshness guarantee: polling, server push, or refresh-triggered queries | Frontend integration or E2E only if lower levels cannot verify it |
| RF-07-04 | RF-07, RN-22/RN-23/RN-24 | Staff can administer only authorized branch orders and changes are auditable | Reconcile the RN numbering mismatch and define the audit field/event and role-to-branch relationship | API integration; permissions and persistence |
| RF-10-01 | RF-10, RN-04/RN-10 | A client may have one active order per branch | Define active and terminal states, including whether rejected/cancelled orders count | API integration; order creation constraint |
| RF-10-02 | RF-10, RN-06/RN-24 | All order products belong to the order branch | Define the product-to-branch relationship and the validation error when it does not match | API integration; order serializer/service |
| RF-10-03 | RF-10, RN-21 | Order number is unique per branch and operating date | Define generation under concurrency and whether numbering restarts per branch/date | API plus database constraint/service |
| RF-10-04 | RF-10 | Client receives a confirmation summary/receipt after creation | Define response fields, receipt identifier, initial state, and notification contract | API integration; response/side-effect contract |
| RF-11-01 | RF-11, RN-18 | A client selects a supported payment method | Define the payment method enum and invalid-method response | Unit plus API; serializer |
| RF-11-02 | RF-11, RN-19 | Electronic mock payment changes payment status only after confirmation | Define mock success/failure behavior and the operation that confirms payment | API integration; payment service |
| RF-11-03 | RF-11, RN-19 | Cash payment remains pending until a cashier confirms it | Define cashier role, confirmation endpoint, allowed state transition, and duplicate-confirmation behavior | API integration; permission/state policy |
| RF-11-04 | RF-11, RN-20 | A paid order generates a receipt automatically | Define receipt format, persistence, uniqueness, and whether generation is synchronous | API integration; payment/order side effect |
| RF-12-01 | RF-12, RN-13 | Client sees current status and order details for their own orders only | Define the customer-facing endpoint/response and canonical status values | API integration; queryset/serializer |
| RF-12-02 | RF-12 | Client sees an estimated preparation time | Define the source, unit, calculation, and behavior when no estimate exists | Unit plus API/frontend behavior |
| RF-12-03 | RF-12 | Customer status stays synchronized with kitchen changes | Define the freshness mechanism and acceptable delay before considering data stale | API contract; E2E only if required |

## MVP Boundary

The MVP explicitly excludes quantity-based production capacity. Do not create
tests for RN-10/RN-11 as MVP failures unless the MVP scope is changed. Product
availability and the per-order quantity limit remain distinct concerns.
