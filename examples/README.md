# Examples

Three minimal configs showing different use cases. All use the same [petstore.yaml](./petstore.yaml) OpenAPI spec.

## Basic

Minimal config - just variables and tests:

```bash
openapi-to-postman-complete petstore.yaml basic/config.yaml -o basic-collection.json
```

## Filtered

Keep only essential endpoints:

```bash
openapi-to-postman-complete petstore.yaml filtered/config.yaml -o filtered-collection.json
```

## Full

All features enabled:

```bash
openapi-to-postman-complete petstore.yaml full/config.yaml -o full-collection.json
```
