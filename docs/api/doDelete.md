# doDelete

Delete a record from the data source. Uses soft delete when the schema includes
a `Deleted` column, otherwise performs a hard delete.

## Signature

```javascript
meadow.doDelete(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with filters identifying the record(s) to delete |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pQuery, pCount)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pQuery` | `Object` | The FoxHound query used for the delete operation |
| `pCount` | `number` | The number of affected records |

## Returns

Returns the Meadow instance for chaining.

## Description

`doDelete` executes a single-step asynchronous waterfall:

1. **Delete** -- If a `Delete` raw query override is set via
   `rawQueries.setQuery('Delete', ...)`, it is used. Otherwise, the provider's
   `Delete` method executes the query. The provider determines the actual SQL
   based on the schema:

   - **Soft delete**: If the schema contains a column with type `Deleted`, the
     provider issues `UPDATE {Scope} SET Deleted=1, DeleteDate=NOW(),
     DeletingIDUser={IDUser} WHERE ...`.
   - **Hard delete**: If no `Deleted` column exists, the provider issues
     `DELETE FROM {Scope} WHERE ...`.

## Examples

### Delete by primary key

```javascript
var tmpQuery = meadow.query
	.addFilter('IDBook', 42);

meadow.doDelete(tmpQuery,
	function (pError, pQuery, pCount)
	{
		if (pError)
		{
			console.error('Delete failed:', pError);
			return;
		}
		console.log('Deleted', pCount, 'record(s)');
	});
```

### Delete with a custom raw query

```javascript
meadow.rawQueries.setQuery('Delete',
	'UPDATE Book SET Deleted=1, DeleteDate=NOW() WHERE IDBook = :IDBook AND OwnerIDUser = :IDUser');

var tmpQuery = meadow.query
	.addFilter('IDBook', 42);

meadow.doDelete(tmpQuery,
	function (pError, pQuery, pCount)
	{
		console.log('Custom delete affected', pCount, 'record(s)');
	});
```

## Notes

- Soft delete is automatic when the schema includes `{ Column: 'Deleted',
  Type: 'Deleted' }`. No configuration is needed beyond the schema definition.

- After a soft delete, the record still exists in the database with
  `Deleted = 1`. Subsequent `doRead` and `doReads` calls will exclude it by
  default (unless `setDisableDeleteTracking(true)` is set on the query).

- Use [doUndelete](doUndelete.md) to restore a soft-deleted record.

- The `Delete` raw query override applies to this method. Set it via
  `meadow.rawQueries.setQuery('Delete', pQueryString)`.

- Hard deletes are irreversible. Only schemas without a `Deleted` column
  trigger hard deletes.
