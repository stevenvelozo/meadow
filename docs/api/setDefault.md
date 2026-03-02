# setDefault

Set the default object template used when creating and marshalling records.

## Signature

```javascript
meadow.setDefault(pDefault)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pDefault` | `Object` | A plain object with default values for all columns |

## Returns

Returns the Meadow instance for chaining.

## Description

`setDefault` sets the template object that is used in two places:

1. **During `doCreate`** -- The default object is merged with the submitted
   record before insertion, ensuring that all schema columns have values even if
   the caller omitted them.

2. **During marshalling** -- When `marshalRecordFromSourceToObject` converts a
   database row to a plain object, it starts with a copy of the default object
   and overlays the provider-marshalled values.

This ensures consistent object shapes throughout the application, regardless of
whether the database returned null columns or the caller submitted a partial
record.

## Examples

### Set default values

```javascript
meadow.setDefault({
	IDBook: 0,
	GUIDBook: '',
	Title: '',
	Author: 'Unknown',
	PageCount: 0,
	Created: '',
	CreatingIDUser: 0,
	Modified: '',
	ModifyingIDUser: 0,
	Deleted: 0,
	DeletingIDUser: 0,
	DeleteDate: ''
});
```

### Effect on create

```javascript
meadow.setDefault({ Title: 'Untitled', Author: 'Unknown', PageCount: 0 });

var tmpQuery = meadow.query
	.addRecord({ Title: 'Dune' });

meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		// pRecord.Author will be 'Unknown' (from defaults)
		// pRecord.Title will be 'Dune' (from submitted record)
		// pRecord.PageCount will be 0 (from defaults)
		console.log(pRecord);
	});
```

### Access via schemaFull

```javascript
console.log(meadow.schemaFull.defaultObject);
// { IDBook: 0, GUIDBook: '', Title: '', ... }
```

## Notes

- If `pDefault` is not an object, it falls back to an empty object `{}`.

- The default object is accessible through `meadow.schemaFull.defaultObject`.

- When loading from a package file or object, the `DefaultObject` property
  of the package is passed to `setDefault` automatically.
