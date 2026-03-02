# doRead

Read a single record from the data source and return it as a marshalled plain
object.

## Signature

```javascript
meadow.doRead(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with filters set to identify the target record |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pQuery, pRecord)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pQuery` | `Object` | The FoxHound query used for the read operation |
| `pRecord` | `Object\|false` | The marshalled record, or `false` if no record was found |

## Returns

Returns the Meadow instance for chaining.

## Description

`doRead` executes a two-step asynchronous waterfall:

1. **Read** -- The provider's `Read` method executes the query. If a `Read`
   raw query override is set via `rawQueries.setQuery('Read', ...)`, it is
   used instead of the auto-generated query.

2. **Marshal** -- If at least one record is returned, the first row is
   converted to a plain JavaScript object via `marshalRecordFromSourceToObject`.
   If no rows match, `pRecord` is `false` (not an error).

Soft-deleted records (those with `Deleted = 1`) are excluded by default unless
delete tracking has been explicitly disabled on the query via
`setDisableDeleteTracking(true)`.

## Examples

### Read by primary key

```javascript
var tmpQuery = meadow.query
	.addFilter('IDBook', 42);

meadow.doRead(tmpQuery,
	function (pError, pQuery, pRecord)
	{
		if (pError)
		{
			console.error('Read error:', pError);
			return;
		}
		if (!pRecord)
		{
			console.log('No record found');
			return;
		}
		console.log('Title:', pRecord.Title);
	});
```

### Read by GUID

```javascript
var tmpQuery = meadow.query
	.addFilter('GUIDBook', '0x12345-abcde-67890');

meadow.doRead(tmpQuery,
	function (pError, pQuery, pRecord)
	{
		if (pRecord)
		{
			console.log('Found:', pRecord.Title);
		}
	});
```

### Read including soft-deleted records

```javascript
var tmpQuery = meadow.query
	.addFilter('IDBook', 99)
	.setDisableDeleteTracking(true);

meadow.doRead(tmpQuery,
	function (pError, pQuery, pRecord)
	{
		if (pRecord)
		{
			console.log('Deleted?', pRecord.Deleted);
		}
	});
```

## Notes

- When no record is found, `pRecord` is `false` and `pError` is `undefined`
  (not an error condition). Always check for a falsy record.

- `doRead` returns only the **first** matching record. To read multiple records,
  use [doReads](doReads.md).

- The `Read` raw query override applies to this method. Set it via
  `meadow.rawQueries.setQuery('Read', pQueryString)`.

- The returned object is built from the default object template overlaid with
  provider-marshalled values, so all schema columns are present even if the
  database row has nulls.
