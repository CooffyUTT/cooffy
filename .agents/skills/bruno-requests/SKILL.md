---
name: bruno-requests
description: Use only when creating, editing, or reviewing Bruno API requests in bruno/ collections. Covers OpenCollection YAML format, HTTP methods, auth, body types, variables, scripts, and request organization for this project.
---

# Bruno Requests

Bruno is a Git-friendly, offline-first API client. This project stores collections as
OpenCollection YAML files (`*.yml`). This skill ensures agents produce valid request
files compatible with Bruno 4.0 and this project's conventions.

## Project context

- Collections live under `bruno/collections/` organized by domain: `Auth`,
  `Products`, `Orders`, `Branches`, `School`, `Specific User`.
- Format: **OpenCollection YAML** (`*.yml`), not classic `.bru` files.
- CLI version: `@usebruno/cli` ^4.0.0 (declared in root `package.json`).
  Requires Node.js >= 19 (uses Web Crypto `crypto.subtle`). Use `nvm
  use 25` or a compatible Node version for CLI runs.
- `bruno/workspace.yml` defines the workspace root.
- `bruno/environments/Development.yml` holds `access_token` and `refresh_token`
  as secrets.
- Script to run Auth collection: `pnpm bru:auth`.

## Activation rules

Use this skill when the agent must:

- Create a new request file in `bruno/collections/`.
- Edit an existing request's method, URL, headers, body, auth, params, scripts,
  or settings.
- Organize requests into folders or adjust `seq` ordering.
- Add or modify variables, environments, or collection-level config.
- Troubleshoot a request that fails in Bruno GUI or CLI.
- Review a request for correctness against the actual backend endpoint.

Do not use this skill for:

- Implementing Django backend endpoints or serializers.
- Designing automated Django test suites.
- Replacing deterministic Django tests with Bruno smoke checks.

## Inspect before writing

Before creating or modifying any request:

1. Read `AGENTS.md` and `backend/AGENTS.md`.
2. Read `package.json` to confirm the `@usebruno/cli` version.
3. Inspect `bruno/workspace.yml` and `bruno/environments/Development.yml`.
4. Open the target collection's `opencollection.yml` and at least 2 existing
   requests in that collection to copy conventions.
5. Locate the actual backend endpoint (view, URL conf, serializer, permissions)
   before inventing method, URL, payload, or expected response.
6. Confirm auth requirements: public endpoint, Bearer token, or inherited auth
   from collection/folder.
7. Load `references/cooffy-patterns.md` for existing request patterns in this
   project.

## Format: OpenCollection YAML

This project uses the `.yml` OpenCollection format. Never convert existing `.yml`
files to `.bru` without explicit approval.

### Top-level structure

```yaml
info:
  name: Request Name
  type: http
  seq: <number>

http:
  method: <GET|POST|PUT|PATCH|DELETE|OPTIONS>
  url: <full URL>

runtime:
  scripts:
    - type: <before-request|after-response|tests>
      code: |-
        // JavaScript

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### info

| Field  | Type   | Notes                                  |
| ------ | ------ | -------------------------------------- |
| `name` | string | Display name; special chars allowed    |
| `type` | string | `http` for HTTP requests               |
| `seq`  | number | Sort position; check collection max+1  |

### http

- `method`: uppercase (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`).
- `url`: full URL; use `http://localhost:8000` for local development.
- `params`: array of `{ name, value, type, disabled?, description? }` objects.
  `type` must be `query` or `path`.
- `headers`: array of `{ name, value, disabled?, description? }` objects.
- `body`: `{ type, data }` for `json`, `text`, `xml`, `form-urlencoded`,
  `multipart-form`.
- `auth`: `inherit` to delegate to parent; otherwise `{ type, ... }`.

Under `http.params`, each param object is:

```yaml
- name: filter
  value: active
  type: query
```

### Auth patterns

```yaml
auth: inherit

auth:
  type: bearer
  token: "{{access_token}}"
```

Supported types: `none`, `inherit`, `basic`, `bearer`, `apikey`, `digest`,
`oauth1`, `oauth2`, `awsv4`, `ntlm`, `wsse`.

### Body types

| Type | Use case |
|---|---|
| `json` | API endpoints that consume JSON; `data` uses `\|-` block scalar |
| `form-urlencoded` | Login forms, simple key-value payloads |
| `multipart-form` | File uploads or mixed form fields with files |
| `text` | Raw plain text or XML bodies |
| No body | GET, DELETE requests without payload |

For `multipart-form`, each entry is `{ name, value, type, disabled? }` with
`type: text` for fields and `type: file` for attachments.

```yaml
body:
  type: multipart-form
  data:
    - name: fieldname
      value: "some value"
      type: text
    - name: image
      type: file
      value: ""
      disabled: true
```

### runtime.scripts

| Script type | Runs |
|---|---|
| `before-request` | Before the request is sent |
| `after-response` | After the response is received |
| `tests` | Test assertions after response |

```yaml
runtime:
  scripts:
    - type: after-response
      code: |-
        bru.setGlobalEnvVar("access_token", res.body.access);
        bru.setGlobalEnvVar("refresh_token", res.body.refresh);
```

### settings

Always include the standard settings block:

