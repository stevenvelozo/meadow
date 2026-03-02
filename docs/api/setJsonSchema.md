# setJsonSchema

Set the JSON Schema used for object validation.

## Signature

```javascript
meadow.setJsonSchema(pJsonSchema)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pJsonSchema` | `Object` | A JSON Schema (draft-04) object |

## Returns

Returns the Meadow instance for chaining.

## Description

`setJsonSchema` replaces the current JSON Schema and creates a new validator
using the `is-my-json-valid` library with `greedy` and `verbose` modes enabled.

- **greedy**: The validator checks all properties rather than stopping at the
  first error.
- **verbose**: Error objects include the full path and value of the failing
  property.

Once set, use `validateObject(pObject)` to validate records against the schema.

## Examples

### Set a JSON Schema

```javascript
meadow.setJsonSchema({
	"$schema": "http://json-schema.org/draft-04/schema#",
	"title": "Book",
	"type": "object",
	"properties": {
		"Title": {
			"type": "string",
			"minLength": 1
		},
		"Author": {
			"type": "string"
		},
		"PageCount": {
			"type": "integer",
			"minimum": 1
		}
	},
	"required": ["Title"]
});
```

### Validate after setting

```javascript
var tmpResult = meadow.validateObject({ Title: 'Dune', PageCount: 412 });
console.log(tmpResult.Valid); // true

var tmpBad = meadow.validateObject({ PageCount: -5 });
console.log(tmpBad.Valid);  // false
console.log(tmpBad.Errors); // Array of error details
```

### Chain with other configuration

```javascript
var meadow = libMeadow.new(tmpFable, 'Book')
	.setSchema(bookSchema)
	.setJsonSchema(bookJsonSchema)
	.setDefault(bookDefaultObject);
```

## Notes

- If `pJsonSchema` is not an object, a minimal fallback schema is used:
  `{ title: 'Unknown', type: 'object', required: [] }`.

- The JSON Schema is separate from the column schema (set via `setSchema`).
  The column schema drives query generation and marshalling. The JSON Schema
  drives object validation.

- The JSON Schema is accessible via the `jsonSchema` read-only property.

- Validation uses JSON Schema draft-04. See
  [json-schema.org](http://json-schema.org/draft-04/schema#) for the
  specification.
