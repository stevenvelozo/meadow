# doUndelete

Restore a soft-deleted record by setting its `Deleted` flag back to `0`.

## Signature

```javascript
meadow.doUndelete(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with filters identifying the record(s) to restore |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pQuery, pCount)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pQuery` | `Object` | The FoxHound query used for the undelete operation |
| `pCount` | `number` | The number of affected records |

## Returns

Returns the Meadow instance for chaining.

## Description

`doUndelete` executes a single-step asynchronous waterfall:

1. **Undelete** -- If an `Undelete` raw query override is set via
   `rawQueries.setQuery('Undelete', ...)`, it is used. Otherwise, the
   provider's `Undelete` method executes the query, issuing
   `UPDATE {Scope} SET Deleted=0 WHERE ...`.

The `DeleteDate` and `DeletingIDUser` columns are preserved as historical
records of the previous deletion. They are **not** cleared during an undelete
operation.

## Examples

### Undelete by primary key

```javascript
var tmpQuery = meadow.query
	.addFilter('IDBook', 42)
	.setDisableDeleteTracking(true);

meadow.doUndelete(tmpQuery,
	function (pError, pQuery, pCount)
	{
		if (pError)
		{
			console.error('Undelete failed:', pError);
			return;
		}
		console.log('Restored', pCount, 'record(s)');
	});
```

### Undelete with a custom raw query

```javascript
meadow.rawQueries.setQuery('Undelete',
	'UPDATE Book SET Deleted=0 WHERE IDBook = :IDBook AND DeletingIDUser = :IDUser');

var tmpQuery = meadow.query
	.addFilter('IDBook', 42);

meadow.doUndelete(tmpQuery,
	function (pError, pQuery, pCount)
	{
		console.log('Custom undelete affected', pCount, 'record(s)');
	});
```

## Notes

- `doUndelete` only applies to schemas that use soft deletion (those with a
  `Deleted` column). It has no effect on schemas configured for hard deletion.

- The `DeleteDate` and `DeletingIDUser` values remain on the record after
  undelete. This preserves the audit history of when and by whom the record was
  previously deleted.

- You may need to use `setDisableDeleteTracking(true)` on the query when
  building filters that target soft-deleted records, since the default behavior
  excludes records where `Deleted = 1`.

- The `Undelete` raw query override applies to this method. Set it via
  `meadow.rawQueries.setQuery('Undelete', pQueryString)`.
