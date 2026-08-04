# Cooffy Bruno Patterns

This file documents the request patterns found in the existing `bruno/`
collections. Use these as templates when creating new requests.

## Organization

Collections are organized by domain under `bruno/collections/`:

```
bruno/
├── workspace.yml
├── environments/
│   └── Development.yml
└── collections/
    ├── Auth/
    ├── Products/
    ├── Orders/
    ├── Branches/
    ├── School/
    └── Specific User/
```

Each collection has an `opencollection.yml` at its root:

```yaml
opencollection: 1.0.0

info:
  name: Products
bundled: false
extensions:
  bruno:
    ignore:
      - node_modules
      - .git
```

## Environment

`bruno/environments/Development.yml`:

```yaml
name: Development
variables:
  - secret: true
    name: access_token
  - secret: true
    name: refresh_token
```

## Request patterns

### GET (public, no auth)

```yaml
info:
  name: All schools
  type: http
  seq: 1

http:
  method: GET
  url: http://localhost:8000/api/schools/
  auth: inherit

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### GET (authenticated with Bearer token)

```yaml
info:
  name: Menu Products
  type: http
  seq: 1

http:
  method: GET
  url: http://localhost:8000/api/menu/products/
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### GET with query params

```yaml
info:
  name: All Branches
  type: http
  seq: 1

http:
  method: GET
  url: http://localhost:8000/api/branches/
  params:
    - name: company_id
      value: "1"
      type: query
      disabled: true
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### GET with path param

When the URL contains a path parameter, use a colon-prefixed placeholder in
the URL and add a `path` type param:

```yaml
info:
  name: Specific Order
  type: http
  seq: 3

http:
  method: GET
  url: http://localhost:8000/api/orders/1/
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

Note: The current project uses hardcoded IDs in URLs rather than declared
path params. For new requests, consider using path params:

```yaml
params:
  - name: id
    value: "1"
    type: path
```

### POST with JSON body

```yaml
info:
  name: Create Order
  type: http
  seq: 5

http:
  method: POST
  url: http://localhost:8000/api/orders/
  body:
    type: json
    data: |-
      {
        "branch_id": 1,
        "client_id": 1,
        "payment_method": 1,
        "comment": "Orden de prueba",
        "order_products": [
          {"item_id": 1, "quantity": 2}
        ]
      }
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### POST with form-urlencoded body

```yaml
info:
  name: Login Cliente
  type: http
  seq: 4

http:
  method: POST
  url: http://localhost:8000/api/auth/login/
  body:
    type: form-urlencoded
    data:
      - name: user
        value: cliente1
      - name: password
        value: admin123
  auth: inherit

runtime:
  scripts:
    - type: after-response
      code: |-
        bru.setGlobalEnvVar("access_token", res.body.access);
        bru.setGlobalEnvVar("refresh_token", res.body.refresh);

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### POST with multipart-form (file upload)

```yaml
info:
  name: Create Product
  type: http
  seq: 6

http:
  method: POST
  url: http://localhost:8000/api/menu/manage/products/
  body:
    type: multipart-form
    data:
      - name: name
        value: Chilaquiles verdes
        type: text
      - name: price
        value: "45.00"
        type: text
      - name: description
        value: Chilaquiles con salsa verde y crema
        type: text
      - name: max_per_order
        value: "3"
        type: text
      - name: category
        value: "1"
        type: text
      - name: active
        value: "true"
        type: text
      - name: image
        type: file
        value: ""
        disabled: true
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### PUT with form-urlencoded body

```yaml
info:
  name: Update Order
  type: http
  seq: 6

http:
  method: PUT
  url: http://localhost:8000/api/orders/1/
  body:
    type: form-urlencoded
    data:
      - name: state
        type: text
        value: progress
      - name: payment_status
        type: text
        value: paid
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

### DELETE

```yaml
info:
  name: Delete Product
  type: http
  seq: 9

http:
  method: DELETE
  url: http://localhost:8000/api/menu/manage/products/1/
  auth:
    type: bearer
    token: "{{access_token}}"

settings:
  encodeUrl: true
  timeout: 0
  followRedirects: true
  maxRedirects: 5
```

## Login flow

The login requests in `Auth/` use `auth: inherit` (no pre-existing token) and
store tokens via `bru.setGlobalEnvVar` in their `after-response` script:

```yaml
runtime:
  scripts:
    - type: after-response
      code: |-
        bru.setGlobalEnvVar("access_token", res.body.access);
        bru.setGlobalEnvVar("refresh_token", res.body.refresh);
```

Subsequent authenticated requests use `auth: { type: bearer, token: "{{access_token}}" }`.

## Dynamic variables

The `Register` request uses built-in dynamic variables:

```yaml
- name: user
  value: 2023{{$randomInt}}@utt.edu.mx
- name: name
  value: "{{$randomFirstName}}"
- name: lastname
  value: "{{$randomLastName}}"
```

## URL pattern

All requests use absolute URLs with `http://localhost:8000` as the base for
local development. No collection-level `baseUrl` variable is currently used.

## Auth summary

| Endpoint type | Auth config |
|---|---|
| Login / Register | `auth: inherit` |
| Authenticated CRUD | `auth: { type: bearer, token: "{{access_token}}" }` |
| Public read | `auth: inherit` |
