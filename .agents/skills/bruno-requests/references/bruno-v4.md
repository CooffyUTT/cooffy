# Bruno 4.0 Breaking Changes and APIs

Last reviewed: 2026-08-03. Target version: Bruno 4.0.0 / `@usebruno/cli@4.0.0`.

## Breaking Changes from v3 to v4

### Write APIs persist by default

All variable write and delete APIs now persist to disk by default. The
`{ persist: true }` option has been removed.

**Affected APIs:**

| v3 (deprecated) | v4 (current) |
|---|---|
| `bru.setEnvVar(key, value, { persist: true })` | `bru.setEnvVar(key, value)` |
| `bru.setGlobalEnvVar(key, value, { persist: true })` | `bru.setGlobalEnvVar(key, value)` |
| `bru.setCollectionVar(key, value, { persist: true })` | `bru.setCollectionVar(key, value)` |

**Impact:** Scripts that relied on non-persistent (in-memory only) behavior will
now save variable changes to the environment file. If a script should not
persist changes, use `bru.setVar` (runtime, never persisted) instead.

### Typed variables

Variables can now store non-string types: `number`, `boolean`, `object`.

In YAML format, typed variables are declared as:

```yaml
runtime:
  variables:
    - name: timeout
      value:
        type: number
        data: "30"
    - name: debug
      value:
        type: boolean
        data: "true"
    - name: config
      value:
        type: object
        data: '{"host":"localhost","port":8080}'
```

When calling `bru.setEnvVar("timeout", 30)` with a non-string value, Bruno
infers the type and writes the appropriate annotation. On subsequent reads, the
variable resolves as the original type.

Collections with `@type(...)` annotations will not parse in Bruno versions
older than v4.0.0.

### bru.ctx vs scripts

`bru.ctx` belongs to **Bruno Apps** (a v4 feature for building custom UIs), not
to request scripts or tests. Do not use `bru.ctx` in `before-request`,
`after-response`, or `tests` scripts.

### ctx API migration

Previous `ctx.*` APIs (if any) are migrated to `bru.ctx.*` for Apps only.

## New Features in v4

### headerList (PropertyList interface)

The `req.headerList` and `res.headerList` objects expose rich querying,
iteration, and transform methods for headers. All key lookups are
case-insensitive.

```javascript
req.headerList.get("content-type");
req.headerList.has("authorization");
req.headerList.add("x-custom", "value");
req.headerList.remove("x-legacy");

res.headerList.get("x-request-id");
res.headerList.has("cache-control", "no-store");
```

`req.headerList` is mutable (write methods work). `res.headerList` is
**read-only** and throws `"HeaderList is read-only"` on write attempts.

### Parameter descriptions

Parameters and headers now support optional `description` fields:

```yaml
params:
  - name: filter
    value: active
    type: query
    description: Filter results by status

headers:
  - name: Authorization
    value: Bearer {{token}}
    description: Bearer token obtained after login
```

### Multi-file uploads

A single multipart-form file field can hold multiple files. File paths are
normalized relative to the collection.

### Apps (bru.ctx)

Bruno 4.0 introduces "Apps" — custom UIs built with JavaScript that render
inside Bruno. Apps use `bru.ctx` for their API surface (separate from script
sandbox). Not used in request scripts.

## npm package

The official npm package remains `@usebruno/cli`. Version 4.0.0 is published
on the npm registry.

```bash
npm view @usebruno/cli@4.0.0
pnpm add -D @usebruno/cli@^4.0.0
```

## Official Monorepo Structure (v4.0.0)

The `usebruno/bruno` monorepo contains these packages:

| Package | Purpose |
|---|---|
| `bruno-lang` | Bru markup language parser |
| `bruno-schema` | Collection JSON/YAML schema |
| `bruno-requests` | HTTP request execution engine |
| `bruno-js` | JavaScript sandbox runtime |
| `bruno-cli` | CLI tool (`bru`) |
| `bruno-app` | Desktop application |
| `bruno-electron` | Electron shell |
| `bruno-common` | Shared utilities |
| `bruno-converters` | Importers (Postman, OpenAPI, etc.) |
| `bruno-filestore` | File system persistence layer |
| `bruno-query` | Response query utilities |
| `bruno-schema-types` | TypeScript type definitions |