```yaml
settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

## Variables

### Variable types and precedence (highest to lowest)

1. Runtime Variables (`bru.setVar` / `bru.getVar`)
2. Request Variables
3. Folder Variables
4. Environment Variables (`bru.getEnvVar` / `bru.setEnvVar`) — this project uses these
5. Collection Variables (`bru.getCollectionVar` / `bru.setCollectionVar`)
6. Global Environment Variables (`bru.getGlobalEnvVar` / `bru.setGlobalEnvVar`) — login tokens

Prompt Variables use `{{?Prompt String}}` syntax. Process Environment Variables
use `{{process.env.VAR_NAME}}` syntax. These don't compete in the precedence chain.

### V4 persistence

In Bruno 4.0, `bru.setEnvVar`, `bru.setGlobalEnvVar`, and
`bru.setCollectionVar` persist to disk by default. No `{ persist: true }`
option needed. This is a breaking change from v3.

### Variable interpolation

Use `{{variable_name}}` in URL, headers, body data, and auth tokens.

### Dynamic variables

Built-in dynamic variables use `{{$function}}` syntax:

- `{{$randomInt}}`
- `{{$randomFirstName}}`
- `{{$randomLastName}}`
- `{{$guid}}`
- `{{$timestamp}}`

## Scripting API (Bruno 4.0)

### Pre-request (`before-request`)

Use `req.*` to modify the request before it is sent:

```javascript
req.setUrl("https://other-api.example.com/users");
req.setHeader("Authorization", "Bearer " + bru.getEnvVar("token"));
req.setBody({ key: "value" });
req.setMethod("PATCH");
req.setTimeout(10000);
req.setMaxRedirects(5);
```

Do not use `bru.ctx` in scripts — `bru.ctx` belongs to Bruno Apps, not to
request scripts or tests.

### Post-response (`after-response`)

Use `res.*` to read the response and `bru.*` to store variables:

```javascript
const data = res.getBody();
bru.setEnvVar("access_token", data.token);
bru.setVar("userId", data.id);
```

Response properties:
- `res.status` / `res.getStatus()`
- `res.body` / `res.getBody()` — auto-parsed as object for JSON responses
- `res.headers` / `res.getHeaders()`
- `res.getHeader(name)`
- `res.responseTime` / `res.getResponseTime()`

### Tests (`tests`)

Uses Chai assertions:

```javascript
test("should return 200", () => {
  expect(res.status).to.equal(200);
});

test("should return user data", () => {
  expect(res.body).to.have.property("id");
});
```

### Environment variables from scripts

```javascript
bru.getEnvVar("key");
bru.setEnvVar("key", value);
bru.hasEnvVar("key");

bru.getGlobalEnvVar("key");
bru.setGlobalEnvVar("key", value);
bru.hasGlobalEnvVar("key");
```

## Cooffy conventions

- Match the domain-based folder structure: `Auth`, `Products`, `Orders`,
  `Branches`, `School`, `Specific User`.
- Use `seq` values that continue the existing sequence; check the collection
  for the maximum current value.
- Reuse `{{access_token}}` for authenticated requests.
- Login requests must set `bru.setGlobalEnvVar("access_token", ...)` and
  `bru.setGlobalEnvVar("refresh_token", ...)` in `after-response` scripts.
- Environment secrets (`access_token`, `refresh_token`) are declared in
  `bruno/environments/Development.yml` with `secret: true`.
- Do not hardcode seed IDs in branching content; document the expected data
  state as a comment or use variables.
- Keep `pnpm bru:auth` as the existing smoke check; do not present it as an
  automated test suite.
- Do not create `backend/.env`, do not read or commit secrets.

## CLI commands

```bash
pnpm bru:auth                          # Run Auth collection
cd bruno/collections/<Collection> && bru run   # Run a specific collection
```

CLI options (v4): `--env`, `--global-env`, `--tests-only`, `--bail`, `--tags`,
`--reporter-json`, `--reporter-junit`, `--reporter-html`, `--insecure`,
`--env-var`, `--env-file`, `--delay`, `--parallel`.

## Verification

After creating or modifying a request:

1. Validate YAML syntax.
2. Open in Bruno GUI and confirm the correct environment is selected.
3. Execute the request individually before running a full collection.
4. Verify the response status, body, and headers match expectations.
5. For auth-dependent requests, ensure a valid token is obtained first.
6. Report failures separately: server error, auth error, environment misconfig,
   or YAML syntax error.
7. Never claim a request works just because the file was saved.

## Sources

- [OpenCollection YAML Overview](https://docs.usebruno.com/opencollection-yaml/overview.md)
- [YAML Structure Reference](https://docs.usebruno.com/opencollection-yaml/structure-reference.md)
- [Bru Tag Reference](https://docs.usebruno.com/bru-lang/tag-reference.md)
- [Variables Overview](https://docs.usebruno.com/variables/overview.md)
- [JavaScript API Reference](https://docs.usebruno.com/testing/script/javascript-reference.md)
- [Body Data](https://docs.usebruno.com/send-requests/REST/body-data.md)
- [Parameters](https://docs.usebruno.com/send-requests/REST/parameters.md)
- [Scripting Getting Started](https://docs.usebruno.com/testing/script/getting-started.md)
- [CLI Command Options](https://docs.usebruno.com/bru-cli/commandOptions.md)
- [Creating a Request](https://docs.usebruno.com/get-started/bruno-basics/create-a-request.md)
- [AI Integration Use Cases](https://docs.usebruno.com/ai/integration/use-cases.md)
- Official v4.0.0 source: [`usebruno/bruno`](https://github.com/usebruno/bruno/tree/v4.0.0/packages)
- Full documentation index: [llms.txt](https://docs.usebruno.com/llms.txt)

Load detailed guidance only when needed from `references/` files in this
skill directory.
