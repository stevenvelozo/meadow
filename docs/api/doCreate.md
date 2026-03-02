# doCreate

Insert a new record into the data source, read it back, and return the
marshalled result.

## Signature

```javascript
meadow.doCreate(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with at least one record added via `addRecord()` |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pCreateQuery, pReadQuery, pRecord)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pCreateQuery` | `Object` | The FoxHound query used for the INSERT operation |
| `pReadQuery` | `Object` | The FoxHound query used for the read-back operation |
| `pRecord` | `Object\|false` | The marshalled record, or `false` on failure |

## Returns

Returns the Meadow instance for chaining.

## Description

`doCreate` executes a four-step asynchronous waterfall:

1. **GUID uniqueness check** -- If the record contains a GUID column value
   (the `defaultGUIdentifier`, e.g. `GUIDBook`) that is at least 5 characters
   long, Meadow reads the data source to confirm no existing record has that
   GUID. If a duplicate is found, the callback receives an error.

2. **Insert** -- The record is merged with the default object template so that
   all schema columns have values. The `IDUser` is set automatically from
   either `pQuery.userID` or `meadow.userIdentifier` when not already present
   on the query. The provider's `Create` method executes the insert.

3. **Read back** -- After a successful insert, the newly created record is read
   from the data source using the returned primary key value. If a `Read` raw
   query override is set, it is used for this step.

4. **Marshal** -- The raw database row is converted to a plain JavaScript
   object via `marshalRecordFromSourceToObject`.

## Examples

### Basic create

```javascript
var tmpQuery = meadow.query
	.addRecord({ Title: 'The Hobbit', Author: 'Tolkien' });

meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		if (pError)
		{
			console.error('Create failed:', pError);
			return;
		}
		console.log('New record ID:', pRecord.IDBook);
	});
```

### Create with a specific GUID

```javascript
var tmpQuery = meadow.query
	.addRecord({
		GUIDBook: '0x12345-abcde-67890',
		Title: 'Dune'
	});

meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		if (pError)
		{
			// Error if GUID already exists
			console.error(pError);
			return;
		}
		console.log('Created with GUID:', pRecord.GUIDBook);
	});
```

### Create with explicit user ID on the query

```javascript
var tmpQuery = meadow.query
	.setIDUser(42)
	.addRecord({ Title: 'Neuromancer' });

meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		// CreatingIDUser will be 42
		console.log(pRecord);
	});
```

## Notes

- The query **must** have a record added via `addRecord()` before calling
  `doCreate`. If `pQuery.query.records` is falsy, the callback receives
  `'No record submitted'`.

- GUID uniqueness is only checked when the GUID value is at least 5 characters
  long. Shorter values or empty strings skip the check.

- The default object template (set via `setDefault`) is merged into the record
  before insert, ensuring all schema columns have initial values.

- `Create` raw query overrides are **not** supported. The comment in the source
  notes that create overrides are too complex. However, `Read` raw query
  overrides **are** used during the read-back step.

- The `IDUser` resolution order is: `pQuery.query.IDUser` (if already set) >
  `pQuery.userID` (if a non-negative integer) > `meadow.userIdentifier`
  (fallback).
