# doReads

Read multiple records from the data source and return them as an array of
marshalled plain objects.

## Signature

```javascript
meadow.doReads(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with filters, pagination, and sort options |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pQuery, pRecords)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pQuery` | `Object` | The FoxHound query used for the read operation |
| `pRecords` | `Array` | Array of marshalled record objects (empty array if none found) |

## Returns

Returns the Meadow instance for chaining.

## Description

`doReads` executes a two-step asynchronous waterfall:

1. **Read** -- The provider's `Read` method executes the query. If a `Reads`
   raw query override is set via `rawQueries.setQuery('Reads', ...)`, it is
   used instead of the auto-generated query.

2. **Marshal and profile** -- Each returned row is converted to a plain
   JavaScript object via `marshalRecordFromSourceToObject` and pushed into an
   array. After the provider returns, the elapsed time is checked against the
   `QueryThresholdWarnTime` setting (default 200ms). If the query exceeded the
   threshold, `logSlowQuery` emits a warning.

Soft-deleted records are excluded by default unless delete tracking is disabled
on the query.

## Examples

### Read all records (with default cap)

```javascript
var tmpQuery = meadow.query;

meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		if (pError)
		{
			console.error('Reads error:', pError);
			return;
		}
		console.log('Found', pRecords.length, 'records');
		pRecords.forEach(function (pRecord)
		{
			console.log('-', pRecord.Title);
		});
	});
```

### Read with filters and pagination

```javascript
var tmpQuery = meadow.query
	.addFilter('Author', 'Tolkien')
	.setCap(10)
	.setBegin(0)
	.addSort({ Column: 'Title', Direction: 'ASC' });

meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		console.log('Page 1:', pRecords.length, 'results');
	});
```

### Read with specific data elements

```javascript
var tmpQuery = meadow.query
	.setDataElements(['IDBook', 'Title', 'Author']);

meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		// Each record will have only the requested columns
		// (plus any columns derived from the default object)
		console.log(pRecords);
	});
```

### Read with custom slow query threshold

```javascript
// In Fable settings:
// { QueryThresholdWarnTime: 500 }

var tmpQuery = meadow.query
	.addFilter('Genre', 'Fantasy');

meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		// Queries taking longer than 500ms will trigger a warning log
		console.log(pRecords.length, 'records');
	});
```

## Notes

- The `Reads` raw query override is **separate** from the `Read` override. Set
  it via `meadow.rawQueries.setQuery('Reads', pQueryString)`.

- Slow query profiling measures elapsed wall time from the start of `doReads`
  through provider completion. The threshold defaults to 200ms and can be
  configured via the `QueryThresholdWarnTime` Fable setting.

- Each record in the result array is independently marshalled through the
  default object template, so all schema columns are present on every record.

- An empty result set returns an empty array `[]`, not `false`. This differs
  from `doRead` which returns `false` for no results.
