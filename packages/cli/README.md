# OpenAPI to Postman Complete

> Complete OpenAPI to Postman converter. One command. Production-ready collections.

[![npm version](https://badge.fury.io/js/openapi-to-postman-complete.svg)](https://www.npmjs.com/package/openapi-to-postman-complete)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why not just use openapi-to-postmanv2?

The official converter gives you valid Postman collections. We give you **usable** Postman collections.

Built on top of Postman's official `openapi-to-postmanv2` converter, adding:

- **Endpoint filtering** - Keep only what you need
- **Resource organization** - Nested folders by REST hierarchy
- **Rich descriptions** - Human-friendly documentation
- **Real examples** - Actual request/response data
- **Path variables** - Automatic environment variable mapping
- **Auto-generated tests** - Validation out of the box
- **ID preservation** - Maintain bookmarks across regenerations

## Installation

```bash
npm install -g openapi-to-postman-complete
```

## Quick Start

```bash
openapi-to-postman-complete api.yaml config.yaml -o collection.json
```

That's it. OpenAPI → production-ready Postman collection in one command.

No need to run `openapi-to-postmanv2` separately - we handle that internally.

## Configuration

Create a `config.yaml` with what you need:

### Minimal

```yaml
variables:
  environment:
    baseUrl: https://api.example.com

tests:
  auto: true
```

### With Filtering

```yaml
filter:
  include:
    GET /users: true
    POST /users: true

variables:
  environment:
    baseUrl: https://api.example.com

tests:
  auto: true
```

### Full Example

```yaml
filter:
  include:
    GET /pets: true
    POST /pets: true
    GET /pets/:id: true

organize:
  enabled: true
  strategy: resources
  nestingLevel: 2

descriptions:
  collection:
    Pet Store API:
      name: Pet Store - Developer Collection

  requests:
    List pets: Get all pets from the store

examples:
  responses:
    List pets:
      code: 200
      body:
        - id: '1'
          name: Buddy

variables:
  environment:
    baseUrl: https://api.petstore.com
    petId: '1'

pathVariables:
  enabled: true
  mapping:
    id:
      reference: '{{petId}}'
      description: Pet ID

tests:
  auto: true
```

See [examples](./examples) for more.

## Programmatic Usage

```typescript
import { enrichCollection } from '@postman-enricher/core';

const collection = JSON.parse(readFileSync('collection.json', 'utf8'));

const enriched = enrichCollection(
  collection,
  {
    organize: { enabled: true, strategy: 'resources' },
    pathVariables: {
      enabled: true,
      mapping: { id: { reference: '{{petId}}' } },
    },
    tests: { auto: true },
  },
  './existing-collection.json' // Optional: preserves IDs
);
```

Or load config from YAML:

```typescript
const enriched = enrichCollection(
  collection,
  './config.yaml',
  './existing-collection.json'
);
```

## License

MIT
