# Request Checklist

Use this checklist before finalizing any Bruno request.

## Before creating the request

- [ ] Read the relevant backend endpoint (view, URL conf, serializer, permissions).
- [ ] Confirm HTTP method, URL path, auth requirements, and expected payload.
- [ ] Check the existing collection for `seq` ordering — use max + 1 or
  insert at the correct position.
- [ ] Check whether the request belongs in an existing collection or needs a
  new collection.
- [ ] If creating a new collection, confirm the `opencollection.yml` structure.

## Request structure

- [ ] `info.name` is descriptive and follows existing naming conventions.
- [ ] `info.type` is `http`.
- [ ] `info.seq` is set correctly (not duplicated).
- [ ] `http.method` is uppercase.
- [ ] `http.url` uses `http://localhost:8000` for local development.
- [ ] Query params include `type: query`.
- [ ] Path params include `type: path`.
- [ ] Headers use the array-of-objects format with `name` and `value` keys.
- [ ] Disabled params or headers have `disabled: true`.

## Body

- [ ] Body `type` matches what the endpoint expects: `json`, `form-urlencoded`,
  `multipart-form`, `text`, or `xml`.
- [ ] JSON bodies use `\|-` block scalar for `data`.
- [ ] Form bodies use `data` as an array of `{ name, value, type, disabled? }`.
- [ ] Multipart form file fields use `type: file` and include a `disabled` flag.
- [ ] Numeric values in form data are quoted (e.g., `value: "45.00"`).
- [ ] Boolean-like values in form data are quoted (e.g., `value: "true"`).

## Auth

- [ ] Public endpoints use `auth: inherit`.
- [ ] Authenticated endpoints use `auth: { type: bearer, token: "{{access_token}}" }`.
- [ ] Login/Register requests include `after-response` script to store tokens.
- [ ] Tokens are set via `bru.setGlobalEnvVar` or `bru.setEnvVar` (not
  hardcoded).
- [ ] Auth `type` is one of the supported values: `none`, `inherit`, `basic`,
  `bearer`, `apikey`, `digest`, `oauth1`, `oauth2`, `awsv4`, `ntlm`, `wsse`.

## Settings

- [ ] Standard settings block is present:
  ```yaml
  settings:
    encodeUrl: true
    timeout: 0
    followRedirects: true
    maxRedirects: 5
  ```

## Scripts (if applicable)

- [ ] Uses `before-request` to modify request (URL, headers, body, method,
  timeout, maxRedirects).
- [ ] Uses `after-response` to extract and store data (tokens, IDs).
- [ ] Uses `tests` only when explicitly requested for validation.
- [ ] Scripts use the v4 API: `req.*`, `res.*`, `bru.*`.
- [ ] No `bru.ctx` in scripts (belongs to Apps, not request scripts).
- [ ] Environment writes use `bru.setEnvVar` / `bru.setGlobalEnvVar` (persisted
  by default in v4).
- [ ] Script code is valid JavaScript, tested in Bruno's sandbox.
- [ ] No secrets, passwords, or tokens exposed in script code.

## Variables

- [ ] Uses `{{access_token}}` for Bearer token auth.
- [ ] Dynamic data uses `{{$randomInt}}`, `{{$guid}}`, etc.
- [ ] No hardcoded seed IDs where dynamic or variable values would be safer.
- [ ] Secret variables are never printed or exposed in the request file.

## Lint rules

- [ ] YAML syntax is valid (no unquoted colons in values, correct indentation).
- [ ] File ends with a newline.
- [ ] No trailing whitespace.
- [ ] No emojis unless explicitly requested by the user.

## Cooffy-specific

- [ ] Matches the domain-based collection structure.
- [ ] Reuses existing token variable names (`access_token`, `refresh_token`).
- [ ] Does not add `backend/.env` or expose secrets.
- [ ] Respects the specification (read `docs/requerimientos.md` and the
  relevant RF file) for endpoint behavior.
- [ ] Data payload is compatible with serializers and models.

## Verification

- [ ] Open the request in Bruno GUI with the `Development` environment selected.
- [ ] Run a login request first to obtain a valid token.
- [ ] Execute the request individually.
- [ ] Verify status code matches expectations (200, 201, 204, etc.).
- [ ] Verify response body structure matches the serializer.
- [ ] For mutation requests (POST, PUT, PATCH, DELETE), verify the persisted
  state changed as expected.
- [ ] For error cases, verify the response includes proper error messages.

## Failure classification

If the request fails:

- [ ] **Server error (5xx):** check backend logs, migrations, seed data.
- [ ] **Client error (4xx):** check auth token, permissions, payload format,
  required fields.
- [ ] **Auth error (401/403):** re-run login, check token expiration, check
  user role.
- [ ] **Network error:** confirm backend is running (`pnpm back`),
  check URL and port.
- [ ] **YAML parse error:** check indentation, quotes, special characters.
- [ ] **Script error:** check JavaScript syntax, verify API availability
  in v4 sandbox.
