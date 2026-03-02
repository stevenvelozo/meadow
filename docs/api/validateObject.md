# validateObject

Validate a JavaScript object against the JSON Schema.

## Signature

```javascript
meadow.validateObject(pObject)
```

Also accessible via the full schema object:

```javascript
meadow.schemaFull.validateObject(pObject)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pObject` | `Object` | The plain JavaScript object to validate |

## Returns

| Property | Type | Description |
|----------|------|-------------|
| `Valid` | `boolean` | `true` if the object passes validation, `false` otherwise |
| `Errors` | `Array` | Present only when `Valid` is `false`. Array of error detail objects |

## Description

`validateObject` checks the given object against the JSON Schema that was
previously set via `setJsonSchema()`. The underlying validator is
`is-my-json-valid` with `greedy` and `verbose` modes, meaning:

- All properties are checked (not just until the first failure).
- Each error includes the full property path and the actual value.

## Error Object Format

Each entry in the `Errors` array is an object with properties including:

| Property | Type | Description |
|----------|------|-------------|
| `field` | `string` | Dot-path to the failing property (e.g. `'data.Title'`) |
| `message` | `string` | Description of the validation failure |
| `value` | `*` | The actual value that failed validation |

## Examples

### Successful validation

```javascript
meadow.setJsonSchema({
	"title": "Book",
	"type": "object",
	"properties": {
		"Title": { "type": "string", "minLength": 1 },
		"PageCount": { "type": "integer", "minimum": 1 }
	},
	"required": ["Title"]
});

var tmpResult = meadow.validateObject({
	Title: 'Dune',
	PageCount: 412
});

console.log(tmpResult.Valid); // true
```

### Failed validation

```javascript
var tmpResult = meadow.validateObject({
	PageCount: -5
});

console.log(tmpResult.Valid);  // false
console.log(tmpResult.Errors);
// [
//   { field: 'data.Title', message: 'is required', ... },
//   { field: 'data.PageCount', message: 'is less than minimum', value: -5, ... }
// ]
```

### Validate before create

```javascript
var tmpRecord = { Title: 'Neuromancer', Author: 'Gibson' };
var tmpValidation = meadow.validateObject(tmpRecord);

if (!tmpValidation.Valid)
{
	console.error('Validation errors:', tmpValidation.Errors);
	return;
}

var tmpQuery = meadow.query.addRecord(tmpRecord);
meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		console.log('Created:', pRecord);
	});
```

## Notes

- `setJsonSchema()` must be called before `validateObject()` for meaningful
  validation. If no JSON Schema has been set, the validator may produce
  unexpected results.

- `validateObject` is the same function reference on both `meadow` and
  `meadow.schemaFull`. Both point to the same underlying validator.

- Meadow does **not** automatically validate records during `doCreate` or
  `doUpdate`. Validation must be called explicitly by application code.

- The validator uses JSON Schema draft-04 semantics.
