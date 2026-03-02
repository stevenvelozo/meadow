# marshalRecordFromSourceToObject

Convert a raw database record into a plain JavaScript object using the schema
and default object template.

## Signature

```javascript
meadow.marshalRecordFromSourceToObject(pRecord)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pRecord` | `Object` | A raw database record as returned by the provider |

## Returns

| Type | Description |
|------|-------------|
| `Object` | A plain JavaScript object with all schema columns populated |

## Description

`marshalRecordFromSourceToObject` performs a two-step conversion:

1. **Clone the default object** -- Creates a shallow copy of the default object
   template (set via `setDefault`), ensuring all schema columns have initial
   values.

2. **Overlay provider values** -- Calls the active provider's
   `marshalRecordFromSourceToObject` method to map raw database values onto
   the cloned object according to the column schema.

This guarantees a consistent object shape regardless of what the database
returned. Missing or null columns fall back to the default values.

## Examples

### Basic usage

```javascript
// Assume a raw database row from the provider
var tmpRawRow = {
	IDBook: 42,
	GUIDBook: '0xABCDE-12345',
	Title: 'Dune',
	Author: 'Herbert',
	PageCount: 412,
	Created: '2024-01-15T10:30:00Z',
	CreatingIDUser: 1,
	Modified: null,
	ModifyingIDUser: null,
	Deleted: 0,
	DeletingIDUser: 0,
	DeleteDate: null
};

var tmpRecord = meadow.marshalRecordFromSourceToObject(tmpRawRow);
console.log(tmpRecord.Title);     // 'Dune'
console.log(tmpRecord.Modified);  // '' (from default, since DB returned null)
```

### Used internally by CRUD methods

```javascript
// You typically do not call this directly.
// It is called automatically by doCreate, doRead, doReads, and doUpdate
// when marshalling results back to the caller.

meadow.doRead(tmpQuery,
	function (pError, pQuery, pRecord)
	{
		// pRecord has already been marshalled
		console.log(pRecord);
	});
```

## Notes

- This method is called internally by `doCreate`, `doRead`, `doReads`, and
  `doUpdate`. Direct use is uncommon but available for custom scenarios.

- The returned object is a new plain object, not a reference to the default
  object or the original database row.

- The provider's marshalling logic handles type-specific conversions (e.g.,
  date formatting, numeric parsing) depending on the database backend.

- If `setDefault` has not been called, the base object is an empty `{}` and
  only columns present in the database row will appear on the result.
