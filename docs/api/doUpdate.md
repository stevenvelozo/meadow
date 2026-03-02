# doUpdate

Update an existing record in the data source, read it back, and return the
marshalled result.

## Signature

```javascript
meadow.doUpdate(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with a record containing the primary key and fields to update |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pUpdateQuery, pReadQuery, pRecord)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pUpdateQuery` | `Object` | The FoxHound query used for the UPDATE operation |
| `pReadQuery` | `Object` | The FoxHound query used for the read-back operation |
| `pRecord` | `Object\|false` | The marshalled record after update, or `false` on failure |

## Returns

Returns the Meadow instance for chaining.

## Description

`doUpdate` executes a four-step asynchronous waterfall:

1. **Validate and prepare** -- Confirms that `pQuery.query.records` exists and
   that the first record contains the `defaultIdentifier` column (e.g.
   `IDBook`). The `IDUser` is set automatically from either `pQuery.userID` or
   `meadow.userIdentifier` when not already present. Schema columns with type
   `UpdateDate` and `UpdateIDUser` are reset to `false` so the provider can
   auto-populate them (unless `disableAutoDateStamp` or `disableAutoUserStamp`
   is set on the query). A filter is added for the primary key value, and a
   safety check aborts if no filters are present.

2. **Update** -- The provider's `Update` method executes the update query.

3. **Read back** -- The updated record is read from the data source using the
   same filters. If a `Read` raw query override is set, it is used.

4. **Marshal** -- The raw database row is converted to a plain JavaScript
   object via `marshalRecordFromSourceToObject`.

## Examples

### Basic update

```javascript
var tmpQuery = meadow.query
	.addRecord({ IDBook: 42, Title: 'The Hobbit (Revised)' });

meadow.doUpdate(tmpQuery,
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		if (pError)
		{
			console.error('Update failed:', pError);
			return;
		}
		console.log('Updated title:', pRecord.Title);
	});
```

### Partial update

```javascript
// Only update the Author column; other columns are untouched
var tmpQuery = meadow.query
	.addRecord({ IDBook: 42, Author: 'J.R.R. Tolkien' });

meadow.doUpdate(tmpQuery,
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		console.log('Full record after update:', pRecord);
	});
```

### Update with explicit user ID

```javascript
var tmpQuery = meadow.query
	.setIDUser(7)
	.addRecord({ IDBook: 42, Title: 'Updated Title' });

meadow.doUpdate(tmpQuery,
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		// ModifyingIDUser will be 7
		console.log(pRecord.ModifyingIDUser);
	});
```

## Notes

- The record **must** include the `defaultIdentifier` column (e.g. `IDBook`).
  Without it, the callback receives `'Automated update missing default
  identifier'`.

- **Safety check**: If no filters are present on the query after adding the
  primary key filter, the update is aborted with
  `'Automated update missing filters... aborting!'`. This prevents accidental
  updates to every row in the table.

- `Update` raw query overrides are **not** supported. The source notes this
  feature is deferred due to complexity. However, `Read` raw query overrides
  **are** used during the read-back step.

- Schema columns with type `UpdateDate` are reset before the update so the
  provider can populate them with the current timestamp. Columns with type
  `UpdateIDUser` are reset so the provider can stamp the current user. This
  automatic behavior can be disabled per-query with `disableAutoDateStamp` and
  `disableAutoUserStamp`.

- Partial updates are supported. Only the columns present in the record
  (besides the primary key) are modified. The read-back returns the complete
  record.
